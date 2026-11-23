import {feedbackMessage} from './feedback-policy.js';

// Capture the complete error once. Reading must not depend on a fading toast's lifetime.
export function feedbackDialogContent(state){
 if(state.phase!=='game'||state.dialogue.active||state.tutorialOpen||state.ui.rewardsOpen||state.ui.room04ReferenceOpen||state.door06.status==='confirming')return null;
 const feedback=feedbackMessage(state);if(!feedback)return null;
 const source=state.ui.message;
 const current=source&&source.room===state.gameProgress.currentRoom&&source.kind===feedback.kind;
 return {source:current?source:null,kind:feedback.kind,
  title:feedback.kind==='rejected'?'再比較一次':feedback.kind==='audio'?'音訊提示':feedback.kind==='save-error'?'儲存提示':'操作提示',
  lines:[...(current?source.lines:feedback.lines)]};
}

export function createFeedbackDialog(getState,input,canvas){
 const enabled=canvas.dataset.artTrial==='dark-v1';
 if(!enabled)return {render(){}};
 const dialog=document.createElement('dialog');dialog.className='game-feedback-dialog';
 dialog.setAttribute('aria-labelledby','game-feedback-title');dialog.setAttribute('aria-describedby','game-feedback-copy');
 dialog.innerHTML='<small>FUGATA / NOTICE</small><h2 id="game-feedback-title"></h2><div id="game-feedback-copy"></div><button type="button" autofocus>繼續</button>';
 document.body.append(dialog);
 let active=null,lastFallback=null;
 const seen=new WeakSet();
 function close(){
  const s=getState();if(active?.source&&s.ui.message===active.source)s.ui.message=null;
  s.ui.feedbackDialogOpen=false;active=null;if(dialog.open)dialog.close();input.reset();canvas.focus({preventScroll:true});
 }
 dialog.querySelector('button').onclick=close;
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 return {render(s){
  s.ui.centeredFeedbackEnabled=true;
  if(s.phase!=='game'||s.roomTransition.active){if(dialog.open)close();return;}
  if(dialog.open)return;
  const content=feedbackDialogContent(s);
  if(!content){lastFallback=null;return;}
  const key=`${s.gameProgress.currentRoom}:${content.kind}:${content.lines.join('\n')}`;
  if(content.source?seen.has(content.source):key===lastFallback)return;
  if(content.source)seen.add(content.source);else lastFallback=key;
  active=content;s.ui.feedbackDialogOpen=true;input.reset();
  dialog.dataset.kind=content.kind;dialog.querySelector('h2').textContent=content.title;
  dialog.querySelector('#game-feedback-copy').replaceChildren(...content.lines.map(line=>{
   const p=document.createElement('p');p.textContent=line;return p;
  }));
  dialog.showModal();dialog.querySelector('button').focus();
 }};
}
