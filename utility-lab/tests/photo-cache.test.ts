import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";

const source=await readFile(new URL("../public/sw.js",import.meta.url),"utf8");
const host="https://d1ntlvfrxziqo6.cloudfront.net";
const photo=(number:number)=>`${host}/photo-${number}.webp`;
class TestResponse {
  ok:boolean;type:string;value:string;
  constructor(value="image",options:{ok?:boolean;type?:string}={}) {this.value=value;this.ok=options.ok??true;this.type=options.type??"opaque";}
  clone(){return new TestResponse(this.value,{ok:this.ok,type:this.type});}
  async json(){return JSON.parse(this.value);}
}
class TestCache {
  entries=new Map<string,TestResponse>();
  quotaFailures=0;
  photoPuts:string[]=[];
  private writeGate:Promise<void>|undefined;
  private photoPutStarted:(()=>void)|undefined;
  holdPhotoWrites(){
    let release!:()=>void,start!:()=>void;
    this.writeGate=new Promise<void>(resolve=>{release=resolve;});
    const started=new Promise<void>(resolve=>{start=resolve;});
    this.photoPutStarted=start;
    return {started,release};
  }
  async match(key:string|{url:string}){return this.entries.get(typeof key==="string"?key:key.url)?.clone();}
  async keys(){return [...this.entries.keys()].map(url=>({url}));}
  async delete(key:string|{url:string}){return this.entries.delete(typeof key==="string"?key:key.url);}
  async put(key:string|{url:string},response:TestResponse){
    const url=typeof key==="string"?key:key.url;
    if(url.startsWith(host)) {
      this.photoPuts.push(url);
      this.photoPutStarted?.();
      await this.writeGate;
    }
    if(this.quotaFailures>0){this.quotaFailures--;throw Object.assign(new Error("Full"),{name:"QuotaExceededError"});}
    this.entries.set(url,response.clone());
  }
}
async function worker(){
  const listeners=new Map<string,(event:any)=>void>();
  const stores=new Map<string,TestCache>();
  const requests:{url:string;cache?:string}[]=[];
  let blocked=false,unavailable=false,response=new TestResponse();
  const sandbox={
    URL,Promise,Map,Date,JSON,
    Response:TestResponse,
    Request:class {url:string;cache?:string;constructor(request:{url:string},options:{cache?:string}){this.url=request.url;this.cache=options.cache;}},
    self:{location:{origin:"https://utilitylab.au"},clients:{claim:async()=>{}},addEventListener:(name:string,listener:(event:any)=>void)=>listeners.set(name,listener)},
    caches:{open:async(name:string)=>{if(unavailable)throw new Error("Storage unavailable");let cache=stores.get(name);if(!cache){cache=new TestCache();stores.set(name,cache);}return cache;},keys:async()=>[...stores.keys()],delete:async(name:string)=>stores.delete(name)},
    fetch:async(request:{url:string;cache?:string})=>{requests.push({url:request.url,cache:request.cache});if(blocked)throw new Error("Offline");return response.clone();},
  };
  const context=vm.createContext(sandbox);
  vm.runInContext(source,context);
  async function invoke(kind:string,input:Record<string,unknown>){
    const tasks:Promise<unknown>[]=[];
    let result:Promise<TestResponse>|undefined;
    const event={...input,ports:[],waitUntil:(task:Promise<unknown>)=>tasks.push(task),respondWith:(task:Promise<TestResponse>)=>{result=task;}};
    listeners.get(kind)!(event);
    const value=result?await result:undefined;
    await Promise.all(tasks);
    return value;
  }
  return {
    requests,stores,
    load:(url:string,destination="image",clientId="")=>invoke("fetch",{clientId,request:{url,destination,method:"GET",mode:"no-cors"}}),
    confirm:(url:string,clientId="")=>invoke("message",{source:{id:clientId},data:{type:"CACHE_PHOTO_CONFIRMED",url}}),
    retry:(url:string,clientId="")=>invoke("message",{source:{id:clientId},data:{type:"CACHE_PHOTO_RETRY",url}}),
    activate:()=>invoke("activate",{}),
    offline:(value:boolean)=>{blocked=value;},
    storageUnavailable:(value:boolean)=>{unavailable=value;},
    response:(value:TestResponse)=>{response=value;},
    pendingPhotoCount:()=>vm.runInContext("pendingPhotos.size",context) as number,
  };
}

