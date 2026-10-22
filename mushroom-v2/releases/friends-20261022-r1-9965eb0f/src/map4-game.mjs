import {restoreSpores,COLLECTION_REVISION} from './collection.mjs';
import {Map3Game,cleanGiant} from './map3-game.mjs?rev=map5-20261020-r1';
import {CONFIG} from './map.mjs?rev=map5-20261020-r1';
import * as M from './map4.mjs?rev=map5-20261020-r1';
import {rectanglesOverlap} from './legacy.mjs?rev=map5-20261020-r1';
const emptyBuffs=()=>({drumsticks:0,magnet:0,kickSpring:0,limit:0});
const safeBuffs=value=>Object.fromEntries(Object.keys(emptyBuffs()).map(k=>[k,Math.min(M.POWER_UPS[k].duration,Math.max(0,Number(value?.[k])||0))]));
export class Map4Game extends Map3Game{
 get rules(){return M;}
 constructor({runState={},random=Math.random}={}){super({runState});this.initialCarry=structuredClone(runState??{});this.random=random;}
 reset(){
  this.level={...this.rules,PLATFORMS:this.rules.PLATFORMS.map(p=>({...p}))};super.reset();this.mapId=this.rules.id;this.bearBeatEventCompleted=true;this.breakables=[];this.emitters=this.rules.EMITTERS.map(e=>({...e,phase:'idle',timer:0,index:0}));
  this.falling=this.rules.FALLING_PLATFORMS.map(p=>({...p,state:'stable',timer:0,fallY:p.y,vy:0}));this.crushers=this.rules.CRUSHERS.map(c=>({...c,activatedAt:null,lastPhase:'safe'}));
  this.buffs=emptyBuffs();this.bonusSpores=0;this.advancedDanceCleared=false;this.map4GachaUsed=false;this.gachaReward=null;this.gachaRewardGranted=false;this.gachaAnimation=0;this.history={};this.lastSpikePhases={};this.secretVisits=0;this.hasMushroomArtCard03=false;this.refreshSurfaces();
 }
 start(){this.reset();const c=this.initialCarry??{};Object.assign(this,cleanGiant(c));this.player.hp=Math.max(1,Math.min(3,Math.floor(c.hp)||3));this.bonusSpores=Math.max(0,Math.floor(c.bonusSpores)||0);this.buffs=safeBuffs(c.buffs);this.advancedDanceCleared=c.advancedDanceCleared===true;this.hasMushroomArtCard03=c.hasMushroomArtCard03===true;this.history=structuredClone(c.physicalSporeProgress??{});this.mode='playing';}
 get currentSection(){return this.rules.sectionAt(this.player.x).id;}
 get inBearSafeZone(){return this.player.x>=this.rules.GACHA.safeStart&&this.player.x<=this.rules.GACHA.safeEnd;}
 get moveSpeed(){return (this.player.crouching?180:CONFIG.speed)*(this.buffs?.drumsticks>0?this.rules.POWER_UPS.drumsticks.speedMultiplier:1);}
 get jumpPower(){return CONFIG.jump*(this.buffs?.kickSpring>0?this.rules.POWER_UPS.kickSpring.jumpMultiplier:1);}
 get runState(){return {...cleanGiant(this),hp:this.player.hp,bonusSpores:this.bonusSpores,buffs:{...this.buffs},physicalSporeProgress:{...this.history,4:{collected:this.count,total:20,ids:this.spores.filter(s=>s.collected).map(s=>s.id)}},advancedDanceCleared:this.advancedDanceCleared,hasMushroomArtCard03:this.hasMushroomArtCard03,map4GachaUsed:this.map4GachaUsed,gachaReward:this.gachaReward,gachaRewardGranted:this.gachaRewardGranted,nextMapId:this.mode==='result'?5:4};}
 get gachaProgress(){return Math.max(0,Math.min(1,1-this.gachaAnimation/this.rules.GACHA.animationDuration));}
 get gachaPhase(){return this.gachaProgress<.4?'rolling':this.gachaProgress<.7?'dropping':'opening';}
 get canUseGacha(){return this.mode==='playing'&&this.player.grounded&&!this.respawn&&Math.abs(this.player.x-this.rules.GACHA.x)<this.rules.GACHA.radius&&!this.map4GachaUsed;}
 useGacha(){if(!this.canUseGacha)return false;const n=Number(this.random());this.gachaReward=this.rules.GACHA_POOL[Math.max(0,Math.min(4,Math.floor((Number.isFinite(n)?n:0)*5)))];this.map4GachaUsed=true;this.gachaAnimation=this.rules.GACHA.animationDuration;this.player.vx=0;this.mode='gacha';this.emit('gacha-roll');return true;}
 grantGachaReward(){if(!this.map4GachaUsed||this.gachaRewardGranted)return false;const reward=this.rules.POWER_UPS[this.gachaReward];if(!reward)return false;this.gachaRewardGranted=true;if(this.gachaReward==='capsule')this.bonusSpores+=reward.bonusSpores;else this.buffs[this.gachaReward]=reward.duration;this.mode='gacha-reward';this.emit('gacha-reward');return true;}
 closeGacha(){if(this.mode==='gacha-reward'){this.mode='playing';this.emit('gacha-close');}}
 get canEnterSecret(){return this.mode==='playing'&&!this.respawn&&this.player.grounded&&Math.abs(this.player.x-this.rules.SECRET.x)<this.rules.SECRET.radius;}
 enterSecret(){if(!this.canEnterSecret)return false;this.mode='studio-passage';this.player.vx=0;this.player.crouching=false;this.projectiles=[];this.secretVisits++;this.emit('secret-enter');return true;}
 completeDance(){if(this.mode!=='dance')return false;this.advancedDanceCleared=true;this.hasMushroomArtCard03=true;this.mode='advanced-clear';this.emit('advanced-clear');return true;}
 exitSecret(){if(!['studio-passage','studio-talk','dance-preview','dance','advanced-clear'].includes(this.mode))return false;this.teleport({x:this.rules.SECRET.returnX,y:590});this.safe={x:this.rules.SECRET.returnX,y:590};this.invulnerable=1;this.mode='playing';this.emit('secret-exit');return true;}
 pause(){if(['playing','dance'].includes(this.mode)){this.resumeMode=this.mode;this.mode='paused';this.jumpBuffer=0;}else if(this.mode==='paused'){this.mode=this.resumeMode??'playing';this.resumeMode=null;}}
 projectileHit(kind='projectile-hurt'){if(this.buffs.limit>0)return false;return super.projectileHit(kind);}
 refreshSurfaces(){this.level.PLATFORMS=[...this.rules.STATIC_PLATFORMS,...this.falling.filter(p=>p.state==='stable'||p.state==='warning').map(p=>({...p}))];}
 updateFalling(dt){for(const p of this.falling){if(p.state==='warning'){p.timer-=dt;if(p.timer<=0){p.state='falling';p.timer=0;p.vy=0;this.emit('platform-fall');}}else if(p.state==='falling'){p.vy+=this.rules.FALLING_CONFIG.gravity*dt;p.fallY+=p.vy*dt;if(p.fallY>this.rules.FALLING_CONFIG.fallLimit){p.state='reforming';p.timer=this.rules.FALLING_CONFIG.reformDelay;}}else if(p.state==='reforming'){p.timer-=dt;if(p.timer<=0){p.state='stable';p.fallY=p.y;}}}this.refreshSurfaces();}
 spikeAt(s){return this.rules.cycleAt(this.time,this.rules.SPIKE_TIMING,s.offset);}
 crusherAt(c){return c.activatedAt===null?{phase:'safe',extension:0}:this.rules.cycleAt(this.time-c.activatedAt,this.rules.CRUSHER_TIMING);}
 updateTraps(oldX){
  const p=this.player,body={x:Math.min(oldX,p.x)-15,y:p.y-(p.crouching?22:42),width:Math.abs(p.x-oldX)+30,height:p.crouching?22:42};
  for(const s of this.rules.SPIKES){const state=this.spikeAt(s);if(this.lastSpikePhases[s.id]!==state.phase){if(state.phase==='warning'&&Math.abs(p.x-s.x)<this.visibleWorldWidth*.8)this.emit('trap-warning');this.lastSpikePhases[s.id]=state.phase;}if(state.extension>.15&&rectanglesOverlap(body,{x:s.x,y:590-30*state.extension,width:s.width,height:30*state.extension}))this.projectileHit('spike-hurt');}
  for(const c of this.crushers){if(c.activatedAt===null&&this.visibleWorldWidth>0&&Math.abs(p.x-c.x)<this.visibleWorldWidth*.85)c.activatedAt=this.time;const state=this.crusherAt(c);if(c.lastPhase!==state.phase){if(state.phase==='warning'&&Math.abs(p.x-c.x)<this.visibleWorldWidth)this.emit('trap-warning');c.lastPhase=state.phase;}const bottom=c.raisedBottom+(590-c.raisedBottom)*state.extension;if(state.extension>0&&rectanglesOverlap(body,{x:c.x,y:bottom-c.height,width:c.width,height:c.height}))this.projectileHit('crusher-hurt');}
 }
 updateMagnet(dt){if(this.buffs.magnet<=0)return;const c=this.rules.POWER_UPS.magnet,target={x:this.player.x,y:this.player.y-22};for(const s of this.spores){if(s.collected)continue;const dx=target.x-s.x,dy=target.y-s.y,d=Math.hypot(dx,dy);if(d>c.range)continue;const step=Math.min(d,c.pullSpeed*dt);if(d>0){s.x+=dx/d*step;s.y+=dy/d*step;}if(d<24){s.collected=true;this.emit('spore');}}}
 step(dt,input={}){
  dt=Math.max(0,Math.min(dt,1/30));if(this.mode==='gacha'){this.gachaAnimation-=dt;if(this.gachaAnimation<=0)this.grantGachaReward();return;}if(this.mode!=='playing')return;
  const respawning=this.respawn>0,oldX=this.player.x;
  if(!respawning){for(const key of Object.keys(this.buffs))this.buffs[key]=Math.max(0,this.buffs[key]-dt);this.updateFalling(dt);}
  super.step(dt,input);if(this.mode==='result')this.buffs=emptyBuffs();if(this.mode!=='playing'||this.respawn>0||respawning)return;
  if(this.player.y<this.rules.PLAYER_TOP_BOUND){this.player.y=this.rules.PLAYER_TOP_BOUND;this.player.vy=Math.max(0,this.player.vy);}
  for(const p of this.falling)if(p.state==='stable'&&this.player.support===p.id){p.state='warning';p.timer=this.rules.FALLING_CONFIG.warningDelay;this.emit('platform-warning');}
  this.updateMagnet(dt);this.updateTraps(oldX);
  if(input.interact){if(this.canUseGacha)this.useGacha();else this.enterSecret();}
 }
 snapshot(){return {...super.snapshot(),collectionRevision:COLLECTION_REVISION,revision:4,map4:true,worldTime:this.time,...this.runState,hasMushroomArtCard03:this.hasMushroomArtCard03,gachaAnimation:this.gachaAnimation,gachaPending:this.mode==='gacha',rewardPending:this.mode==='gacha-reward',secretVisits:this.secretVisits,crushers:this.crushers.map(c=>({id:c.id,activatedAt:c.activatedAt}))};}
 restore(saved,authoritativeRun){
  if(!saved||saved.revision!==4||!saved.map4)return false;this.start();
  this.spores=restoreSpores(this.spores,saved,{sameLayout:true});
  this.checkpoint=this.rules.CHECKPOINTS.find(c=>c.id===saved.checkpointId)??null;const at=saved.safe;this.safe=at&&at.y===590&&Number.isFinite(at.x)&&this.rules.GROUND.some(s=>at.x>s.x+85&&at.x<s.x+s.width-85)?{x:at.x,y:590}:this.checkpoint?{x:this.checkpoint.x,y:590}:{x:180,y:590};this.teleport(this.safe);
  this.player.hp=Math.max(1,Math.min(3,Math.floor(saved.hp)||3));if(saved.hp<=0&&saved.respawn>0){this.player.hp=0;this.respawn=Math.min(.9,Number(saved.respawn));}this.elapsed=Math.max(0,Number(saved.elapsed)||0);this.time=Math.max(0,Number(saved.worldTime)||0);this.deaths=Math.max(0,Math.floor(saved.deaths)||0);this.falls=Math.max(0,Math.floor(saved.falls)||0);
  const state=authoritativeRun??saved;Object.assign(this,cleanGiant(state));this.buffs=safeBuffs(state.buffs);this.bonusSpores=Math.max(0,Math.floor(state.bonusSpores)||0);this.advancedDanceCleared=state.advancedDanceCleared===true;this.hasMushroomArtCard03=state.hasMushroomArtCard03===true;this.history=structuredClone(state.physicalSporeProgress??{});
  this.map4GachaUsed=state.map4GachaUsed===true;this.gachaReward=this.rules.GACHA_POOL.includes(state.gachaReward)?state.gachaReward:null;this.gachaRewardGranted=state.gachaRewardGranted===true;
  if(this.map4GachaUsed&&!this.gachaRewardGranted&&this.gachaReward){this.mode='gacha';this.gachaAnimation=Math.min(this.rules.GACHA.animationDuration,Math.max(.1,Number(saved.gachaAnimation)||.1));}else if(saved.rewardPending&&this.gachaRewardGranted)this.mode='gacha-reward';
  for(const c of this.crushers){const old=saved.crushers?.find(s=>s.id===c.id);if(Number.isFinite(old?.activatedAt)&&old.activatedAt<=this.time)c.activatedAt=old.activatedAt;}
  this.secretVisits=Math.max(0,Math.floor(saved.secretVisits)||0);this.invulnerable=1.2;return true;
 }
}
