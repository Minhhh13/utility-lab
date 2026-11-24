import test from 'node:test';
import assert from 'node:assert/strict';
import {PRECISE_ANUBIS} from '../src/data/precise-anubis.ts';
import {groupPersonalGuides,layoutPersonalGuides,originRecipeOptions,type OriginGroup} from '../src/origin-options.ts';

const reference=PRECISE_ANUBIS.find(record=>record.id==='expanded-cs2tricks-anubis-a-connector-from-upper-7667-t')!;

test('personal actions preserve owner target coordinates even when a publisher URL was copied',()=>{
 const personal={...reference,id:'my-guide',userCreated:true,from:'My own corner',x:123,y:456};
 const before=JSON.stringify(personal);
 const [group]=groupPersonalGuides([reference,personal],1);
 assert.equal(group.kind,'personal');
 assert.deepEqual(group.target,{x:123,y:456,levelId:personal.levelId});
 assert.equal('point' in group,false,'A personal target must not be labeled a standing point');
 assert.equal('point' in group.options[0],false);
 assert.deepEqual(group.options.map(option=>option.record.id),[personal.id]);
 assert.equal(JSON.stringify(personal),before);
});

test('all17 source-free personal recipes remain reachable without a four-recipe cap or fake origins',()=>{
 const records=Array.from({length:17},(_,index)=>({...reference,id:`personal-${index}`,title:`My guide ${index}`,
  source:undefined,markerSource:undefined,userCreated:true,x:400,y:600}));
 const choices=originRecipeOptions(records);
 assert.equal(choices.length,17);
 const groups=groupPersonalGuides(choices,2);
 assert.equal(groups.length,1);
 assert.equal(groups[0].label,'Your lineups');
 assert.equal(groups[0].options.length,17);
 assert.deepEqual(groups[0].options.map(option=>option.record.id).sort(),records.map(record=>record.id).sort());
 assert.ok(groups[0].options.every(option=>option.target.x===400&&option.target.y===600&&!('point' in option)));
});

test('personal groups keep floors, sides and distinct targets separate while retaining each exact owner point',()=>{
 const base={...reference,id:'personal-upper',userCreated:true,x:100,y:200,levelId:'upper'};
 const records=[base,{...base,id:'personal-lower',levelId:'lower'},
  {...base,id:'personal-ct',side:'CT' as const},{...base,id:'personal-far',x:800,y:700},
  {...base,id:'personal-near',x:110,y:205}];
 const groups=groupPersonalGuides(records,1);
 assert.equal(groups.length,4);
 assert.deepEqual(groups[0].target,{x:100,y:200,levelId:'upper'});
 assert.deepEqual(groups[0].options.map(option=>option.target.x),[100,110]);
 assert.equal(groups.flatMap(group=>group.options).length,5);
});

test('a personal action avoids a nearby real standing pin while both saved coordinates stay unchanged',()=>{
 const personal={...reference,id:'my-nearby-target',userCreated:true,x:836.07,y:283.49};
 const group=groupPersonalGuides([personal],2);
 const origin:OriginGroup={id:'published',label:'A Pillar',point:{x:831.54,y:262.07,levelId:'main',
  registrationId:'test-source',label:'A Pillar',basis:'publisher-origin'},options:[]};
 const before=JSON.stringify({group,origin});
 const [marker]=layoutPersonalGuides(group,[origin],2,{x:0,y:0,width:1000,height:1000});
 assert.ok(Math.hypot(marker.displayX-origin.point.x,marker.displayY-origin.point.y)>=92-1e-6);
 assert.deepEqual(marker.target,{x:836.07,y:283.49,levelId:'main'});
 assert.equal(JSON.stringify({group,origin}),before);
 assert.ok(marker.displayX>=46&&marker.displayX<=954&&marker.displayY>=46&&marker.displayY<=954);
});

test('panning an owner target outside the viewport hides its action without moving or discarding recipes',()=>{
 const personal={...reference,id:'my-offscreen-target',userCreated:true,x:836.07,y:283.49};
 const groups=groupPersonalGuides([personal],1);
 const before=JSON.stringify({personal,groups});
 assert.deepEqual(layoutPersonalGuides(groups,[],1,{x:0,y:0,width:500,height:500}),[]);
 const [restored]=layoutPersonalGuides(groups,[],1,{x:600,y:100,width:400,height:500});
 assert.deepEqual(restored.target,{x:836.07,y:283.49,levelId:personal.levelId});
 assert.deepEqual(restored.options.map(option=>option.record.id),[personal.id]);
 assert.equal(JSON.stringify({personal,groups}),before);
 assert.deepEqual(layoutPersonalGuides([],[],1,{x:0,y:0,width:1000,height:1000}),[]);
});
