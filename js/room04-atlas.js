// Measured against the approved 1536 × 1024 RGBA atlases. Feet, not the
// bounding-box centre of an extended arm, determine the actor's world anchor.
const frame=(x,y,width,height,footX,footY)=>Object.freeze({x,y,width,height,footX,footY});
export const ROOM04_INTERACTION_ATLASES=Object.freeze({
 leroy:Object.freeze({width:1536,height:1024,standingHeight:796,frames:Object.freeze({
  idle:frame(48,120,320,830,210,932),
  holding:frame(400,120,328,830,560,932),
  showing:frame(752,120,426,830,941,932),
  placing:frame(1178,192,340,758,1334,932),
 })}),
 pinxin:Object.freeze({width:1536,height:1024,standingHeight:760,frames:Object.freeze({
  idle:frame(24,128,336,798,188,906),
  pointing:frame(396,128,380,798,570,906),
  listening:frame(792,128,344,798,964,906),
  confirming:frame(1184,128,336,798,1350,906),
 })}),
});
export const ROOM04_DEVICE_STATES=Object.freeze({idle:0,playing:1,correct:2,error:3});
export const ROOM04_STATE_FRAMES=Object.freeze(Array.from({length:4},(_,i)=>frame(i*384+24,324,336,336,0,0)));
export function room04DeviceState(state,kind,voice){
 if(kind==='reference')return state.audio.door04ReferencePlaying?'playing':state.door04.referenceCompleted?'correct':'idle';
 if(kind==='station')return voice?.isPlaying?'playing':'idle';
 if(state.door04.completed||['opening','open'].includes(state.door04.status))return 'correct';
 if(state.door04.status==='rejected')return 'error';
 return state.door04.status==='testing'?'playing':'idle';
}
export function room04InteractionFrame(state,character){
 // Walking keeps the existing directional animation, including its stride.
 if(character.animation?.moving)return null;
 const atlas=ROOM04_INTERACTION_ATLASES[character.assetKey];
 if(!atlas)return null;
 let pose=character.pose||'idle';
 if(character.assetKey==='leroy' && pose!=='idle'){
  const held=state.door04Capsules.find(v=>v.id===state.door04.heldVoiceId&&v.currentLocation==='held');
  if(!held||state.room04Presentation?.carryActor!=='leroy')pose='idle';
 }
 const region=atlas.frames[pose]||atlas.frames.idle;
 return {...region,standingHeight:atlas.standingHeight,containsCapsule:character.assetKey==='leroy'&&pose!=='idle',pose};
}
