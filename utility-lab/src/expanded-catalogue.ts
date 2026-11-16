import type {UtilityReference} from './utility-data';
import {normalizeExpandedGuides} from './expanded-guide-model';
import index from './data/expanded/index.json' with { type: 'json' };
// Keep the catalogue as data: one compressed JSON asset per chosen map.
// URL imports do not download the assets or turn thousands of records into JS.
const files=import.meta.glob<string>([
 './data/expanded/*.json',
 '!./data/expanded/index.json',
 '!./data/expanded/bundled-photos.json',
],{query:'?url',import:'default',eager:true});
const pending=new Map<string,Promise<UtilityReference[]>>();
const cached=new Map<string,UtilityReference[]>();
export function cachedMapGuides(mapId:string):UtilityReference[]|undefined{return cached.get(mapId);}
export function loadMapGuides(mapId:string):Promise<UtilityReference[]>{
 const old=pending.get(mapId);if(old)return old;
 const url=files[`./data/expanded/${mapId}.json`];
 if(!url)return Promise.reject(Error('This map’s lineup catalogue could not load.'));
 const request=fetch(url).then(async response=>{
   if(!response.ok)throw Error('This map’s lineup catalogue could not load.');
   const guides=normalizeExpandedGuides(await response.json(),mapId);
   cached.set(mapId,guides);return guides;
 }).catch(error=>{pending.delete(mapId);throw error;});
 pending.set(mapId,request);return request;
}
export function expandedMapForId(id:string):string|undefined{return (index.ids as Record<string,string>)[id];}
export async function findExpandedGuide(id:string,mapId?:string):Promise<UtilityReference|undefined>{
 const map=expandedMapForId(id)||mapId;if(!map)return undefined;
 return (await loadMapGuides(map)).find(guide=>guide.id===id);
}
export async function loadLinkedGuides(ids:string[]):Promise<UtilityReference[]>{
 const maps=[...new Set(ids.flatMap(id=>expandedMapForId(id)||[]))];
 const records=await Promise.all(maps.map(loadMapGuides));const wanted=new Set(ids);
 return records.flat().filter(record=>wanted.has(record.id));
}
