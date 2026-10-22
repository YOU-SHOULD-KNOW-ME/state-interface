import test from 'node:test';
import assert from 'node:assert/strict';
import {createStateInterface,createCompanion,STATES} from '../src/index.js';

test('custom character sizes and variants work; loading preserves an explicit seek', async()=>{
 const saved=new Map(['fetch','Image','document','matchMedia','requestAnimationFrame','cancelAnimationFrame'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 let releaseWorking;
 const catalog={canvas:[64,96],character:{name:'Other Role'},states:Object.fromEntries(STATES.map(state=>[state,{variants:{[state==='complete'?'custom-pose':'default']:{files:[state+'.png'],sequence:[{frame:0,durationMs:1000}],loop:state!=='complete'}}}]))};
 const canvas={style:{},dataset:{},setAttribute(k,v){this[k]=v},getContext(){return {clearRect(){},drawImage(){}}}};
 try{
  globalThis.fetch=async()=>({ok:true,json:async()=>catalog});
  globalThis.Image=class{set src(value){if(!value)return;const done=()=>queueMicrotask(()=>this.onload());if(value.endsWith('/working.png'))releaseWorking=done;else done()}};
  globalThis.document=Object.assign(new EventTarget(),{baseURI:'https://example.test/',hidden:false});
  globalThis.matchMedia=()=>Object.assign(new EventTarget(),{matches:false});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  assert.equal(createStateInterface,createCompanion);
  const actor=await createStateInterface({canvas,autoplay:false});
  assert.equal(canvas.width,64);assert.equal(canvas.height,96);assert.match(canvas['aria-label'],/Other Role/);
  actor.setState('working');actor.seek(777);
  assert.equal(actor.getSnapshot().loading,true);
  releaseWorking();await actor.preload();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(actor.getSnapshot().loading,false);assert.equal(actor.getSnapshot().timeMs,777);
  actor.setState('complete',{variant:'custom-pose'});actor.seek(640);await Promise.resolve();
  assert.equal(actor.getSnapshot().timeMs,640);assert.equal(actor.getSnapshot().variant,'custom-pose');
  actor.destroy();assert.throws(()=>actor.setState('idle'));
 }finally{for(const [key,desc]of saved){if(desc)Object.defineProperty(globalThis,key,desc);else delete globalThis[key]}}
});
