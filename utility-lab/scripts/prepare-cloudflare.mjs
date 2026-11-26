import assert from 'node:assert/strict';
import { LAUNCH_SCENES } from '../src/launch-scenes.ts';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Publish the complete tested, filtered static release. Never copy the working
// tree, local credentials, runtime output or unused framework scaffolding.
const app = fileURLToPath(new URL('../',import.meta.url));
const releases = path.join(app,'outputs','releases')+path.sep;
const release = JSON.parse(await readFile(path.join(releases,'latest-package.json'),'utf8'));
const releaseRoot = path.resolve(release.directory);
assert.ok(releaseRoot.startsWith(path.resolve(releases)+path.sep),'Release must be inside this workspace');
const checks = JSON.parse(await readFile(path.join(app,'outputs','checks','latest.json'),'utf8'));
assert.equal(checks.passed,true,'Complete the production checks before preparing a public release');
const stamp = new Date().toISOString().replace(/[-:.]/g,'');
const output = path.join(app,'outputs','cloudflare');
const directory = path.join(output,`site-${stamp}`);
await mkdir(directory,{recursive:true});
let baseFiles=0,bytes=0,largestBytes=0;
const copiedSizes=new Map();
const digest = body => createHash('sha256').update(body).digest('hex');
async function copyVerified(relative='') {
  const from = path.join(releaseRoot,'dist',relative);
  for(const entry of await readdir(from,{withFileTypes:true})) {
    assert.ok(!entry.isSymbolicLink(),'Release symlinks are not deployable');
    const rel = path.join(relative,entry.name);
    const destination = path.join(directory,rel);
    if(entry.isDirectory()) {await mkdir(destination,{recursive:true});await copyVerified(rel);continue;}
    assert.ok(entry.isFile(),'Only ordinary static release files may be deployed');
    assert.ok(!/(?:^|[\\/])(?:\.env[^\\/]*|\.wrangler|\.git|_worker\.js|functions)(?:[\\/]|$)/.test(rel),'Unexpected private or server file');
    const body = await readFile(path.join(from,entry.name));
    assert.equal(digest(body),digest(await readFile(path.join(app,'dist',rel))),`Rebuild/package before publishing changed asset: ${rel}`);
    assert.ok(body.length <= 25*1024*1024,`Cloudflare Pages file-size limit: ${rel}`);
    await copyFile(path.join(from,entry.name),destination);
    copiedSizes.set(rel.split(path.sep).join('/'),body.length);
    baseFiles++;bytes+=body.length;largestBytes=Math.max(largestBytes,body.length);
  }
}
await copyVerified();
assert.equal(baseFiles,release.files,'Package file inventory changed');
let files=baseFiles;
for(const name of ['_headers','404.html']) {
  const body=await readFile(path.join(app,'public',name));
  await writeFile(path.join(directory,name),body);
  if(!copiedSizes.has(name)) files++;
  bytes+=body.length-(copiedSizes.get(name)||0);
}
assert.ok(files<=20_000,'Cloudflare Pages free file-count limit');
const headers=await readFile(path.join(directory,'_headers'),'utf8');
const localServer=await readFile(path.join(app,'scripts','serve-local.mjs'),'utf8');
const policy=localServer.match(/const csp\s*=\s*"([^\"]+)"/s)?.[1];
assert.ok(policy,'Expected local CSP declaration');
assert.ok(headers.includes(`Content-Security-Policy: ${policy}`),'Hosted CSP must match the verified local policy');
assert.ok(headers.split(/\r?\n/).every(line=>line.length<=2000),'Cloudflare header-line limit');
const homeArt = [...LAUNCH_SCENES.flatMap(scene => [scene.src, scene.thumbnail]).map(url=>url.slice(1)), 'art/credits.txt'].sort();
assert.deepEqual([...copiedSizes.keys()].filter(key=>key.startsWith('art/')).sort(), homeArt, 'Home must contain all map scenes, previews and credits');
for(const removed of ['maps/cs_office.png']) {
  const entries=await readdir(path.join(directory,path.dirname(removed)));
  assert.ok(!entries.includes(path.basename(removed)),`Removed content must stay excluded: ${removed}`);
}
const prepared={createdAt:new Date().toISOString(),directory,sourceRelease:releaseRoot,verifiedBaseFiles:baseFiles,files,bytes,largestBytes,headersSha256:digest(headers),checksFinishedAt:checks.finishedAt};
await writeFile(path.join(output,'latest-prepared.json'),JSON.stringify(prepared,null,2));
console.log(JSON.stringify(prepared,null,2));
