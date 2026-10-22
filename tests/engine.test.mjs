import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {STATES,selectPlayback,frameAt,effectsAt} from '../src/engine.js';import {deriveState,createStatusAdapter} from '../src/adapters.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/catalog.json',import.meta.url)));
test('all seven states and 52 portable full-frame images are present',()=>{
 assert.equal(STATES.length,7);let count=0;
 for(const state of STATES)for(const v of Object.values(catalog.states[state].variants))for(const f of v.files){const p=new URL('../assets/'+f,import.meta.url);assert(existsSync(p));const b=readFileSync(p);assert.equal(b.readUInt32BE(16),384);assert.equal(b.readUInt32BE(20),512);count++}assert.equal(count,52);
});
test('completion stays chosen while seeking and holds the final pose',()=>{
 for(const [value,name]of [[0,'victory'],[.9,'sign']]){let calls=0;const p=selectPlayback(catalog,'complete',{random:()=>{calls++;return value}});for(const t of [0,1700,9000]){frameAt(p,t);assert.equal(p.variant,name)}assert.equal(calls,1);assert.equal(frameAt(p,9000).frame,5)}
 assert.throws(()=>selectPlayback(catalog,'missing'));assert.throws(()=>selectPlayback(catalog,'idle',{variant:'sign'}));
});
test('question and sleep effects are time-bound and clear on recovery',()=>{
 const p=selectPlayback(catalog,'error');for(const [ms,n]of [[1660,1],[1840,2],[2170,3]])assert.equal(effectsAt(p,frameAt(p,ms)).marks.filter(m=>m.opacity>0).length,n);assert.equal(effectsAt(p,frameAt(p,2820)),null);
 const off=selectPlayback(catalog,'offline');assert.equal(effectsAt(off,frameAt(off,2800)).marks.filter(m=>m.opacity>0).length,3);assert.equal(effectsAt(off,frameAt(off,4000)),null);
});
test('host mapping does not treat a connected transport as a completed task',()=>{
 const now=2000000000000;assert.equal(deriveState({connection:'live',now}),'idle');assert.equal(deriveState({connection:'offline',activity:{state:'working',observedAt:now/1000},now}),'offline');
 assert.equal(deriveState({connection:'live',activity:{state:'complete',observedAt:now/1000-13},now}),'idle');
 const calls=[];const a=createStatusAdapter({setState:(s,o)=>calls.push([s,o])},{now:()=>now});a.setConnection('live');a.setActivity({state:'complete',observedAt:now/1000});a.refresh();assert.equal(calls.at(-1)[1].restart,false);a.setActivity({state:'complete',observedAt:now/1000+1});assert.equal(calls.at(-1)[1].restart,true);
});
