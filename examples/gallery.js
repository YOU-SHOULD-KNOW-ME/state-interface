import {createStateInterface,STATES} from '../src/index.js';
const $=id=>document.getElementById(id);
STATES.forEach(state=>{const o=document.createElement('option');o.value=o.textContent=state;$('state').append(o)});$('state').value='idle';
try{
 const actor=await createStateInterface({canvas:$('actor')});
 function show(){const s=actor.getSnapshot();$('snapshot').textContent=JSON.stringify(s,null,2);$('seek').max=s.durationMs-1;$('seek').value=s.state==='complete'?Math.min(s.timeMs,s.durationMs-1):s.timeMs%s.durationMs;$('variant').disabled=s.state!=='complete'}
 function change(restart=true){actor.setState($('state').value,{restart,variant:$('state').value==='complete'?$('variant').value:'random'});show()}
 $('state').onchange=()=>change();$('variant').onchange=()=>change();$('restart').onclick=()=>change();
 $('pause').onclick=()=>{actor.pause();show()};$('play').onclick=()=>{actor.play();show()};
 $('seek').oninput=e=>{actor.pause().seek(Number(e.target.value));show()};
 const timer=setInterval(show,300);show();window.addEventListener('pagehide',()=>{clearInterval(timer);actor.destroy()},{once:true});
}catch(e){$('snapshot').textContent='Unable to load assets: '+e.message}