test("remote photo persists only after successful viewer decode and serves an offline repeat without another fetch",async()=>{
  const w=await worker(),url=photo(1);
  await w.load(url);
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  assert.equal(await cache.match(url),undefined,"An opaque response is not proof of a valid image");
  await w.confirm(url);
  assert.ok(await cache.match(url));
  w.offline(true);
  assert.equal((await w.load(url))?.value,"image");
  assert.equal(w.requests.length,1,"No proxy, preload, refresh or extra validation fetch");
});

test("a broken image is never persisted, and Retry evicts a confirmed entry before a reload request",async()=>{
  const w=await worker(),url=photo(2);
  w.response(new TestResponse("not an image"));
  await w.load(url);
  await w.retry(url);
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  assert.equal(await cache.match(url),undefined);
  await w.confirm(url);
  assert.equal(await cache.match(url),undefined,"Late decode confirmation cannot revive a failed pending response");
  w.response(new TestResponse("valid image"));
  await w.load(url);await w.confirm(url);
  assert.equal(w.requests.at(-1)?.cache,"reload");
  await w.retry(url);
  assert.equal(await cache.match(url),undefined);
  await w.load(url);await w.confirm(url);
  assert.equal(w.requests.length,3);
  assert.equal((await cache.match(url))?.value,"valid image");
});

test("viewed photo storage is bounded to twelve images and expires entries after seven days",async()=>{
  const w=await worker();
  for(let i=0;i<13;i++){await w.load(photo(i));await w.confirm(photo(i));}
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  const cachedPhotos=(await cache.keys()).filter(key=>key.url.startsWith(host));
  assert.equal(cachedPhotos.length,12);
  assert.equal(await cache.match(photo(0)),undefined,"Least recently used photo leaves both storage and metadata");
  const meta=[...cache.entries].find(([key])=>key.includes(encodeURIComponent(photo(12))))!;
  const old=await meta[1].json();
  cache.entries.set(meta[0],new TestResponse(JSON.stringify({...old,savedAt:Date.now()-8*24*60*60*1000})));
  const before=w.requests.length;
  await w.load(photo(12));
  assert.equal(w.requests.length,before+1,"Expired source photo is reloaded, not served stale forever");
});

test("slow storage keeps thirty confirmed photos bounded and discards evicted responses before writing",async()=>{
  const w=await worker();
  await w.load(photo(0));
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  const held=cache.holdPhotoWrites();
  const confirmations=[w.confirm(photo(0))];
  await held.started;
  for(let i=1;i<30;i++) {
    await w.load(photo(i));
    confirmations.push(w.confirm(photo(i)));
  }
  assert.equal(cache.photoPuts.length,1,"Only one response is retained by an active write");
  assert.equal(w.pendingPhotoCount(),12,"Queued response bodies remain inside the bounded map");
  held.release();
  await Promise.all(confirmations);
  assert.deepEqual(cache.photoPuts,[photo(0),...Array.from({length:12},(_,i)=>photo(i+18))],
    "Evicted confirmation jobs retain no response to write later");
  assert.equal(w.pendingPhotoCount(),0);
  assert.equal((await cache.keys()).filter(key=>key.url.startsWith(host)).length,12);
  assert.equal(await cache.match(photo(17)),undefined);
  assert.equal(w.requests.length,30,"Persistence never issues a replacement or validation fetch");
});

test("a queued confirmation cannot persist a newer same-URL response before its own decode",async()=>{
  const w=await worker(),url=photo(1);
  await w.load(photo(0));
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  const held=cache.holdPhotoWrites();
  const blocker=w.confirm(photo(0));
  await held.started;
  w.response(new TestResponse("old decoded photo"));
  await w.load(url);
  const oldConfirmation=w.confirm(url);
  w.response(new TestResponse("new unconfirmed response"));
  await w.load(url);
  held.release();
  await Promise.all([blocker,oldConfirmation]);
  assert.equal(await cache.match(url),undefined,"The old token cannot authorize the replacement response");
  assert.deepEqual(cache.photoPuts,[photo(0)]);
  await w.confirm(url);
  assert.equal((await cache.match(url))?.value,"new unconfirmed response");
  assert.equal(w.requests.length,3);
});

