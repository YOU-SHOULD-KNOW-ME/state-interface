/** Optional host mapping. Activity timestamps are Unix seconds. No polling or I/O. */
export function deriveState({connection='offline',activity=null,now=Date.now()}={}) {
  if(['offline','local-offline'].includes(connection))return 'offline';
  if(connection==='stalled')return 'error';
  if(connection!=='live')return 'connecting';
  if(!activity||!Number.isFinite(activity.observedAt)||activity.observedAt*1000>now+60000||now-activity.observedAt*1000>4*3600000)return 'idle';
  if(activity.state==='complete'&&now-activity.observedAt*1000>12000)return 'idle';
  return ['idle','working','waiting','complete','error'].includes(activity.state)?activity.state:'idle';
}

export function createStatusAdapter(companion,{now=Date.now}={}) {
  let connection='offline',activity=null,lastCompletion=null;
  function refresh(){
    const state=deriveState({connection,activity,now:now()});
    const restart=state==='complete'&&activity?.observedAt!==lastCompletion;
    if(state==='complete')lastCompletion=activity.observedAt;
    companion.setState(state,{restart});return state;
  }
  return {setConnection(value){connection=value;return refresh()},setActivity(value){activity=value;return refresh()},refresh};
}
