export const STATES = Object.freeze(['offline','connecting','idle','working','waiting','complete','error']);

export function selectPlayback(catalog,state,{variant='random',random=Math.random}={}) {
  if(!STATES.includes(state)||!catalog.states[state])throw new RangeError('Unknown state: '+state);
  const options=catalog.states[state].variants,ids=Object.keys(options);
  const id=variant==='random'?ids[Math.min(ids.length-1,Math.max(0,Math.floor(random()*ids.length)))]:variant;
  if(!options[id])throw new RangeError('Unknown variant for '+state+': '+id);
  const data=options[id];
  return {state,variant:id,...data,durationMs:data.sequence.reduce((n,s)=>n+s.durationMs,0)};
}

export function frameAt(playback,timeMs) {
  if(!Number.isFinite(timeMs))throw new TypeError('timeMs must be finite');
  const time=playback.loop?Math.max(0,timeMs)%playback.durationMs:Math.min(Math.max(0,timeMs),playback.durationMs-1);
  let offset=0;
  for(let index=0;index<playback.sequence.length;index++){
    const step=playback.sequence[index];
    if(time<offset+step.durationMs)return {frame:step.frame,index,time,offset,within:time-offset};
    offset+=step.durationMs;
  }
}

export function effectsAt(playback,sample) {
  const effect=playback.effect;
  if(!effect||!effect.frames.includes(sample.frame))return null;
  let first=sample.index;
  while(first>0&&effect.frames.includes(playback.sequence[first-1].frame))first--;
  const start=playback.sequence.slice(0,first).reduce((n,s)=>n+s.durationMs,0);
  const elapsed=sample.time-start;
  return {kind:effect.kind,marks:[0,1,2].map(i=>{
    const age=elapsed-i*effect.staggerMs;
    if(age<0)return {opacity:0,scale:.25,y:12};
    if(effect.kind==='sleep')return {opacity:Math.min(1,age/220),scale:.65+.35*Math.min(1,age/220),y:-Math.min(8,age/250)};
    if(age<110){const e=1-Math.pow(1-age/110,3);return {opacity:1,scale:.25+.93*e,y:12-14*e};}
    if(age<180){const t=(age-110)/70;return {opacity:1,scale:1.18-.18*t,y:-2+2*t};}
    return {opacity:1,scale:1,y:0};
  })};
}
