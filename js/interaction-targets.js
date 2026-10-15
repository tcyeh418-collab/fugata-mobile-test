import {activeWalls} from './rooms.js?v=room01-theme-replay-v1';
import {allDoor03Ports} from './door03-synth-data.js';
import {distanceBetween,pointInRect} from './collision.js';
const action=(code,label)=>({code,label});
const listen=action('KeyE','試聽');
function item(entity,actions,options={}){return {...entity,...options,name:options.name||entity.displayLabel||entity.displayName||entity.label||entity.name||entity.id,actions};}
export function targets(s){
 switch(s.gameProgress.currentRoom){
 case 1:{const z=s.door01.interactionZone,replay=s.room01ThemeReplay;return [item(replay,[action('KeyE',replay.playing?'停止 Fugata 主題':'播放 Fugata 主題')],{...replay.interactionPoint,name:replay.displayName,hitWidth:replay.width,hitHeight:replay.height}),...s.fragments.map(f=>item(f,[listen,action('Enter',f.isHeld?'放回':'拿取／交換')],{...f.originalPosition,hitWidth:55,hitHeight:105})),item({id:s.door01.id,x:z.x+z.width/2,y:z.y+z.height/2,interactionRadius:100},[action('KeyE','提交旋律')],{name:'主題之門',zone:z,hitWidth:50,hitHeight:120})];}
 case 2:return [item(s.subjectTerminal,[action('KeyE','聆聽主題')],{name:'主題終端',hitHeight:110}),...s.echoTowers.map(t=>item(t,[listen,action('Enter','連接／提交')],{hitHeight:110}))];
 case 3:return [...s.door03Modules.map(m=>item(m,[action('KeyE','檢查／監聽')],{hitWidth:m.width,hitHeight:m.height,centered:true})),...allDoor03Ports(s.door03Modules).filter(p=>!p.fixed).map(p=>item(p,[action('Enter',p.type==='output'?'選取輸出端':'連接輸入端')],{hitWidth:18,hitHeight:18,centered:true,priority:2})),item(s.door03PatchMonitor,[action('KeyE','監聽接線')],{name:'接線監聽器',centered:true})];
 case 4:return [item(s.door04ReferenceConsole,[action('KeyE','參考：播放／暫停／續播'),action('Space','參考：從頭重播')],{name:'參考聆聽台',hitHeight:90}),...s.door04Capsules.filter(v=>v.currentLocation==='pedestal'||v.isHeld).map(v=>item(v,[listen,action('Enter',v.isHeld?'歸還原座':'拿取')],{...v.originalPosition,hitWidth:60,hitHeight:105})),...s.door04Slots.map(slot=>{const voice=s.door04Capsules.find(v=>v.id===slot.assignedVoiceId);return item(slot,[listen,action('Enter',s.door04.heldVoiceId?(voice?'交換':'放入'):(voice?'拿回':'空位置'))],{name:`位置 ${slot.index+1}｜${voice?.displayLabel||'空位'}`,hitWidth:70,hitHeight:95});}),item(s.door04TestConsole,[action('KeyE','從頭播放／測試')],{name:'序列測試台',hitHeight:90})];
 case 5:return [...s.door05Terminals.map(t=>item(t,[action('KeyE','聆聽並切換階段')],{name:({foundation:'基礎',drive:'推進',sprint:'衝刺'})[t.phaseId]+'節奏終端'})),...s.door05Nodes.map(n=>item(n,[action('Enter','切換重音')],{name:`節奏點 ${n.stepNumber}`,hitWidth:35,hitHeight:28,centered:true})),item(s.door05TestConsole,[action('Space','測試節奏')],{name:'節奏測試台'}),item(s.door05FinalConsole,[action('Space','啟動最終節奏')],{name:'最終節奏驅動'})];
 case 6:return [...s.door06Relays.map(r=>item(r,[action('KeyE','聆聽／回復訊號')],{hitHeight:60})),item(s.door06FinalReferenceConsole,[action('KeyE','完整聆聽最終參考')],{name:'最終參考台'}),...s.door06Memories.map(m=>item(m,[listen,action('Enter','選取（再按 Space 確認）')],{hitWidth:26,hitHeight:62,centered:true}))];
 default:return [];
 }
}
export function clearSight(s,target){
 return !activeWalls(s).some(w=>{
  // A device's own base does not block reaching its controls from adjacent ground.
  if(s.gameProgress.currentRoom===4 && w.owner==="loom" && target.id.startsWith("door04-entry-"))return false;
  if(w.owner&&(target.id===w.owner||target.moduleId===w.owner||target.id.startsWith(w.owner+'-')))return false;
  const dx=target.x-s.player.x,dy=target.y-s.player.y,steps=Math.ceil(Math.hypot(dx,dy)/4);
  for(let i=1;i<steps;i++)if(pointInRect({x:s.player.x+dx*i/steps,y:s.player.y+dy*i/steps},w))return true;
  return false;
 });
}
export function reachable(s,t){return Boolean(t&&(t.zone?pointInRect(s.player,t.zone):distanceBetween(s.player,t)<=t.interactionRadius)&&clearSight(s,t));}
export function allowedTarget(s,entity,position=entity){
 const id=s.interaction?.executingId || s.interaction?.selectedId;
 if(id&&id!==entity.id)return false;
 return clearSight(s,{...entity,...position});
}
export function selectedTarget(s){return targets(s).find(t=>t.id===s.interaction?.selectedId);}
export function syncSelection(s){
 s.interaction??={selectedId:null,hoverId:null};
 const list=targets(s),selected=list.find(t=>t.id===s.interaction.selectedId);
 if(selected&&reachable(s,selected))return;
 if(selected&&s.interaction.explicit&&distanceBetween(s.player,selected)<170)return;
 const nearby=list.filter(t=>reachable(s,t)).sort((a,b)=>distanceBetween(s.player,a)-distanceBetween(s.player,b));
 s.interaction.selectedId=nearby[0]?.id??null;s.interaction.explicit=false;
}
export function cycleTarget(s){
 const list=targets(s).filter(t=>reachable(s,t));if(!list.length)return;
 const i=list.findIndex(t=>t.id===s.interaction?.selectedId);
 Object.assign(s.interaction??={},{selectedId:list[(i+1)%list.length].id,explicit:true});
}
