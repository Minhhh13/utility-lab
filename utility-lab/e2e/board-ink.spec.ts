import {test,expect,type Page} from "@playwright/test";
import {readFile} from "node:fs/promises";
test.use({serviceWorkers:"block"});
const inkKey="utility-lab:board-ink:v1";
async function start(page:Page){await page.goto('/#board');await page.getByRole('button',{name:'Clear board',exact:true}).click();await page.getByRole('button',{name:'Draw (P)',exact:true}).click();}
async function ink(page:Page,name:string){await page.getByRole('button',{name:'Drawing colour',exact:true}).click();await page.getByRole('dialog',{name:'Drawing colour choices'}).getByRole('button',{name,exact:true}).click();}
async function draw(page:Page,offset=0){const points=await page.locator('svg.tb-map').evaluate((el:SVGSVGElement,dy)=>[{x:300,y:300+dy},{x:400,y:350+dy},{x:500,y:300+dy}].map(p=>{const s=new DOMPoint(p.x,p.y).matrixTransform(el.getScreenCTM()!);return{x:s.x,y:s.y};}),offset);await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(p.x,p.y,{steps:8});await page.mouse.up();return points[1];}
async function exported(page:Page){await page.locator('.tb-export summary').click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export tactic JSON',exact:true}).click();return JSON.parse(await readFile((await(await pending).path())!,'utf8'));}

test('each stroke retains its chosen colour, theme ink stays responsive, and one undo removes one stroke',async({page})=>{
 await start(page);const strokes=page.locator('[data-object-kind="pen"]');
 await ink(page,'Red');await draw(page);await ink(page,'Blue');await draw(page,100);await ink(page,'Theme default');await draw(page,200);
 await expect(strokes).toHaveCount(3);await expect(strokes.nth(0).locator('path').last()).toHaveAttribute('stroke','#f16b75');await expect(strokes.nth(1).locator('path').last()).toHaveAttribute('stroke','#72a7f5');await expect(strokes.nth(2).locator('path').last()).toHaveAttribute('stroke',/var\(--marker-pen/);
 const themed=strokes.nth(2).locator('path').last(),before=await themed.evaluate(el=>getComputedStyle(el).stroke);
 await page.locator('summary[aria-label="Appearance"]').click();await page.getByRole('button',{name:'Dark mode',exact:true}).click();
 await page.locator('summary[aria-label="Appearance"]').click();
 await expect.poll(()=>themed.evaluate(el=>getComputedStyle(el).stroke)).not.toBe(before);
 await expect(strokes.nth(0).locator('path').last()).toHaveAttribute('stroke','#f16b75');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(strokes).toHaveCount(2);await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(strokes).toHaveCount(3);
 const file=await exported(page);expect(file.plan.objects.map((r:{color?:string})=>r.color)).toEqual(['#f16b75','#72a7f5',undefined]);
 await expect(page.locator('.tactic-board')).not.toHaveClass(/has-inspector/);
});

test('recolouring a selected drawing is one undo and future ink persists across reload',async({page})=>{
 await start(page);await ink(page,'Red');const hit=await draw(page);await page.getByRole('button',{name:'Select / move (V)',exact:true}).click();await page.mouse.click(hit.x,hit.y);
 await ink(page,'Purple');const path=page.locator('[data-object-kind="pen"] path').last();await expect(path).toHaveAttribute('stroke','#b79afa');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(path).toHaveAttribute('stroke','#f16b75');await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(path).toHaveAttribute('stroke','#b79afa');
 await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}').pen,inkKey)).toBe('#b79afa');
 await page.reload();await page.getByRole('button',{name:'Draw (P)',exact:true}).click();await draw(page,120);await expect(page.locator('[data-object-kind="pen"] path').last()).toHaveAttribute('stroke','#b79afa');await expect(page.locator('.tactic-board')).not.toHaveClass(/has-inspector/);
});

test('colour choices fit a 320px phone with 44px targets, outside/Escape dismissal and focus return',async({page},info)=>{
 await page.setViewportSize({width:320,height:844});await start(page);const trigger=page.getByRole('button',{name:'Drawing colour',exact:true});await trigger.click();const choices=page.getByRole('dialog',{name:'Drawing colour choices'});await expect(choices).toBeVisible();const box=(await choices.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(320);
 for(const button of await choices.getByRole('button').all()){const b=(await button.boundingBox())!;expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}
 await page.screenshot({path:info.outputPath('ink-320.png')});await page.keyboard.press('Escape');await expect(choices).not.toBeVisible();await expect(trigger).toBeFocused();await trigger.click();await page.locator('svg.tb-map').click({position:{x:30,y:30}});await expect(choices).not.toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);await expect(page.locator('.tactic-board')).not.toHaveClass(/has-inspector/);
});

test('malformed ink preferences fall back safely and storage failure does not block drawing',async({page})=>{
 await page.addInitScript(key=>{localStorage.setItem(key,JSON.stringify({pen:'url(javascript:bad)',route:'#fff'}));const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('Blocked','QuotaExceededError');original.call(this,k,v);};},inkKey);
 await start(page);await draw(page);await expect(page.locator('[data-object-kind="pen"] path').last()).toHaveAttribute('stroke',/var\(--marker-pen/);await ink(page,'Green');await draw(page,100);await expect(page.locator('[data-object-kind="pen"] path').last()).toHaveAttribute('stroke','#79c99e');
});