test("a late decode confirmation from one client never confirms another client's bad opaque response",async()=>{
  const w=await worker(),url=photo(42);
  w.response(new TestResponse("valid image from client A"));
  await w.load(url,"image","client-A");
  w.response(new TestResponse("invalid opaque bytes from client B"));
  await w.load(url,"image","client-B");
  await w.confirm(url,"client-A");
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  assert.equal((await cache.match(url))?.value,"valid image from client A",
    "Only A's decoded response may be persisted by A's late message");
  await w.retry(url,"client-B");
  await w.confirm(url,"client-B");
  assert.equal(await cache.match(url),undefined,"B's failed response cannot be revived by a late message");
  w.response(new TestResponse("valid retried image from client B"));
  await w.load(url,"image","client-B");
  assert.equal(w.requests.at(-1)?.cache,"reload");
  await w.confirm(url,"client-B");
  w.offline(true);
  assert.equal((await w.load(url,"image","client-A"))?.value,"valid retried image from client B",
    "Decoded photos remain shared by URL on disk");
  assert.equal(w.requests.length,3);
});

test("Retry only clears its client's pending response and its reload cannot be consumed by another client",async()=>{
  const w=await worker(),url=photo(43);
  w.response(new TestResponse("valid pending A"));
  await w.load(url,"image","client-A");
  w.response(new TestResponse("failed pending B"));
  await w.load(url,"image","client-B");
  await w.retry(url,"client-B");
  await w.confirm(url,"client-A");
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  assert.equal((await cache.match(url))?.value,"valid pending A","B's failure must preserve A's pending response");
  assert.equal((await w.load(url,"image","client-A"))?.value,"valid pending A");
  assert.equal(w.requests.length,2,"A uses the shared decoded cache without consuming B's retry");
  w.response(new TestResponse("valid retried B"));
  await w.load(url,"image","client-B");
  assert.equal(w.requests.at(-1)?.cache,"reload","B still bypasses the cache for its own retry");
  await w.confirm(url,"client-B");
  assert.equal((await cache.match(url))?.value,"valid retried B");
  assert.equal(w.requests.length,3);
});

test("storage failure and quota exhaustion never prevent an image response",async()=>{
  const w=await worker();
  w.storageUnavailable(true);
  assert.equal((await w.load(photo(1)))?.value,"image");
  await w.confirm(photo(1));
  w.storageUnavailable(false);
  await w.load(photo(2));await w.confirm(photo(2));
  const cache=w.stores.get("ul-viewed-photos-v1")!;
  cache.quotaFailures=2;
  assert.equal((await w.load(photo(3)))?.value,"image");
  await w.confirm(photo(3));
  assert.equal(await cache.match(photo(3)),undefined,"Failed writes leave no unvalidated/orphan image");
  assert.equal(w.requests.length,3);
});

test("videos, arbitrary hosts and query-bearing/private image URLs bypass persistent photo caching",async()=>{
  const w=await worker();
  for(const url of [host+"/video.mp4","https://example.com/photo.webp",host+"/photo.webp?token=secret","https://user:password@d1ntlvfrxziqo6.cloudfront.net/photo.webp"]){
    assert.equal(await w.load(url),undefined);
    await w.confirm(url);
  }
  assert.equal(await w.load(photo(1),"video"),undefined);
  assert.equal(w.requests.length,0);
  assert.equal(w.stores.size,0);
});

test("app-shell service worker activation preserves the independently bounded viewed-photo cache",async()=>{
  const w=await worker();
  await w.load(photo(1));await w.confirm(photo(1));
  w.stores.set("utility-lab-v16",new TestCache());
  w.stores.set("utility-lab-v17",new TestCache());
  await w.activate();
  assert.equal(w.stores.has("utility-lab-v16"),false);
  assert.equal(w.stores.has("utility-lab-v17"),true);
  assert.ok(await w.stores.get("ul-viewed-photos-v1")!.match(photo(1)));
});
