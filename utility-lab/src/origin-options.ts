import type {UtilityReference} from './utility-data.ts';
import type {OriginPoint} from './lineup-origins.ts';
import {normalizeOriginLabel} from './lineup-curation.ts';
export {layoutOriginSpokes} from './origin-spokes.ts';

export type OriginOption={record:UtilityReference;point:OriginPoint};
export type OriginGroup={kind?:'origin';id:string;label:string;point:OriginPoint;options:OriginOption[]};
export type PersonalGuideOption={record:UtilityReference;target:{x:number;y:number;levelId:string}};
export type PersonalGuideGroup={kind:'personal';id:string;label:string;target:PersonalGuideOption['target'];options:PersonalGuideOption[]};
export type OriginChoiceGroup=OriginGroup|PersonalGuideGroup;

/** Fit the source positions into a square crop. Keep the numbered buttons on
 * the map coordinates only when every button has its own 44px touch target. */
export function spawnInsetLayout(group: OriginChoiceGroup, width: number) {
  if (group.kind === 'personal' || group.options.length < 2 || group.options.length > 8 ||
    !group.options.some(option => option.record.spawn && option.point.precision === 'world') ||
    group.options.filter(option => !option.record.spawn).length > 1) return;
  const coords = group.options.map(option => option.point);
  const xs = coords.map(point => point.x), ys = coords.map(point => point.y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  const usable = width - 64;
  if (usable <= 0) return;
  const span = Math.max(32, right-left, bottom-top) * width / usable;
  const x = (left + right - span) / 2, y = (top + bottom - span) / 2;
  const points = coords.map(point => ({x:(point.x-x)/span*width, y:(point.y-y)/span*width}));
  // The direct buttons have circular hit regions, including on diagonal rows.
  if (points.some((point,i) => points.slice(i+1).some(other =>
    Math.hypot(point.x-other.x,point.y-other.y) < 46))) return;
  return {x, y, span, points};
}
export type PersonalGuideMarker=PersonalGuideGroup&{displayX:number;displayY:number};
const personalBadgeOffsets=Array.from({length:25*25},(_,index)=>({x:index%25-12,y:Math.floor(index/25)-12}))
  .sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y||b.x-a.x||a.y-b.y);

/** Curation is for a quiet overview. It must never discard recipes after the
 * player has chosen an exact destination, especially numbered spawn variants. */
export function originRecipeOptions(records:readonly UtilityReference[]):UtilityReference[] {
  return [...new Map(records.map(record=>[record.id,record])).values()].sort((a,b)=>{
    if(a.spawn && b.spawn && a.spawn.family===b.spawn.family) return a.spawn.slot-b.spawn.slot || a.id.localeCompare(b.id,'en');
    return normalizeOriginLabel(a.from).localeCompare(normalizeOriginLabel(b.from),'en') ||
      (a.spawn?0:1)-(b.spawn?0:1) || a.from.localeCompare(b.from,'en',{numeric:true}) || a.id.localeCompare(b.id,'en');
  });
}

function groupLabel(options:OriginOption[]):string {
  const families=new Set(options.map(({record})=>normalizeOriginLabel(record.from)));
  if(families.size>1)return 'Nearby throws';
  const first=options[0].record;
  return first.spawn ? first.from.replace(/\s*#?\d+\s*$/,'').replace(/\b(CT|T)spawn\b/gi,'$1 Spawn') : first.from;
}

/** Group overlapping hit areas, rather than deleting their source records or
 * moving a standing pin to a fabricated world position. Every anchor is real. */
export function groupOriginOptions(options:readonly OriginOption[],mapUnit:number):OriginGroup[] {
  const groups:OriginGroup[]=[];
  const spacing=46*Math.max(.01,mapUnit);
  for(const option of options){
    const group=groups.find(group=>group.point.levelId===option.point.levelId &&
      Math.hypot(group.point.x-option.point.x,group.point.y-option.point.y)<spacing);
    if(group){group.options.push(option);group.label=groupLabel(group.options);}
    else groups.push({id:option.record.id,label:option.record.from,point:option.point,options:[option]});
  }
  return groups;
}

/** Personal actions use the owner's saved target, never a supposed standing
 * point derived from a copied source URL. Every personal recipe stays reachable. */
export function groupPersonalGuides(records:readonly UtilityReference[],mapUnit:number):PersonalGuideGroup[] {
  const groups:PersonalGuideGroup[]=[];
  const spacing=46*Math.max(.01,mapUnit);
  for(const record of records){
    if(!record.userCreated || !Number.isFinite(record.x) || !Number.isFinite(record.y))continue;
    const target={x:record.x,y:record.y,levelId:record.levelId};
    const group=groups.find(group=>group.target.levelId===target.levelId &&
      group.options[0].record.mapId===record.mapId && group.options[0].record.side===record.side &&
      group.options[0].record.type===record.type &&
      Math.hypot(group.target.x-target.x,group.target.y-target.y)<spacing);
    if(group){group.options.push({record,target});group.label='Your lineups';}
    else groups.push({kind:'personal',id:`personal:${record.id}`,label:'Your lineup',target,options:[{record,target}]});
  }
  return groups;
}

/** Only the personal action badge may move for hit-area separation. Its target
 * and every published standing point remain unchanged; the UI draws a leader. */
export function layoutPersonalGuides(groups:readonly PersonalGuideGroup[],origins:readonly OriginGroup[],mapUnit:number,
 bounds:{x:number;y:number;width:number;height:number}):PersonalGuideMarker[] {
  if(!groups.length)return [];
  const spacing=46*Math.max(.01,mapUnit),radius=spacing/2;
  const placed:PersonalGuideMarker[]=[];
  const minX=bounds.x+Math.min(radius,bounds.width/2),maxX=bounds.x+bounds.width-Math.min(radius,bounds.width/2);
  const minY=bounds.y+Math.min(radius,bounds.height/2),maxY=bounds.y+bounds.height-Math.min(radius,bounds.height/2);
  for(const group of groups){
    if(group.target.x<bounds.x||group.target.x>bounds.x+bounds.width||
      group.target.y<bounds.y||group.target.y>bounds.y+bounds.height)continue;
    let chosen={x:Math.max(minX,Math.min(maxX,group.target.x)),y:Math.max(minY,Math.min(maxY,group.target.y))};
    for(const offset of personalBadgeOffsets){
      const candidate={x:Math.max(minX,Math.min(maxX,group.target.x+offset.x*spacing)),
        y:Math.max(minY,Math.min(maxY,group.target.y+offset.y*spacing))};
      if(origins.every(origin=>origin.point.levelId!==group.target.levelId||
      Math.hypot(origin.point.x-candidate.x,origin.point.y-candidate.y)>=spacing-1e-6)&&
      placed.every(other=>other.target.levelId!==group.target.levelId||Math.hypot(other.displayX-candidate.x,other.displayY-candidate.y)>=spacing-1e-6)){
        chosen=candidate;break;
      }
    }
    placed.push({...group,displayX:chosen.x,displayY:chosen.y});
  }
  return placed;
}
