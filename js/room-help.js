import { DOOR03_EDUCATION } from './dialogue.js';
export const ROOM_HELP={
 1:['找出最初的樂句主題','若想重溫完整 Fugata 主題，可到左側留聲機按 E 從頭播放；再按 E 才會停止。','到五座星核裝置，按 E 或選「試聽」比較旋律。主題播放中需先回留聲機停止。','Enter 拿取或交換片段；帶到右側主題之門，按 E 提交。錯答可重新比較。','完成後走向右側已開啟的出口，前往第二室。'],
 2:['聽見主題的回應','先靠近主題終端按 E，再聆聽各座回應塔。','在回應塔按 Enter 連接並提交；錯答後可選另一座。','答句門開啟後走進右側門洞，人物會沿透視方向離場。'],
 3:['組建模組合成器','先靠近振盪器按 E 檢查，閱讀目前接線目標。','選輸出端按 Enter，再到輸入端按 Enter 接線；Q 可切換附近端口，Esc 取消未完成的線。E 可監聽。','完成接線並收起對話後，循「前往第四室」提示走進右側背景門口。'],
 4:['依次排列並聆聽聲部組合','先在後方中央參考聆聽台聽完整串參考；E 可暫停／續播，Space 從頭重播。','到音匣基座按 E 試聽、Enter 拿取；靠近中央編排台的已解鎖位置按 Enter 放入。已占用位置可拿回或交換，Esc 歸還手中音匣。','到右側序列測試台按 E，或用序列控制列「從頭播放」。依擺放順序逐段完整接續，不重疊。播放時可移動，但拿放／試聽須先停止。整串結束才判定；之後逐步解鎖剩餘位置。','完成後從右側發光出口前往第五室。音匣甲乙丙丁只是識別名稱，與位置 1–4 沒有配對暗示。'],
 5:['讓九拍節奏向前奔跑','先到已解鎖的節奏終端按 E 聆聽並選擇階段。','靠近節奏環各點按 Enter 切換重音；到測試台按 Space。依提示調整，逐階段完成。','三階段完成後到最終節奏驅動台按 Space；等待出口開啟，往右進入第六室。'],
 6:['讓最初的樂句回來','依「下一個」提示，按 E 完整聆聽五座訊號裝置；之後到最終參考台聽至結束。','右側三個玻璃罐內的記憶碎片用 E 試聽、Enter 選取；Q 切換附近目標。選取後 Space 確認送回核心，Esc 返回比較。','核心重構完成後，走進右側持續發光的最終出口。']
};
export function currentObjective(s){
 const room=s.gameProgress.currentRoom,d=s['door0'+room];
 if(d.status==='open')return room===6?'最終出口已開啟，往右走進門洞。':`出口已開啟，往右前往第 ${room+1} 室。`;
 if(room===1)return s.gameProgress.heldFragmentId?'攜帶旋律，靠近右門按 E 提交。':'聆聽星核片段，找出樂句主題。';
 if(room===2)return '先聽主題，再比較回應塔；按 Enter 提交。';
 if(room===3)return d.oscillatorDiscovered?`完成接線 ${d.completedEdgeIds.length}／6；查看本關接線提示。`:'先到振盪器按 E 檢查。';
 if(room===4){if(['preparing','testing'].includes(d.status))return d.status==='preparing'?'準備整串音訊中；可停止後修改排列。':`依序完整播放：第 ${d.activeEntryCount||1}／${d.testEntryCount} 段 · ${Math.round((d.testProgress||0)*100)}%`;return !d.referenceCompleted?'完整聽完參考；可先拿放及試聽音匣。':`已確認 ${d.confirmedEntryCount}／4；放入本階段位置，再從頭播放測試。`;}
 if(room===5)return `節奏階段已完成 ${d.completedPhaseIds.length}／3；${d.finalLaunchReady?'前往最終驅動台按 Space。':'聆聽、選重音，測試台按 Space。'}`;
 if(d.status==='confirming')return '確認所選的記憶片段。';
 return !d.finalReferenceUnlocked?`完整回復訊號 ${d.activatedRelayCount}／5。`:!d.finalReferenceCompleted?'到最終參考台完整聆聽。':'比較右側玻璃罐內的三段記憶；選取後 Space 確認。';
}
export const HINT_VISIBILITY_KEY='fugata.hints.visible.v1';
export function readHintVisibility(storage){
 try{return storage?.getItem(HINT_VISIBILITY_KEY)==='true';}catch{return false;}
}
export function writeHintVisibility(storage,visible){
 try{storage?.setItem(HINT_VISIBILITY_KEY,String(Boolean(visible)));}catch{}
}
export function shouldAutoOpenRoomHelp(){
 return false;
}
export function createRoomHelp(getState,input,onSave,settingsStorage=null){
 let hintsVisible=readHintVisibility(settingsStorage);
 const controls=document.createElement('section');controls.className='room-help-bar';controls.innerHTML='<strong id="current-objective"></strong><span class="room-help-actions"><button data-hint-toggle type="button" aria-pressed="false">顯示提示</button><button data-room-help type="button">本關說明</button></span>';
 document.querySelector('#game-screen .game-header').after(controls);
 const dialog=document.createElement('dialog');dialog.className='room-help-dialog';dialog.setAttribute('aria-labelledby','room-help-title');dialog.innerHTML='<h2 id="room-help-title"></h2><ol></ol><p>方向鍵／WASD 移動；靠近後滑鼠點選，再選動作。Q 切換附近目標，Tab 移到介面按鈕。</p><details data-learning hidden><summary>延伸解說</summary><div></div></details><button type="button">知道了，繼續</button>';document.body.append(dialog);
 const objective=controls.querySelector('#current-objective');
 const hintToggle=controls.querySelector('[data-hint-toggle]');
 const helpButton=controls.querySelector('[data-room-help]');
 function syncHintControls(){
  const state=getState();
  state.ui.hintsVisible=hintsVisible;
  if(!hintsVisible){state.ui.contextHint.visible=false;state.ui.contextHint.compactVisible=false;state.ui.completionMarker=null;}
  document.documentElement.dataset.hintsVisible=String(hintsVisible);
  controls.dataset.hintsVisible=String(hintsVisible);
  objective.hidden=!hintsVisible;
  hintToggle.textContent=hintsVisible?'隱藏提示':'顯示提示';
  hintToggle.setAttribute('aria-pressed',String(hintsVisible));
 }
 const busy=s=>s.dialogue.active||s.roomTransition.active||['preparing','testing'].includes(s.door04.status)||s.door04.referencePlaybackStatus==='playing'||['confirming','relay-playing','relay-replay','reference-playing','reconstructing','opening'].includes(s.door06.status)||['testing','completion-spinning','completion-hold','launching','opening'].includes(s.door05.status);
 function close(){const s=getState();dialog.close();s.tutorialOpen=false;input.reset();onSave();document.querySelector('#game-canvas').focus({preventScroll:true});}
 function open(){const s=getState();if(s.phase!=='game'||busy(s))return;const info=ROOM_HELP[s.gameProgress.currentRoom];dialog.querySelector('h2').textContent=`第 ${s.gameProgress.currentRoom} 室｜${info[0]}`;const list=dialog.querySelector('ol');list.replaceChildren(...info.slice(1).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));const learning=dialog.querySelector('[data-learning]');const content=learning.querySelector('div');content.replaceChildren();learning.open=false;
 const entries=s.gameProgress.currentRoom===3&&s.door03.oscillatorDiscovered
   ? DOOR03_EDUCATION[Math.min(6,s.door03.completedEdgeIds.length)]
   : s.ui.learningNote?.room===s.gameProgress.currentRoom?s.ui.learningNote.entries:[];
 learning.hidden=!entries?.length;
 for(const entry of entries??[]){const paragraph=document.createElement('p');paragraph.textContent=entry.text;content.append(paragraph);}
 s.gameProgress.tutorialRooms??=[];if(!s.gameProgress.tutorialRooms.includes(s.gameProgress.currentRoom))s.gameProgress.tutorialRooms.push(s.gameProgress.currentRoom);s.tutorialOpen=true;input.reset();dialog.showModal();onSave();}
 function toggleHints(){hintsVisible=!hintsVisible;writeHintVisibility(settingsStorage,hintsVisible);syncHintControls();document.querySelector('#game-canvas').focus({preventScroll:true});}
 hintToggle.onclick=toggleHints;
 helpButton.onclick=open;dialog.querySelector(':scope > button').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 syncHintControls();
 return {render(s){if(s.ui.hintsVisible!==hintsVisible)syncHintControls();if(dialog.open&&s.dialogue.active){dialog.close();s.tutorialOpen=false;input.reset();}controls.hidden=s.phase!=='game';objective.textContent=currentObjective(s);helpButton.disabled=busy(s);if(s.phase!=='game'&&dialog.open){dialog.close();s.tutorialOpen=false;}},close,toggleHints,controls,actions:controls.querySelector('.room-help-actions')};
}
