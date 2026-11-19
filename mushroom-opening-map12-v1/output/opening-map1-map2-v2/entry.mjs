import {mountStoryboard} from './storyboard.mjs?rev=opening-v8-r2';
document.body.dataset.review='true';
const start=document.getElementById('start');start.disabled=true;
const boot=document.createElement('div');boot.id='campaignBoot';boot.setAttribute('role','status');boot.style.cssText='position:fixed;inset:0;z-index:100;background:#101c29;color:#f3e5cb;display:grid;place-content:center;text-align:center;font:18px system-ui;padding:24px';boot.textContent='MUSHROOM 菇 · 正在準備旅程…';document.body.append(boot);
const trial=mountStoryboard();window.storyboardTrial=trial;
try{
 await import('./app.mjs?rev=campaign12-online-20261119-v1-r1');
 await new Promise(resolve=>requestAnimationFrame(resolve));
 start.disabled=false;boot.remove();
 if(!trial.completed)trial.play();
 const replay=document.createElement('button');replay.id='storyboardReplay';replay.className='text-button';replay.textContent='重看故事';replay.onclick=()=>trial.play();document.getElementById('title').append(replay);
}catch{boot.textContent='旅程暫時無法載入，請確認網路後重試。';const retry=document.createElement('button');retry.textContent='重新載入';retry.style.cssText='margin-top:20px;padding:12px;font:inherit';retry.onclick=()=>location.reload();boot.append(retry);}
