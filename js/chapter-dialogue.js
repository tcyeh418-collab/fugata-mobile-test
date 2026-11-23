import {currentDialogueEntry,advanceDialogue} from './dialogue.js';
export function createChapterDialogue(getState,input,canvas){
 if(canvas.dataset.artTrial!=='dark-v1')return {render(){}};
 const dialog=document.createElement('dialog');dialog.className='chapter-dialogue';
 dialog.setAttribute('aria-labelledby','chapter-dialogue-speaker');dialog.setAttribute('aria-describedby','chapter-dialogue-copy');
 dialog.innerHTML='<small data-story-progress></small><h2 id="chapter-dialogue-speaker"></h2><p id="chapter-dialogue-copy"></p><button type="button" autofocus>繼續</button>';
 document.body.append(dialog);
 const button=dialog.querySelector('button');
 function close(){if(dialog.open)dialog.close();input.reset();canvas.focus({preventScroll:true});}
 function next(){const s=getState();if(!s.dialogue.active)return;advanceDialogue(s);input.reset();if(!s.dialogue.active)close();}
 button.onclick=next;
 dialog.addEventListener('keydown',event=>{if(['Enter','Space'].includes(event.code)){event.preventDefault();if(!event.repeat)next();}});
 dialog.addEventListener('cancel',event=>{event.preventDefault();const s=getState();if(s.dialogue.index===s.dialogue.entries.length-1)next();});
 return {render(s){
  s.ui.dialogueInDom=true;
  const entry=currentDialogueEntry(s);if(s.phase!=='game'||!entry){if(dialog.open)close();return;}
  dialog.querySelector('[data-story-progress]').textContent=`${s.dialogue.sequenceId==='intro'?'序章':'FUGATA'} / ${s.dialogue.index+1} · ${s.dialogue.entries.length}`;
  dialog.querySelector('h2').textContent=entry.speaker;dialog.querySelector('p').textContent=entry.text;
  button.textContent=s.dialogue.index===s.dialogue.entries.length-1?'開始探索':'繼續 →';
  if(!dialog.open){input.reset();dialog.showModal();button.focus();}
 }};
}
