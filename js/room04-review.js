// Public collectible identity is tied to the displayed station, never answer order.
export const ROOM04_VOICE_STYLES=Object.freeze([
 Object.freeze({name:'甲',key:'blue',color:'#79caff',asset:'capsuleBlue'}),
 Object.freeze({name:'乙',key:'amber',color:'#ffd478',asset:'capsuleAmber'}),
 Object.freeze({name:'丙',key:'mint',color:'#7ee2b2',asset:'capsuleMint'}),
 Object.freeze({name:'丁',key:'violet',color:'#c4a2ff',asset:'capsule'}),
]);
export function room04VoiceStyle(v){const i=Number(v?.pedestalId?.match(/(\d+)$/)?.[1])-1;return ROOM04_VOICE_STYLES[i]??ROOM04_VOICE_STYLES.find(s=>v?.displayLabel?.endsWith(s.name))??ROOM04_VOICE_STYLES[3];}
export function isRoom04Review(s){return s.door04?.testMode==='quartet-review';}
export function room04ReviewResult(s,slot){const result=s.door04.reviewResults?.[slot.index];return result&&result.voiceId===slot.assignedVoiceId?(result.correct?'correct':'incorrect'):null;}
export function clearRoom04ReviewAt(s,index){if(!isRoom04Review(s))return;s.door04.reviewResults[index]=null;s.door04.confirmedEntryCount=s.door04Slots.filter(slot=>room04ReviewResult(s,slot)==='correct').length;}
