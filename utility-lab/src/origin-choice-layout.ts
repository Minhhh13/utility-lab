import {layoutOriginSpokes,spawnInsetLayout,type OriginChoiceGroup} from './origin-options.ts';

export const ORIGIN_PAGE_SIZE=8;
const perimeter=[
  {x:.5,y:0},{x:1,y:0},{x:1,y:.5},{x:1,y:1},
  {x:.5,y:1},{x:0,y:1},{x:0,y:.5},{x:0,y:0},
];
const slotsByCount=[
  [],[0],[6,2],[0,3,5],[0,2,4,6],[0,2,3,5,6],
  [1,2,3,5,6,7],[0,1,2,3,5,6,7],[0,1,2,3,4,5,6,7],
];

/** Keep the crop fixed across pages. Project each genuine point once so its
 * leader, source dot, and hit target share the same viewport coordinates. */
export function originChoiceLayout(group:OriginChoiceGroup,width:number,page:number){
  const options=group.options.slice(page*ORIGIN_PAGE_SIZE,(page+1)*ORIGIN_PAGE_SIZE);
  const direct=spawnInsetLayout(group,width);
  const coords=group.options.map(option=>'target' in option?option.target:option.point);
  const xs=coords.map(point=>point.x),ys=coords.map(point=>point.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const span=direct?.span??Math.max(80,maxX-minX,maxY-minY)*1.5;
  const size=direct?width:Math.min(168,width-120);
  const preview={x:direct?.x??(minX+maxX-span)/2,y:direct?.y??(minY+maxY-span)/2,
    span,size,start:(width-size)/2};
  const sources=options.map(option=>{
    const point='target' in option?option.target:option.point;
    return{x:preview.start+(point.x-preview.x)/span*size,y:preview.start+(point.y-preview.y)/span*size};
  });
  const available=slotsByCount[options.length].map(index=>{
    const slot=perimeter[index];
    return{x:44+(width-88)*slot.x,y:44+(width-88)*slot.y};
  });
  const points=direct?.points??layoutOriginSpokes(sources,available,width);
  return{options,sources,points,preview,direct:!!direct};
}
