import {restoreSpores,COLLECTION_REVISION} from './collection.mjs';
import {Game} from './engine.mjs?rev=map5-20261020-r1';
import {CONFIG} from './map.mjs?rev=map5-20261020-r1';
import * as MAP2 from './map2.mjs?rev=map5-20261020-r1';
import {rectanglesOverlap} from './legacy.mjs?rev=map5-20261020-r1';
const {LEROY,LEROY_LINES,DRUMSTICKS,SECRET,EMITTERS,PROJECTILE,SPRINT}=MAP2;
export class Map2Game extends Game {
 constructor({hasMushroomArtCard01=false,runState={}}={}) {
  super(MAP2);
  this.permanentCard=hasMushroomArtCard01;this.entryHP=Math.max(1,Math.min(3,Math.floor(runState.hp)||3));this.chapterCarry=structuredClone(runState);
  this.hasMushroomArtCard01=hasMushroomArtCard01;
 }
 reset() {
  super.reset();
  this.leroySeen=false;this.dialogueIndex=0;this.giftTime=0;
  this.drumsticksGranted=false;this.drumsticksRemaining=0;this.sprintCleared=false;this.sprintAttempts=0;this.pendingSprintRetry=false;this.sprintRetryReason=null;
  this.hasMushroomArtCard01=this.permanentCard??false;
  this.cardAlreadyCollected=false;this.secretVisits=0;
  this.projectiles=[];
  this.emitters=EMITTERS.map(e=>({...e,phase:'idle',timer:0}));
 }
 start(){this.reset();this.player.hp=this.entryHP??3;this.isGiant=this.chapterCarry?.isGiant===true&&this.chapterCarry?.giantShield>0;this.giantShield=this.isGiant?1:0;this.mode='playing';this.emit('map2-start');}
 get moveSpeed(){return CONFIG.speed*(this.drumsticksRemaining>0?DRUMSTICKS.multiplier:1);}
 get canEnterSecret(){return this.mode==='playing'&&!this.respawn&&this.player.grounded&&Math.abs(this.player.x-SECRET.x)<SECRET.radius;}
 advanceDialogue() {
  if(this.mode!=='dialogue')return;
  if(this.dialogueIndex<LEROY_LINES.length-1)this.dialogueIndex++;
  else {this.mode='leroy-gift';this.giftTime=.85;this.emit('drum-fill');}
 }
 grantDrumsticks() {
  if(this.drumsticksGranted)return;
  this.drumsticksGranted=true;this.drumsticksRemaining=DRUMSTICKS.duration;this.sprintAttempts=1;
  this.mode='playing';this.emit('drumsticks');
 }
 waitForSprint(reason='timeout') {
  if(this.sprintCleared||!this.drumsticksGranted)return false;
  this.sprintRetryReason=reason;this.pendingSprintRetry=false;
  this.teleport({x:SPRINT.restartX,y:590});this.safe={x:SPRINT.restartX,y:590};
  this.drumsticksRemaining=0;this.mode='sprint-retry';this.emit('sprint-wait');return true;
 }
 retrySprint() {
  if(this.mode!=='sprint-retry'||!this.drumsticksGranted||this.sprintCleared)return false;
  this.teleport({x:SPRINT.restartX,y:590});this.safe={x:SPRINT.restartX,y:590};
  this.drumsticksRemaining=DRUMSTICKS.duration;this.sprintAttempts++;this.mode='playing';this.emit('sprint-retry');return true;
 }
 fall() {
  const challenge=this.drumsticksGranted&&!this.sprintCleared&&this.player.x>=SPRINT.start&&this.player.x<SPRINT.end;
  super.fall();
  if(!challenge)return;
  if(this.respawn>0)this.pendingSprintRetry=true;
  else if(this.mode==='playing')this.waitForSprint('water');
 }
 enterSecret() {
  if(!this.canEnterSecret)return false;
  this.mode='studio-passage';this.player.vx=0;this.jumpBuffer=0;
  this.projectiles=[];this.secretVisits++;this.emit('secret-enter');return true;
 }
 completeDance() {
  if(this.mode!=='dance')return false;
  this.cardAlreadyCollected=this.hasMushroomArtCard01;
  this.hasMushroomArtCard01=true;this.permanentCard=true;
  this.mode='secret-clear';this.emit('art-card');return true;
 }
 exitSecret() {
  if(!['studio-passage','studio-talk','dance-preview','dance','secret-clear'].includes(this.mode))return;
  this.teleport({x:SECRET.returnX,y:590});this.safe={x:SECRET.returnX,y:590};
  this.invulnerable=Math.max(this.invulnerable,1);this.mode='playing';this.emit('secret-exit');
 }
 pause(){
  if(['playing','dance'].includes(this.mode)){this.resumeMode=this.mode;this.mode='paused';this.jumpBuffer=0;}
  else if(this.mode==='paused'){this.mode=this.resumeMode??'playing';this.resumeMode=null;}
 }
 projectileHit(sourceX) {
  if(this.mode!=='playing'||this.invulnerable>0||this.respawn>0)return false;
  const before={...this.player},falls=this.falls,eventStart=this.events.length;
  // Reuse the validated HP/death/spore recovery flow; a surviving projectile hit keeps position.
  super.fall();this.falls=falls;
  if(this.player.hp>0){Object.assign(this.player,{x:before.x,y:before.y,vx:before.x<sourceX?-220:220,vy:-360,grounded:false,support:null});}
  for(let i=eventStart;i<this.events.length;i++)if(this.events[i]==='hurt')this.events[i]='projectile-hurt';
  return true;
 }
 step(dt,input={}) {
  dt=Math.max(0,Math.min(dt,1/30));
  if(this.mode==='leroy-gift'){this.giftTime-=dt;if(this.giftTime<=0)this.grantDrumsticks();return;}
  if(this.mode!=='playing')return;
  // Dialogue triggers before physics so overshoot cannot bypass the first meeting.
  if(!this.leroySeen&&this.player.x>=LEROY.trigger&&this.player.grounded&&!this.respawn){
   this.leroySeen=true;this.dialogueIndex=0;this.mode='dialogue';this.player.vx=0;this.projectiles=[];this.emit('leroy');return;
  }
  if(!this.respawn&&this.drumsticksGranted&&!this.sprintCleared&&this.player.x>=SPRINT.start&&this.player.x<SPRINT.end&&this.drumsticksRemaining<=0){this.waitForSprint('timeout');return;}
  if(!this.respawn)this.drumsticksRemaining=Math.max(0,this.drumsticksRemaining-dt);
  const wasRespawning=this.respawn>0;
  super.step(dt,input);if(this.mode==='result')this.drumsticksRemaining=0;
  if(this.pendingSprintRetry&&wasRespawning&&this.respawn===0){this.waitForSprint('death');return;}
  if(this.mode!=='playing'||this.respawn>0||wasRespawning)return;
  if(!this.sprintCleared&&this.drumsticksGranted&&this.player.x>=SPRINT.end){this.sprintCleared=true;this.emit('sprint-clear');}
  for(const emitter of this.emitters){
   if(emitter.phase==='idle'){
    if(this.player.x<emitter.x+80&&Math.abs(this.player.x-emitter.x)<PROJECTILE.range){emitter.phase='telegraph';emitter.timer=PROJECTILE.telegraph;this.emit('telegraph');}
   }else {
    emitter.timer-=dt;
    if(emitter.timer<=0&&emitter.phase==='telegraph'){
     emitter.phase='cooldown';emitter.timer=PROJECTILE.cooldown;
     this.projectiles.push({x:emitter.x-20,y:emitter.y,age:0});this.emit('fire');
    }else if(emitter.timer<=0){emitter.phase='idle';emitter.timer=0;}
   }
  }
  this.projectiles=this.projectiles.filter(p=>{
   const oldX=p.x;p.x-=PROJECTILE.speed*dt;p.age+=dt;
   // Swept horizontal bounds prevent accelerated players passing through a slow projectile.
   const projectile={x:p.x-11,y:p.y-9,width:oldX-p.x+22,height:18};
   const player={x:this.player.x-15,y:this.player.y-42,width:30,height:42};
   if(rectanglesOverlap(player,projectile)&&this.projectileHit(oldX))return false;
   return p.age<PROJECTILE.lifetime;
  });
  if(input.interact)this.enterSecret();
 }
 snapshot() {
  return {isGiant:this.isGiant,giantShield:this.giantShield,collectionRevision:COLLECTION_REVISION,revision:MAP2.layoutRevision,spores:this.spores.map(s=>({...s})),hp:this.player.hp,
   checkpointId:this.checkpoint?.id??null,safe:{...this.safe},elapsed:this.elapsed,
   leroySeen:this.leroySeen,dialogueIndex:this.dialogueIndex,
   pendingDialogue:this.mode==='dialogue',pendingGift:this.mode==='leroy-gift',
   drumsticksGranted:this.drumsticksGranted,drumsticksRemaining:this.drumsticksRemaining,
   sprintCleared:this.sprintCleared,sprintAttempts:this.sprintAttempts,pendingSprintRetry:this.pendingSprintRetry||this.mode==='sprint-retry',deaths:this.deaths,secretVisits:this.secretVisits};
 }
 restore(saved) {
  if(!saved||![1,2,3].includes(saved.revision))return false;
  this.start();
  this.isGiant=saved.isGiant===true&&saved.giantShield>0;this.giantShield=this.isGiant?1:0;
  this.spores=restoreSpores(this.spores,saved,{sameLayout:saved.revision===MAP2.layoutRevision});
  this.checkpoint=MAP2.CHECKPOINTS.find(c=>c.id===saved.checkpointId)??null;
  const candidate=saved.safe;
  const safe=candidate&&Number.isFinite(candidate.x)&&candidate.y===590&&MAP2.GROUND.some(s=>candidate.x>s.x+85&&candidate.x<s.x+s.width-85);
  this.safe=safe?{x:candidate.x,y:590}:this.checkpoint?{x:this.checkpoint.x,y:590}:{x:180,y:590};
  this.teleport(this.safe);this.player.hp=Math.min(3,Math.max(1,Math.floor(saved.hp)||3));
  this.elapsed=Math.max(0,Number(saved.elapsed)||0);
  this.leroySeen=saved.leroySeen===true;this.drumsticksGranted=saved.drumsticksGranted===true;
  // A consumed grant is never replenished by reload or death.
  this.drumsticksRemaining=this.drumsticksGranted?Math.min(30,Math.max(0,Number(saved.drumsticksRemaining)||0)):0;
  this.deaths=Math.max(0,Math.floor(saved.deaths)||0);this.secretVisits=Math.max(0,Math.floor(saved.secretVisits)||0);
  if(this.leroySeen&&!this.drumsticksGranted){
   this.dialogueIndex=Math.min(2,Math.max(0,Math.floor(saved.dialogueIndex)||0));
   this.mode=saved.pendingGift?'leroy-gift':'dialogue';this.giftTime=.85;
  }
  this.sprintCleared=saved.sprintCleared===true||this.checkpoint?.id==='B'||this.safe.x>=SPRINT.end;
  this.sprintAttempts=Math.max(0,Math.floor(saved.sprintAttempts)||0);
  if(this.drumsticksGranted&&!this.sprintCleared&&(saved.pendingSprintRetry||this.safe.x>=SPRINT.start)){
   if(saved.revision===1||saved.pendingSprintRetry||this.drumsticksRemaining<=0)this.waitForSprint('resume');
  }
  this.invulnerable=1;return true;
 }
}
