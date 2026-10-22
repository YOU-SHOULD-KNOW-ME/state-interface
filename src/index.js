import {STATES,selectPlayback,frameAt,effectsAt} from './engine.js';
export {STATES,selectPlayback,frameAt,effectsAt} from './engine.js';

const cache=new Map();
const patterns={questions:['01110','10001','00001','00010','00100','00000','00100'],sleep:['11111','00001','00010','00100','01000','10000','11111']};

async function loadAssets(base) {
  if(cache.has(base.href))return cache.get(base.href);
  const promise=(async()=>{
    const response=await fetch(new URL('catalog.json',base));
    if(!response.ok)throw Error('Unable to load companion catalog: '+response.status);
    const catalog=await response.json(),images={};
    const files=new Set(Object.values(catalog.states).flatMap(s=>Object.values(s.variants).flatMap(v=>v.files)));
    await Promise.all([...files].map(async file=>{
      const image=new Image();image.src=new URL(file,base).href;await image.decode();images[file]=image;
    }));
    return {catalog,images};
  })().catch(error=>{cache.delete(base.href);throw error});
  cache.set(base.href,promise);return promise;
}

function pixelGlyph(context,pattern,x,y,size,color,opacity) {
  context.save();context.globalAlpha=opacity;context.translate(x,y);
  context.fillStyle='#5a2b20';
  pattern.forEach((row,cy)=>[...row].forEach((v,cx)=>{if(v==='1')context.fillRect(cx*size-1,cy*size-1,size+2,size+2)}));
  context.fillStyle=color;
  pattern.forEach((row,cy)=>[...row].forEach((v,cx)=>{if(v==='1')context.fillRect(cx*size,cy*size,size,size)}));
  context.restore();
}

/** Purely visual renderer: never connects to Claude, SSH, accounts or terminals. */
export async function createCompanion({container,canvas,assetsUrl=new URL('../assets/',import.meta.url),initialState='idle',variant='random',autoplay=true,respectReducedMotion=true,random=Math.random,onStateChange}={}) {
  if(!canvas&&!container)throw new TypeError('Provide a canvas or container');
  if(!STATES.includes(initialState))throw new RangeError('Unknown initialState');
  const owned=!canvas;
  if(owned){canvas=document.createElement('canvas');container.append(canvas)}
  canvas.width=384;canvas.height=512;canvas.style.imageRendering='pixelated';
  canvas.setAttribute('role','img');
  const base=new URL(assetsUrl,document.baseURI),{catalog,images}=await loadAssets(base);
  const [width,height]=catalog.canvas;
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0)throw new Error('Invalid character canvas size');
  canvas.width=width;canvas.height=height;
  const character=catalog.character?.name||'Character';
  const context=canvas.getContext('2d');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let playback=selectPlayback(catalog,initialState,{variant,random}),time=0,playing=autoplay,rate=1,last=0,raf=0,destroyed=false;

  function render() {
    if(destroyed)return;
    const sample=frameAt(playback,time);
    context.clearRect(0,0,width,height);context.imageSmoothingEnabled=false;
    context.drawImage(images[playback.files[sample.frame]],0,0);
    const effect=effectsAt(playback,sample);
    if(effect){
      context.save();context.scale(width/384,height/512);
      effect.marks.forEach((mark,i)=>{
        if(mark.opacity<=0)return;
        const reduce=respectReducedMotion&&media.matches;
        const scale=reduce?1:mark.scale,y=reduce?0:mark.y;
        const positions=effect.kind==='questions'?[[238,48],[278,26],[318,40]]:[[244,57],[278,34],[312,20]];
        pixelGlyph(context,patterns[effect.kind],positions[i][0],positions[i][1]+y,4*scale,['#ffc260','#ffdc8b','#fff0b4'][i],mark.opacity);
      });
      context.restore();
    }
    canvas.dataset.state=playback.state;canvas.dataset.variant=playback.variant;canvas.dataset.frame=String(sample.frame);
    canvas.setAttribute('aria-label',character+': '+playback.state+' ('+playback.variant+')');
  }
  function schedule(){if(!destroyed&&playing&&!document.hidden&&!(respectReducedMotion&&media.matches)&&!raf)raf=requestAnimationFrame(tick)}
  function tick(now){raf=0;if(last)time+=Math.min(100,now-last)*rate;last=now;render();schedule()}
  function pause(){playing=false;last=0;cancelAnimationFrame(raf);raf=0;return controller}
  function play(){playing=true;last=0;schedule();return controller}
  function seek(value){if(!Number.isFinite(value)||value<0)throw new RangeError('seek requires non-negative milliseconds');time=value;render();return controller}
  function setState(state,options={}){
    if(destroyed)throw Error('Companion was destroyed');
    const requestedVariant=options.variant??'random';
    if(state===playback.state&&!options.restart&&(requestedVariant==='random'||requestedVariant===playback.variant))return controller;
    playback=selectPlayback(catalog,state,{variant:requestedVariant,random});time=0;last=0;render();
    onStateChange?.({state:playback.state,variant:playback.variant});schedule();return controller;
  }
  function visibility(){cancelAnimationFrame(raf);raf=0;last=0;schedule()}
  function motion(){cancelAnimationFrame(raf);raf=0;last=0;render();schedule()}
  document.addEventListener('visibilitychange',visibility);media.addEventListener('change',motion);
  const controller={canvas,setState,seek,renderAt:seek,pause,play,
    setSpeed(value){if(!Number.isFinite(value)||value<=0)throw new RangeError('Speed must be positive');rate=value;return controller},
    getSnapshot(){return {state:playback.state,variant:playback.variant,timeMs:time,durationMs:playback.durationMs,frame:frameAt(playback,time).frame,playing}},
    destroy(){if(destroyed)return;pause();destroyed=true;document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',motion);if(owned)canvas.remove()}
  };
  render();schedule();return controller;
}

// Generic project-name entry point; createCompanion remains available.
export const createStateInterface = createCompanion;
