import {mountStoryboard} from './storyboard.mjs?rev=opening-v8-edit-r5';
document.body.dataset.review='true';
const start=document.getElementById('start');start.disabled=true;
const boot=document.createElement('div');boot.id='campaignBoot';boot.setAttribute('role','status');boot.style.cssText='position:fixed;inset:0;z-index:100;background:#101c29;color:#f3e5cb;display:grid;place-content:center;text-align:center;font:18px system-ui;padding:24px';boot.textContent='MUSHROOM 菇 · 正在準備旅程…';document.body.append(boot);
const trial=mountStoryboard();window.storyboardTrial=trial;
try{
 const storyReady=trial.completed?Promise.resolve():trial.prepare((done,total)=>{boot.textContent=`正在準備故事… ${done} / ${total}`;});
 await Promise.all([import('./app.mjs?rev=campaign12-online-20261119-v1-r1'),storyReady]);
 const settings=document.createElement('div');settings.className='pause-settings';settings.setAttribute('aria-label','顯示與聲音設定');settings.append(document.getElementById('fullscreen'),document.getElementById('sound'));document.getElementById('paused').append(settings);
 await new Promise(resolve=>requestAnimationFrame(resolve));
 start.disabled=false;
 if(!trial.completed){
  boot.textContent='MUSHROOM 菇';const begin=document.createElement('button');begin.id='storyboardBegin';begin.textContent='開始故事';begin.style.cssText='margin-top:20px;padding:12px 28px;font:inherit;cursor:pointer';boot.append(begin);
  begin.onclick=async()=>{begin.disabled=true;try{await trial.play();boot.remove();}catch{begin.disabled=false;begin.textContent='重新開始故事';}};
 }else boot.remove();
 const replay=document.createElement('button');replay.id='storyboardReplay';replay.className='text-button';replay.textContent='重看故事';replay.onclick=async()=>{boot.textContent='正在準備故事…';document.body.append(boot);try{await trial.prepare();boot.remove();await trial.play();}catch{boot.textContent='故事暫時無法載入，請重新整理後重試。';}};document.getElementById('title').append(replay);
}catch{boot.textContent='旅程暫時無法載入，請確認網路後重試。';const retry=document.createElement('button');retry.textContent='重新載入';retry.style.cssText='margin-top:20px;padding:12px;font:inherit';retry.onclick=()=>location.reload();boot.append(retry);}
