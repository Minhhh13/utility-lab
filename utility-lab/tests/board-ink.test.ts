import test from "node:test";
import assert from "node:assert/strict";
import {emptyPlan, validatePlan, validateTacticFile, validateSavedTactics, type TacticFile} from "../src/board-model.ts";
import {encodeTacticShareCode,decodeTacticShareCode} from "../src/share-code.ts";
import {captureWorkspace,parseWorkspaceBackup} from "../src/workspace-backup.ts";

const coloured = (): TacticFile => ({format:"utility-lab-tactic",version:1,plan:{...emptyPlan("mirage","main"),objects:[
 {id:"pen",kind:"pen",x:0,y:0,points:[{x:20,y:30},{x:80,y:60}],color:"#f16b75"},
 {id:"route",kind:"route",x:0,y:0,points:[{x:20,y:30},{x:80,y:60}],color:"#72a7f5"},
 {id:"legacy",kind:"pen",x:0,y:0,points:[{x:90,y:30},{x:110,y:60}]},
]}});

test("fixed path colours survive JSON, saved tactics, both share codecs and workspace backup without freezing legacy theme ink",async()=>{
 const file=coloured(),saved={id:"ink-plan",updatedAt:"2026-11-10T00:00:00.000Z",plan:file.plan};
 assert.deepEqual(validateTacticFile(JSON.parse(JSON.stringify(file))),file);
 assert.deepEqual(validateSavedTactics([saved]),[saved]);
 for(const compress of [true,false]) assert.deepEqual(await decodeTacticShareCode(await encodeTacticShareCode(file,compress)),file);
 const values=new Map([["utility-lab:tactics:v1",JSON.stringify([saved])],["utility-lab:draft:v1:mirage:main",JSON.stringify(file.plan)]]);
 const restored=parseWorkspaceBackup(JSON.parse(JSON.stringify(captureWorkspace({getItem:key=>values.get(key)??null}))));
 assert.deepEqual(restored.tactics[0].plan,file.plan);assert.deepEqual(restored.drafts[0].plan,file.plan);
 assert.equal(Object.hasOwn(restored.tactics[0].plan.objects[2],"color"),false);
});

test("imported drawing colour accepts bounded hex only and cannot recolour team or utility semantics",()=>{
 const file=coloured(),pen=file.plan.objects[0];
 const uppercase=validatePlan({...file.plan,objects:[{...pen,color:"#A8C3FF"}]});
 assert.equal(uppercase.objects[0].color,"#a8c3ff");
 for(const color of ["url(https://example.test/image.svg)","var(--marker-t)","red","#fff","#ffffffff",null,{}])
  assert.throws(()=>validatePlan({...file.plan,objects:[{...pen,color}]}),/colours/);
 assert.throws(()=>validatePlan({...file.plan,objects:[{id:"player",kind:"t",x:20,y:30,color:"#f16b75"}]}),/colours/);
 assert.throws(()=>validatePlan({...file.plan,objects:[{id:"smoke",kind:"smoke",x:20,y:30,color:"#f16b75"}]}),/colours/);
});
