import {mountStoryboard} from './storyboard.mjs?rev=opening-v8-r1';
document.body.dataset.review='true';
const start=document.getElementById('start');start.disabled=true;
const trial=mountStoryboard();window.storyboardTrial=trial;if(!trial.completed)trial.play();
await import('./app.mjs?rev=campaign12-online-20261119-v1-r1');
start.disabled=false;
const replay=document.createElement('button');replay.id='storyboardReplay';replay.className='text-button';replay.textContent='重看故事';replay.onclick=()=>trial.play();document.getElementById('title').append(replay);
