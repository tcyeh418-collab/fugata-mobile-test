import {ART_TRIAL_REVISION} from './art-trial-version.js';
// Presentation-only trial: keep puzzle, collision and save coordinates in the
// original 960 × 640 world. The new side architecture is scenery, not new paths.
import {isDarkRoom1Trial,darkRoom1Projection} from './dark-room1-layout.js';
export const WIDE_ROOM1 = Object.freeze({
  width: 1280, height: 720, scale: 1.125, offsetX: 100,
  background: 'assets/art/fugata/room01/observatory-background-wide-v1.png',
  extension: 'assets/art/fugata/room01/observatory-extension-v2.png',
});

export function wideRoom1Projection(width, height) {
  const displayHeight = Math.min(height, width * 9 / 16);
  const renderWidth = Math.max(1280, Math.round(720 * width / displayHeight));
  return {width: renderWidth, height:720, scale:1.125,
    offsetX:(renderWidth - 960 * 1.125) / 2, displayHeight};
}

export function isWideRoom1Trial(locationLike) {
  const query = new URLSearchParams(locationLike?.search ?? '');
  return ['127.0.0.1', 'localhost', '::1'].includes(locationLike?.hostname)
    && /^room[1-6]$/.test(query.get('test') ?? '')
    && query.get('artTrial') === 'wide-v1'
    && !query.has('mobile');
}

export function canvasPointToWorld(canvas, rect, clientX, clientY) {
  const scale = Number(canvas.dataset.projectionScale) || 1;
  const offsetX = Number(canvas.dataset.projectionOffsetX) || 0;
  const scaleY = Number(canvas.dataset.projectionScaleY) || scale;
  const offsetY = Number(canvas.dataset.projectionOffsetY) || 0;
  return {
    x: ((clientX - rect.left) * canvas.width / rect.width - offsetX) / scale
      + Number(canvas.dataset.cameraX || 0),
    y: ((clientY - rect.top) * canvas.height / rect.height - offsetY) / scaleY,
  };
}

