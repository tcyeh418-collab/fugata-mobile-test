import {KitRenderer} from './map1-renderer.mjs';
import {Map2KitRenderer} from '/fugata-mobile-test/mushroom-opening-map12-v1/output/map2-local-playtest-v1/kit-renderer.mjs';
import {Renderer} from '/fugata-mobile-test/mushroom-opening-map12-v1/mushroom-v2/dist/src/render.mjs?rev=map5-20261020-r1';
import {captureOpacity} from '/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/preview-game.mjs';
import {CampaignAudio} from './audio.mjs';
const canvas=document.getElementById('game');
const loadErrors=[];async function json(url,fallback){try{const r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}catch{loadErrors.push(url);return fallback;}}
const m1=await json('/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/assets/manifest-v1.json',{assets:[]});for(const a of m1.assets)a.file='/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/'+a.file;
const map1=new KitRenderer(canvas,m1);map1.backgroundManifest=await json('/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/background/manifest.json',null);
const m2=await json('/fugata-mobile-test/mushroom-opening-map12-v1/output/map2-local-playtest-v1/assets/manifest.json',{assets:[]});for(const a of m2.assets)a.file='/fugata-mobile-test/mushroom-opening-map12-v1/output/map2-local-playtest-v1/'+a.file;
const map2=new Map2KitRenderer(canvas,m2);map2.backgroundManifest=await json('/fugata-mobile-test/mushroom-opening-map12-v1/output/map2-green-corridor-v2/manifest.json',null);
await Promise.all([map1.load(),map2.load(),map1.ensureBackground(0),map2.ensureBackground(0)]);
const original=Renderer.prototype.draw;let lastGame=null,lastGranted=false;
export const campaignPresentation={map1,map2,loadErrors,audio:new CampaignAudio,captureOpacity,game:null,renderer:null,ready:true,resetMap1(g){map1.events=[];map1.notices=[];map1.speech=null;map1.lastPoliceX=null;map1.policeAnimator.reset();map1.bounceAt=-10;},feedback(event,g){map1.feedback([event],g);}};
Renderer.prototype.draw=function(g,dt=0){campaignPresentation.game=g;campaignPresentation.renderer=this;document.body.dataset.artMap=g.mapId;if(g.mapId!==1&&g.mapId!==2)return original.call(this,g,dt);
 const kit=g.mapId===1?map1:map2,width=g.level.worldWidth??g.level.CONFIG?.worldWidth??36000;
 if(lastGame!==g){if(g.mapId===1)campaignPresentation.resetMap1(g);this.camera=0;lastGame=g;lastGranted=false;}
 const target=Math.max(0,Math.min(width-this.canvas.width,g.player.x-this.canvas.width*.34));
 if(g.capture?.resolved&&!g.capture.cameraReset){this.camera=target;g.capture.cameraReset=true;}
 if(['playing','police-caught'].includes(g.mode))this.camera+=(target-this.camera)*Math.min(1,dt*5);
 kit.camera=Math.round(this.camera/2)*2;
 if(g.mapId===2){if(g.mode!=='paused')kit.animationTime+=dt;if(g.drumsticksGranted&&!lastGranted)kit.grantFeedback=kit.animationTime;lastGranted=g.drumsticksGranted;}
 void kit.ensureBackground(kit.camera);kit.draw(g,dt);
};
window.campaignPresentation=campaignPresentation;

const failed=loadErrors.length+map1.loads.filter(x=>!x.ok).length+map2.loads.filter(x=>!x.ok).length;if(failed){const status=document.getElementById('campaignLoadStatus');status.hidden=false;status.textContent='部分美術載入失敗，已使用替代外觀，仍可遊玩。重新整理可重試。';}
