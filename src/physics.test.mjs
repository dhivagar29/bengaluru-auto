import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const code = ts.transpileModule(readFileSync(new URL('./physics.ts', import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { onRoad, spawn, stepCar } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64')); 
const idle={forward:false,reverse:false,left:false,right:false,brake:false};
test('accelerates, respects top speed, brakes, and reverses',()=>{
 let c=spawn();for(let i=0;i<1000;i++)c=stepCar(c,{...idle,forward:true},.016);
 assert(c.speed<=22);assert(c.distance>0);assert(onRoad(c.x,c.z));
 c={...spawn(),speed:15};for(let i=0;i<60;i++)c=stepCar(c,{...idle,brake:true},.016);
 assert(c.speed<.03);for(let i=0;i<60;i++)c=stepCar(c,{...idle,reverse:true},.016);assert(c.speed<0);
});
test('collisions stop at buildings and outer boundary without escaping',()=>{
 for(const start of [{...spawn(),x:7.4,yaw:-Math.PI/2,speed:20},{...spawn(),z:-108.9,speed:20}]){
  const c=stepCar(start,{...idle,forward:true},.05);assert.equal(c.speed,0);assert.equal(c.x,start.x);assert.equal(c.z,start.z);assert(onRoad(c.x,c.z));
 }
});
test('turning works in forward and reverse and long frames are clamped',()=>{
 const c=stepCar({...spawn(),speed:10},{...idle,left:true},1);assert(c.yaw>0);assert(c.distance<=1.1);
 const r=stepCar({...spawn(),speed:-5},{...idle,left:true},.016);assert(r.yaw<0);
 assert.equal(stepCar(spawn(),{...idle,left:true},.016).yaw,0);
});
