import {createStateInterface} from './src/index.js';
const $=id=>document.getElementById(id);
const states={idle:['☀','Idle','A quiet moment between ideas. A natural blink, ready for what comes next.'],connecting:['↗','Connecting','A little adjustment before settling in. Your connection is on its way.'],working:['✎','Working','Read, turn a page, write it down. Good work takes a little concentration.'],waiting:['…','Waiting','Looking up, palm open. Your companion is waiting for your next move.'],complete:['✓','Complete','A small celebration: a victory gesture or a wooden checkmark paddle.'],error:['?','Error','A puzzled head scratch. Three questions appear, one after another.'],offline:['☾','Offline','Book hugged close, eyes closed. A little nap until you return.']};
let actor;
for(const [state,[icon,name]] of Object.entries(states)){
 const b=document.createElement('button');b.type='button';b.dataset.state=state;b.setAttribute('aria-pressed',String(state==='idle'));b.innerHTML=`<b aria-hidden="true">${icon}</b><span>${name}</span>`;b.disabled=true;b.onclick=()=>choose(state);$('states').append(b);
}
function choose(state){actor.setState(state,{restart:true,variant:state==='complete'?$('variant').value:'random'});$('state-name').textContent=states[state][1];$('state-description').textContent=states[state][2];document.querySelectorAll('.states button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===state)));update()}
function update(){if(!actor)return;const s=actor.getSnapshot();$('play').textContent=s.playing?'Pause':'Play';$('seek').max=s.durationMs-1;$('seek').value=s.state==='complete'?Math.min(s.durationMs-1,s.timeMs):s.timeMs%s.durationMs;$('time').value=`${(Number($('seek').value)/1000).toFixed(1)} / ${(s.durationMs/1000).toFixed(1)} s`;$('status').textContent=s.playing?'● Playing':'Ⅱ Paused'}
$('snippet').textContent=`import { createStateInterface } from './src/index.js';

const actor = await createStateInterface({
  canvas: document.querySelector('canvas'),
  initialState: 'idle'
});

actor.setState('working');
// Your app receives a task-completed event:
actor.setState('complete', { restart: true });`;
$('backdrop').onclick=()=>{const dark=$('stage').classList.toggle('dark');$('backdrop').setAttribute('aria-pressed',String(dark));$('backdrop').textContent=dark?'Light backdrop':'Dark backdrop'};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('snippet').textContent);$('copy').textContent='Copied ✓';setTimeout(()=>$('copy').textContent='Copy snippet',1800)}catch{$('copy').textContent='Select code to copy'}};
try{
 actor=await createStateInterface({canvas:$('actor')});document.querySelectorAll('.states button').forEach(b=>b.disabled=false);$('play').disabled=$('restart').disabled=false;
 $('play').onclick=()=>{actor.getSnapshot().playing?actor.pause():actor.play();update()};$('restart').onclick=()=>choose(actor.getSnapshot().state);
 $('speed').onchange=()=>actor.setSpeed(Number($('speed').value));$('variant').onchange=()=>{if(actor.getSnapshot().state==='complete')choose('complete')};$('seek').oninput=()=>{actor.pause();actor.seek(Number($('seek').value));update()};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)actor.pause();update();setInterval(update,100);
}catch(error){$('status').textContent='Unable to load artwork';$('state-description').textContent=error.message;console.error(error)}
