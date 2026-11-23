import {ART_TRIAL_REVISION} from './art-trial-version.js';
import {isDarkRoom1Trial,configureDarkRoom1} from './dark-room1-layout.js';
import {configureDarkRoom2} from './dark-room2-layout.js';
import {configureDarkRoom3} from './dark-room3-layout.js';
import {configureDarkRoom4} from './dark-room4-layout.js';
import {configureDarkRoom5} from './dark-room5-layout.js';
import {configureDarkRoom6} from './dark-room6-layout.js';
import {DARK_ROOM2} from './dark-room2-layout.js';
import {DARK_ROOM3} from './dark-room3-layout.js';
import {DARK_ROOM4} from './dark-room4-layout.js';
import {DARK_ROOM5} from './dark-room5-layout.js';
import {DARK_ROOM6} from './dark-room6-layout.js';
import {CHAPTER_ROUTE,CHAPTER_ORDER,completedChapterCount,isIntegratedState} from './chapter-route.js';
export const CHAPTER_ENTRIES=Object.freeze({1:{x:300,y:520},2:DARK_ROOM2.entry,3:DARK_ROOM3.entry,4:DARK_ROOM4.entry,5:DARK_ROOM5.entry,6:DARK_ROOM6.entry});
export function prepareIntegratedChapter(state,{restored=false,room=null}={}){
 const wasIntegrated=isIntegratedState(state),position={x:state.player.x,y:state.player.y};
 const target=room??(restored&&!wasIntegrated?CHAPTER_ORDER.find(n=>!state[`door0${n}`].completed)??6:state.gameProgress.currentRoom);
 // Reconstruct geometry, never reset puzzle identities or earned progress.
 configureDarkChapter(state);
 state.gameProgress.route=CHAPTER_ROUTE;
 state.gameProgress.currentRoom=target;state.gameProgress.currentDoor=target;
 state.gameProgress.doorsCompleted=completedChapterCount(state);
 Object.assign(state.player,restored&&wasIntegrated&&room===null?position:CHAPTER_ENTRIES[target]);
 if(!wasIntegrated)state.roomTransition.completedFromRooms=[];
 return state;
}
export const DARK_CHAPTER_ART=Object.freeze({
 title:'assets/art/fugata/screens/dark-v1/title-vault-v1.png',
 ending:'assets/art/fugata/screens/dark-v1/logic-code-album.jpg',
});
// The title flow and direct-room previews must prepare the same connected chapter.
export function configureDarkChapter(state,{room=1}={}){
 if(room===1)configureDarkRoom1(state);
 if(room<=2)configureDarkRoom2(state,{arrive:room===2});
 if(room<=3)configureDarkRoom3(state,{arrive:room===3});
 if(room<=4)configureDarkRoom4(state,{arrive:room===4});
 if(room<=5)configureDarkRoom5(state,{arrive:room===5});
 configureDarkRoom6(state,{arrive:room===6});
}
export function installDarkChapterScreens(){
 if(!isDarkRoom1Trial(window.location))return;
 document.documentElement.classList.add('dark-chapter-trial');
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('../css/chapter-dark.css',import.meta.url).href+'?previewRev='+ART_TRIAL_REVISION;document.head.append(link);
 document.querySelector('meta[name="theme-color"]').content='#0b121a';
 document.querySelector('link[rel="icon"]').href='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0b121a"/><circle cx="16" cy="16" r="10" fill="none" stroke="#c7a970" stroke-width="2"/><path d="M16 5v22M5 16h22" stroke="#c7a970"/><circle cx="16" cy="16" r="3" fill="#8fc3df"/></svg>');
 const cover=document.querySelector('#ending-cover');cover.src=DARK_CHAPTER_ART.ending;cover.alt='LOGIC CODE — EURORACK & DRUM 專輯封面：米白紙紋與紅色香菇';
 document.querySelector('.title-subtitle').textContent='讓最初的旋律，帶著一切回來。';
 document.querySelector('#start-game').textContent=document.querySelector('#start-game').textContent.includes('繼續')?'繼續旅程 →':'開始旅程 →';
 document.querySelector('#play-fugata').textContent='♫ 試聽 Fugata';
 const story=document.querySelector('.ending-dialogue');
 const details=document.createElement('details');details.className='ending-story';
 const summary=document.createElement('summary');summary.textContent='旅程的最後一段對話';details.append(summary);story.replaceWith(details);details.append(story);
 const status=document.querySelector('.ending-scene-status span');status.textContent='RECONSTRUCTED';
}
