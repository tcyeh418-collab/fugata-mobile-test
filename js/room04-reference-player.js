import {controlDoor04Reference} from './door04.js';
import {isRoom04Review} from './room04-review.js';
export const referenceTime=seconds=>{const n=Math.max(0,Math.floor(Number(seconds)||0));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
export function createRoom04ReferencePlayer(getState,audio,input,canvas){
 const dialog=document.createElement('dialog');dialog.className='room04-reference-player';dialog.setAttribute('aria-labelledby','room04-reference-title');
 dialog.innerHTML=`
  <header class="reference-heading"><span class="reference-rivets" aria-hidden="true"><i></i><i></i><i></i></span><h2 id="room04-reference-title">參考播放器</h2><button type="button" data-reference-close aria-label="關閉參考聆聽">×</button></header>
  <div class="reference-art"><img src="assets/art/fugata/room04/dark-v1/background-clean-v1.png" alt="聲部編織室的古銅機械封面"><div class="reference-cover-type"><small>LOGIC CODE · CHAPTER II</small><strong>FUGATA</strong><span>聲部的編織</span></div><b class="reference-cover-number" aria-hidden="true">04</b></div>
  <section class="reference-meta"><h3>聲部參考混音</h3><p>第四室 · 聆聽不同聲部的進場</p><small>全長 <span data-reference-duration>0:00</span></small></section>
  <div class="reference-timeline"><label for="room04-reference-seek" class="reference-sr-only">聆聽位置</label><input id="room04-reference-seek" type="range" min="0" max="0" step="0.05" value="0" aria-label="參考音檔播放位置"><div class="reference-times"><output data-reference-position>0:00</output><span data-reference-remaining>−0:00</span></div></div>
  <div class="reference-buttons"><button type="button" data-reference-back aria-label="後退 5 秒" title="後退 5 秒"><svg viewBox="0 0 28 24" aria-hidden="true"><path d="M14 5 4 12l10 7V5Zm11 0-10 7 10 7V5Z" fill="currentColor"/></svg><small>5 秒</small></button><button type="button" data-reference-play data-playing="false" aria-label="播放" title="播放"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="reference-play-symbol" d="m8 5 11 7-11 7Z" fill="currentColor"/><path class="reference-pause-symbol" d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor"/></svg></button><button type="button" data-reference-forward aria-label="前進 5 秒" title="前進 5 秒"><svg viewBox="0 0 28 24" aria-hidden="true"><path d="m3 5 10 7-10 7V5Zm11 0 10 7-10 7V5Z" fill="currentColor"/></svg><small>5 秒</small></button></div>
  <footer class="reference-foot"><button type="button" data-reference-restart>↺ 從頭播放</button><span>拖曳時間軸，重聽參考點</span></footer><span data-reference-notice role="status"></span>`;
 canvas.closest('#game-screen').append(dialog);
 const range=dialog.querySelector('input'),play=dialog.querySelector('[data-reference-play]'),notice=dialog.querySelector('[data-reference-notice]');
 let scrubbing=false,seekTimer=null,dragTimer=null,loading=false,generation=0;
 const seek=()=>{clearTimeout(seekTimer);seekTimer=null;const ok=audio.seekDoor04Reference?.(Number(range.value));if(!ok)notice.textContent='音檔尚未就緒，請稍後再試。';};
 const close=()=>{generation++;loading=false;clearTimeout(seekTimer);clearTimeout(dragTimer);seekTimer=dragTimer=null;scrubbing=false;audio.pauseDoor04Reference?.();const s=getState();s.ui.room04ReferenceOpen=false;s.ui.room04ReferenceRequested=false;if(dialog.open)dialog.close();input.reset();if(s.phase==='game')canvas.focus({preventScroll:true});};
 dialog.querySelector('[data-reference-close]').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('close',()=>{if(getState().ui.room04ReferenceOpen)close();});
 async function transport(restart=false){
  if(loading)return;const ticket=++generation;loading=true;notice.textContent='正在準備音檔…';
  try{const resumed=await audio.resume?.();if(ticket!==generation)return;if(resumed===false){notice.textContent='聲音尚未啟動，請再按一次播放。';return;}
   await audio.preloadAssets?.();const s=getState();if(ticket!==generation||!dialog.open||s.gameProgress.currentRoom!==4)return;
   if(!(audio.getDoor04ReferenceProgress?.().duration>0)){notice.textContent='音檔尚未就緒，請稍後重試。';return;}
   notice.textContent='';controlDoor04Reference(s,audio,restart,{fromPlayer:true});input.reset();
  }catch{if(ticket===generation)notice.textContent='音檔暫時無法載入，請再試一次。';}finally{if(ticket===generation)loading=false;}
 }
 play.onclick=()=>void transport();
 const jump=delta=>{const p=audio.getDoor04ReferenceProgress?.();if(p?.duration>0)audio.seekDoor04Reference?.(p.position+delta);};
 dialog.querySelector('[data-reference-back]').onclick=()=>jump(-5);dialog.querySelector('[data-reference-forward]').onclick=()=>jump(5);
dialog.querySelector('[data-reference-restart]').onclick=()=>void transport(true);
 range.addEventListener('input',()=>{scrubbing=true;dialog.querySelector('[data-reference-position]').textContent=referenceTime(range.value);clearTimeout(seekTimer);seekTimer=setTimeout(seek,90);clearTimeout(dragTimer);dragTimer=setTimeout(()=>{scrubbing=false;},220);});
 range.addEventListener('change',()=>{seek();scrubbing=false;});
 return {element:dialog,render(s){
  const eligible=s.phase==='game'&&s.gameProgress.currentRoom===4&&isRoom04Review(s)&&!s.roomTransition.active;
  if(!eligible){if(dialog.open)close();s.ui.room04ReferenceRequested=false;return;}
  if(s.ui.room04ReferenceRequested&&!dialog.open){s.ui.room04ReferenceRequested=false;s.ui.room04ReferenceOpen=true;input.reset();notice.textContent='';if(s.ui.room04ReferenceRestart)audio.seekDoor04Reference?.(0);s.ui.room04ReferenceRestart=false;dialog.showModal();void audio.resume?.();}
  if(!dialog.open)return;
  const p=audio.getDoor04ReferenceProgress?.()??{duration:0,position:0,playing:false};range.max=String(p.duration);range.disabled=p.duration<=0;
  if(!scrubbing){range.value=String(p.position);dialog.querySelector('[data-reference-position]').textContent=referenceTime(p.position);}
  range.setAttribute('aria-valuetext',`${referenceTime(scrubbing?range.value:p.position)}，共 ${referenceTime(p.duration)}`);
  dialog.querySelector('[data-reference-duration]').textContent=referenceTime(p.duration);play.dataset.playing=String(p.playing);play.setAttribute('aria-label',p.playing?'暫停':'播放');play.title=p.playing?'暫停':'播放';play.disabled=loading;
  dialog.querySelector('[data-reference-remaining]').textContent='−'+referenceTime(p.duration-(scrubbing?Number(range.value):p.position));
  for(const button of dialog.querySelectorAll('[data-reference-back],[data-reference-forward]'))button.disabled=p.duration<=0;
 }};
}
