import {test,expect,type BrowserContext,type Page} from "@playwright/test";
import {readFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {utilityPhotos,type UtilityReference} from "../src/utility-data";

const dust2:UtilityReference[]=JSON.parse(readFileSync("src/data/expanded/dust2.json","utf8"));
const guide=dust2.find(row=>row.id==="expanded-cs2tricks-dust2-car-from-long-barrels-6d24-t")!;
const photo=utilityPhotos(guide as UtilityReference)[0].image;
const path=`/#utilities?map=dust2&level=main&side=T&lineup=${guide.id}`;
test.use({serviceWorkers:"allow"});

async function readyWorker(page:Page){
  await page.goto("/#board");
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
}
async function hasCachedPhoto(page:Page){
  return page.evaluate(async url=>!!(await (await caches.open("ul-viewed-photos-v1")).match(url)),photo);
}
async function routePhoto(context:BrowserContext,brokenFirst=false){
  const body=await readFile("public/icons/icon-192.png");
  let requests=0;
  await context.route(/^https:\/\//,async route=>{
    if(route.request().url()!==photo) return route.abort();
    requests++;
    await route.fulfill({status:200,contentType:"image/png",body:brokenFirst&&requests===1?Buffer.from("not an image"):body,headers:{"Cache-Control":"no-store"}});
  });
  return ()=>requests;
}

test("a successfully viewed remote photo reopens offline from the bounded browser cache without another publisher request",async({page,context})=>{
  const requests=await routePhoto(context);
  await readyWorker(page);
  await page.goto(path);
  const image=page.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src",photo);
  await image.evaluate((element:HTMLImageElement)=>element.decode());
  await expect.poll(()=>hasCachedPhoto(page)).toBe(true);
  expect(requests()).toBe(1);
  await context.setOffline(true);
  await page.reload();
  await expect(image).toHaveAttribute("src",photo);
  await image.evaluate((element:HTMLImageElement)=>element.decode());
  await expect(image).toBeVisible();
  expect(requests()).toBe(1);
  await context.setOffline(false);
});

test("an opaque invalid image is not cached and the viewer Retry loads and confirms a fresh response",async({page,context})=>{
  const requests=await routePhoto(context,true);
  await readyWorker(page);
  await page.goto(path);
  await expect(page.getByRole("button",{name:"Retry photo",exact:true})).toBeVisible();
  expect(await hasCachedPhoto(page)).toBe(false);
  await page.getByRole("button",{name:"Retry photo",exact:true}).click();
  const image=page.locator(".ul-photo-canvas img");
  await expect(image).toHaveAttribute("src",photo);
  await image.evaluate((element:HTMLImageElement)=>element.decode());
  await expect.poll(()=>hasCachedPhoto(page)).toBe(true);
  expect(requests()).toBe(2);
});
