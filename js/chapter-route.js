// Puzzle IDs remain stable for audio, ownership and old saves; visit order is separate.
export const CHAPTER_ROUTE='dark-v2';
export const CHAPTER_ORDER=Object.freeze([1,2,5,4,3,6]);
export const isIntegratedState=s=>s?.gameProgress?.route===CHAPTER_ROUTE;
export const chapterOrdinal=(s,room=s?.gameProgress?.currentRoom)=>isIntegratedState(s)?CHAPTER_ORDER.indexOf(room)+1:room;
export const chapterNextRoom=(s,room=s.gameProgress.currentRoom)=>isIntegratedState(s)?CHAPTER_ORDER[CHAPTER_ORDER.indexOf(room)+1]:room<6?room+1:null;
export const completedChapterCount=s=>[1,2,3,4,5,6].filter(n=>s[`door0${n}`]?.completed===true).length;
// An explicit desktop link must never install touch controls or rotation gates.
export function mobileInterfaceRequested(location){
 const q=new URLSearchParams(location?.search??'');
 return q.get('platform')!=='desktop'&&q.get('mobile')==='room1';
}
export function integratedChapterRequested(location){
 const q=new URLSearchParams(location?.search??'');
 if(mobileInterfaceRequested(location)||q.has('characterTrial')||q.get('art')==='classic')return false;
 return !q.has('test')||q.get('chapter')==='integrated';
}