export function installWideRoom1Shell(canvas, gameScreen) {
  const dark=isDarkRoom1Trial(window.location);
  if(dark)document.documentElement.classList.add('dark-chapter-trial');
  if (!dark&&!isWideRoom1Trial(window.location)) return;
  canvas.dataset.artTrial = dark?'dark-v1':'wide-v1';
  if(dark)canvas.dataset.artRevision=ART_TRIAL_REVISION;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../css/wide-room1.css', import.meta.url).href+(dark?'?previewRev='+ART_TRIAL_REVISION:'');
  document.head.append(stylesheet);
  const title = document.createElement('div');
  title.className = 'wide-room1-title';
  title.innerHTML = '<span>LOGIC CODE / CHAPTER II</span><strong>FUGATA〈賦〉<i>星圖觀測台</i></strong>';
  gameScreen.append(title);
  if(dark) title.querySelector('i').textContent='封存旋律的觀測室';
  const footer = document.createElement('footer');
  footer.className = 'wide-room1-footer';
  footer.innerHTML = '<div class="wide-caption"><span>FUGATA / OBSERVATORY</span><strong>找到旋律的種子</strong><small>第一室 · 樂句的主題</small></div><div class="wide-objective"><small>目前目標</small><strong></strong></div><div class="wide-keys"><span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽／提交</span><span><kbd>Enter</kbd> 拿取／放回</span></div>';
  gameScreen.append(footer);
  if(dark) footer.querySelector('.wide-caption > span').textContent='FUGATA / THE SEALED OBSERVATORY';
  if(dark){const carry=document.createElement('small');carry.className='dark-room1-carry';footer.querySelector('.wide-objective').append(carry);}
  const badge = document.createElement('a');
  badge.className = 'wide-room1-badge';
  badge.textContent = '原版對照 ↗';
  badge.href = 'index.html?test=room1';
  badge.target = '_blank';
  badge.rel = 'noopener';
  gameScreen.querySelector('.character-tools').prepend(badge);
  const room4Tools=document.createElement('button');room4Tools.type='button';room4Tools.className='wide-room4-tools';room4Tools.textContent='聲部工具';room4Tools.hidden=true;room4Tools.setAttribute('aria-expanded','false');
  room4Tools.onclick=()=>{const open=gameScreen.classList.toggle('dark-room4-tools-open');room4Tools.setAttribute('aria-expanded',String(open));canvas.focus({preventScroll:true});};
  gameScreen.querySelector('.character-tools').prepend(room4Tools);
  const frame = canvas.closest('.canvas-frame');
  const resize = () => {
    if (!document.documentElement.classList.contains('wide-room1')) return;
    const rect = frame.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const projection = dark?darkRoom1Projection(rect.width,rect.height):wideRoom1Projection(rect.width, rect.height);
    canvas.dataset.wideWidth = String(projection.width);
    canvas.style.height = `${projection.displayHeight}px`;
  };
  new ResizeObserver(resize).observe(frame);
  // Reuse the current objective; do not introduce another puzzle state machine.
  const sync = () => {
    const room2=dark&&gameScreen.dataset.room==='2';
    const room3=dark&&gameScreen.dataset.room==='3';
    const room4=dark&&gameScreen.dataset.room==='4';
    const room5=dark&&gameScreen.dataset.room==='5';
    const room6=dark&&gameScreen.dataset.room==='6';
    const active = (gameScreen.dataset.room==='1'||room2||room3||room4||room5||room6)&&!gameScreen.hidden;
    document.documentElement.classList.toggle('wide-room1', active);
    document.documentElement.classList.toggle('dark-room1', active&&dark);
    footer.hidden = !active;
    title.hidden = !active;
    badge.hidden = !active;
    room4Tools.hidden=!(active&&room4);
    if(!room4){gameScreen.classList.remove('dark-room4-tools-open');room4Tools.setAttribute('aria-expanded','false');}
    if (active) resize();
    else canvas.style.height = '';
    if(dark){
      title.querySelector('i').textContent=room6?'讓旋律回歸的重構室':room5?'九拍節奏的引擎室':room4?'聲部交織的編織室':room3?'讓聲音甦醒的合成工坊':room2?'主題與回應的回音廳':'封存旋律的觀測室';
      footer.querySelector('.wide-caption > span').textContent=room6?'FUGATA / THE RECONSTRUCTION VAULT':room5?'FUGATA / THE RHYTHM ENGINE':room4?'FUGATA / THE VOICE LOOM':room3?'FUGATA / THE SYNTH WORKSHOP':room2?'FUGATA / THE ECHO HALL':'FUGATA / THE SEALED OBSERVATORY';
      footer.querySelector('.wide-caption > strong').textContent=room6?'讓最初的旋律回來':room5?'讓九拍向前奔跑':room4?'讓聲部交織':room3?'讓聲音活起來':room2?'主題的回應':'找到旋律的種子';
      footer.querySelector('.wide-caption > small').textContent=room6?'第六室 · 樂句的回歸':room5?'第五室 · 節奏驅動':room4?'第四室 · 聲部的進場與編織':room3?'第三室 · 組建模組合成器':room2?'第二室 · 樂句的主題答句':'第一室 · 樂句的主題';
      const ordinal=['','第一室','第二室','第三室','第四室','第五室','第六室'][Number(gameScreen.dataset.chapterPosition)||Number(gameScreen.dataset.room)];
      footer.querySelector('.wide-caption > small').textContent=footer.querySelector('.wide-caption > small').textContent.replace(/第[一二三四五六]室/,ordinal);
      if(room5){
        const d=canvas.dataset,phase=d.door05Phase||'基礎';
        const status=d.door05Status==='testing'?`第 ${d.door05TestBar||1}／2 小節 · 第 ${d.door05TestStep||'準備'} 拍`
          :['completion-spinning','completion-hold','launching','opening','open'].includes(d.door05Status)?'節奏引擎啟動'
          :`已選 ${d.door05SelectedCount||0}／3`;
        footer.querySelector('.wide-caption > small').textContent=`${['','第一室','第二室','第三室','第四室','第五室','第六室'][Number(gameScreen.dataset.chapterPosition)||5]} · 9/8 · ${phase} · ${status}`;
      }
      footer.querySelector('.wide-keys').innerHTML=room6?'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽</span><span><kbd>Enter</kbd> 選取記憶</span>':room5?'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽</span><span><kbd>Enter</kbd> 切換重音</span><span><kbd>Space</kbd> 測試</span>':room4?'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽／測試</span><span><kbd>Enter</kbd> 拿取／放入</span>':room3?'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 檢查／監聽</span><span><kbd>Enter</kbd> 接線</span><span><kbd>Esc</kbd> 取消</span>':room2?'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽</span><span><kbd>Enter</kbd> 連接／提交</span>':'<span><kbd>W A S D</kbd> 移動</span><span><kbd>E</kbd> 聆聽／提交</span><span><kbd>Enter</kbd> 拿取／放回</span>';
      badge.href=`index.html?test=room${room6?'6':room5?'5':room4?'4':room3?'3':room2?'2':'1'}`;
    }
    const objective = document.querySelector(room3?'#room03-objective-copy':dark&&!room2&&!room4&&!room5&&!room6?'#room01-objective-copy':'#current-objective');
    footer.querySelector('.wide-objective strong').textContent = objective?.textContent || '聆聽星核片段，找出樂句主題。';
    if(dark) footer.querySelector('.dark-room1-carry').textContent=room6?'回復五個訊號，聆聽最終參考，找回最初的主題。':room5?'依序完成基礎、推進、衝刺，啟動九拍引擎。':room4?(document.querySelector('[data-carried]')?.textContent||'攜帶中：無'):room3?`接線 ${document.querySelector('#room03-step-count')?.textContent||'0／6'} · Q 切換端口 · Esc 取消`:room2?'比較旋律輪廓，找出真正的回應。':`攜帶：${document.querySelector('#room01-carry-copy')?.textContent||'未攜帶'}`;
  };
  const observer = new MutationObserver(sync);
  observer.observe(gameScreen, { attributes: true, attributeFilter: ['data-room','data-chapter-position', 'hidden'] });
  if(dark)observer.observe(canvas,{attributes:true,attributeFilter:['data-door05-phase','data-door05-selected-count','data-door05-status','data-door05-test-step','data-door05-test-bar']});
  const objective = document.querySelector(dark?'#room01-objective-copy':'#current-objective');
  if (objective) observer.observe(objective, { childList: true, characterData: true, subtree: true });
  const room2Objective=document.querySelector('#current-objective');
  if(dark&&room2Objective)observer.observe(room2Objective,{childList:true,characterData:true,subtree:true});
  for(const selector of ['#room03-objective-copy','#room03-step-count','[data-carried]']){const item=document.querySelector(selector);if(dark&&item)observer.observe(item,{childList:true,characterData:true,subtree:true});}
  const carry=document.querySelector('#room01-carry-copy');
  if(dark&&carry)observer.observe(carry,{childList:true,characterData:true,subtree:true});
  sync();
}
