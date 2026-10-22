import {restoreSpores,COLLECTION_REVISION} from './collection.mjs';
import {Game} from './engine.mjs?rev=map5-20261020-r1';
import * as M from './map3.mjs?rev=map5-20261020-r1';
import {rectanglesOverlap} from './legacy.mjs?rev=map5-20261020-r1';
import {calculateSporeLoss} from './legacy.mjs?rev=map5-20261020-r1';
export const normalRun=()=>({isGiant:false,giantShield:0,nextMapId:3});
export function cleanGiant(state){const active=state?.isGiant===true&&state?.giantShield===1;return {isGiant:active,giantShield:active?1:0};}
export class Map3Game extends Game{
 constructor({hasMushroomArtCard02=false,runState=normalRun()}={}){super(M);this.permanentCard02=hasMushroomArtCard02;this.initialRun=cleanGiant(runState);this.entryHP=Math.max(1,Math.min(3,Math.floor(runState.hp)||3));this.chapterCarry=structuredClone(runState);this.hasMushroomArtCard02=hasMushroomArtCard02;}
 reset(){super.reset();this.isGiant=false;this.giantShield=0;this.bearBeatEventCompleted=false;this.dialogueIndex=0;this.reactorTime=0;this.hasMushroomArtCard02=this.permanentCard02??false;this.cardAlreadyCollected=false;this.cardPickup=null;this.visibleWorldWidth=0;this.projectiles=[];this.emitters=M.EMITTERS.map(e=>({...e,phase:'idle',timer:0,index:0}));this.breakables=M.BREAKABLES.map(b=>({...b,broken:false,shake:0}));this.player.crouching=false;}
 start(){this.reset();Object.assign(this,this.initialRun??normalRun());this.player.hp=this.entryHP??3;this.mode='playing';}
 get runState(){return {...cleanGiant(this),hp:this.player.hp,physicalSporeProgress:{3:{collected:this.count,total:20,ids:this.spores.filter(s=>s.collected).map(s=>s.id)}},nextMapId:this.mode==='result'?4:3};}
 get moveSpeed(){return this.player.crouching?180:300;}
 setVisibleWorldWidth(width){if(Number.isFinite(width)&&width>0)this.visibleWorldWidth=width;}
 get inBearSafeZone(){return this.player.x>=M.BEAR.safeStart&&this.player.x<=M.BEAR.safeEnd;}
 advanceDialogue(){if(this.mode!=='bear-dialogue')return;if(this.dialogueIndex===0)this.dialogueIndex=1;else{this.mode='reactor';this.reactorTime=1.2;this.emit('voltage-rise');}}
 grantReactor(){if(this.bearBeatEventCompleted)return;this.bearBeatEventCompleted=true;this.isGiant=true;this.giantShield=1;this.mode='playing';this.emit('reactor');}
 absorbShield(){if(!this.isGiant||this.giantShield!==1)return false;this.isGiant=false;this.giantShield=0;this.invulnerable=1.2;this.emit('shield-break');return true;}
 fall(){if(this.mode!=='playing'||this.respawn>0)return;if(this.invulnerable>0){this.teleport(this.safe);return;}if(this.absorbShield()){this.falls++;this.teleport(this.safe);return;}super.fall();}
 projectileHit(kind='projectile-hurt'){
  if(this.mode!=='playing'||this.respawn>0||this.invulnerable>0||this.inBearSafeZone)return false;
  if(this.absorbShield())return true;
  this.player.hp--;this.invulnerable=1.2;this.emit(kind);
  if(this.player.hp<=0){this.deaths++;const lost=this.count-calculateSporeLoss(this.count).remainingSpores;const cp=this.checkpoint??{x:180,y:590};this.spores.filter(s=>s.collected).slice(-lost||this.spores.length).forEach((s,i)=>Object.assign(s,{collected:false,x:cp.x+80+i*42,y:cp.y-36-(i%2)*24}));this.respawn=.9;this.teleport(cp);this.safe={x:cp.x,y:cp.y};this.emit('death');}return true;
 }
 collectCard(){if(!this.cardPickup)return;this.cardAlreadyCollected=this.hasMushroomArtCard02;this.hasMushroomArtCard02=true;this.permanentCard02=true;this.cardPickup=null;this.mode='art-card3';this.player.vx=0;this.emit('art-card-02');}
 closeCard(){if(this.mode==='art-card3')this.mode='playing';}
 step(dt,input={}){
  dt=Math.max(0,Math.min(dt,1/30));
  if(this.mode==='reactor'){this.reactorTime-=dt;if(this.reactorTime<=0)this.grantReactor();return;}
  if(this.mode!=='playing')return;
  if(!this.bearBeatEventCompleted&&this.player.x>=M.BEAR.trigger){this.projectiles=[];this.player.vx=0;this.player.crouching=false;this.mode='bear-dialogue';this.emit('bear-beat');return;}
  const oldX=this.player.x;this.player.crouching=!!input.crouch&&this.player.grounded&&!input.jump;
  super.step(dt,this.player.crouching?{...input,jump:false}:input);
  if(this.mode!=='playing'||this.respawn>0)return;
  for(const b of this.breakables){b.shake=Math.max(0,b.shake-dt);if(b.broken)continue;
   const player={x:this.player.x-15,y:this.player.y-(this.player.crouching?22:42),width:30,height:this.player.crouching?22:42};
   if(!rectanglesOverlap(player,{x:b.x,y:b.y-b.height,width:b.width,height:b.height}))continue;
   if(this.isGiant){b.broken=true;this.emit('giant-break');if(b.kind==='special')this.cardPickup={x:b.x+b.width/2,y:b.y-30};}
   else{this.player.x=oldX<b.x?b.x-15:b.x+b.width+15;this.player.vx=0;if(b.shake===0){b.shake=.45;this.emit(b.kind==='special'?'chest-locked':'weak-locked');}}
  }
  if(this.cardPickup&&Math.abs(this.player.x-this.cardPickup.x)<85&&Math.abs(this.player.y-this.cardPickup.y)<70){this.collectCard();return;}
  this.updateProjectiles(dt);
 }
 projectileSafeAt(x){return x>=M.BEAR.safeStart&&x<=M.BEAR.safeEnd;}
 updateProjectiles(dt){
  const C=M.PROJECTILE,w=this.visibleWorldWidth;
  for(const e of this.emitters){const active=w>0&&!this.inBearSafeZone&&this.player.x<e.x+40&&Math.abs(this.player.x-e.x)<=C.activationScreens*w;
   if(!active){e.phase='idle';e.timer=0;continue;}
   if(e.phase==='idle'){e.phase='telegraph';e.timer=C.telegraph;this.emit('telegraph');}
   else{e.timer-=dt;if(e.timer<=0){if(e.phase==='telegraph'){const kind=e.sequence[e.index%e.sequence.length];e.index++;this.projectiles.push({x:e.x-28,y:e.y??(kind==='low'?C.lowY:C.highY),kind,direction:-1,distance:0,maxDistance:C.travelScreens*w});e.phase='cooldown';e.timer=C.cooldown;this.emit('fire');}else e.phase='idle';}}
  }
  this.projectiles=this.projectiles.filter(p=>{
   const delta=C.speed*dt,oldX=p.x;p.x+=p.direction*delta;p.distance+=delta;
   if(p.distance>=p.maxDistance||this.projectileSafeAt(p.x))return false;
   const body={x:this.player.x-15,y:this.player.y-(this.player.crouching?22:42),width:30,height:this.player.crouching?22:42};
   if(rectanglesOverlap(body,{x:Math.min(oldX,p.x)-C.width/2,y:p.y-C.height/2,width:delta+C.width,height:C.height})&&this.projectileHit())return false;
   return true;
  });
 }
 snapshot(){return {collectionRevision:COLLECTION_REVISION,revision:1,spores:this.spores.map(s=>({...s})),hp:this.player.hp,checkpointId:this.checkpoint?.id??null,safe:{...this.safe},elapsed:this.elapsed,deaths:this.deaths,falls:this.falls,respawn:this.respawn,bearBeatEventCompleted:this.bearBeatEventCompleted,dialogueIndex:this.dialogueIndex,pendingDialogue:this.mode==='bear-dialogue',pendingReactor:this.mode==='reactor',...cleanGiant(this),broken:this.breakables.filter(b=>b.broken).map(b=>b.id),cardPickup:this.cardPickup,cardPending:this.mode==='art-card3'};}
 restore(saved,authoritativeRun){
  if(!saved||saved.revision!==1)return false;this.start();
  this.spores=restoreSpores(this.spores,saved,{sameLayout:true});
  this.checkpoint=M.CHECKPOINTS.find(c=>c.id===saved.checkpointId)??null;const at=saved.safe;
  this.safe=at&&at.y===590&&Number.isFinite(at.x)&&M.GROUND.some(g=>at.x>g.x+85&&at.x<g.x+g.width-85)?{x:at.x,y:590}:this.checkpoint?{x:this.checkpoint.x,y:590}:{x:180,y:590};this.teleport(this.safe);
  this.player.hp=Math.max(1,Math.min(3,Math.floor(saved.hp)||3));if(saved.hp<=0&&saved.respawn>0){this.player.hp=0;this.respawn=Math.min(.9,Number(saved.respawn));}this.elapsed=Math.max(0,Number(saved.elapsed)||0);this.deaths=Math.max(0,Math.floor(saved.deaths)||0);this.falls=Math.max(0,Math.floor(saved.falls)||0);
  this.bearBeatEventCompleted=saved.bearBeatEventCompleted===true;Object.assign(this,cleanGiant(authoritativeRun??saved));
  this.breakables.forEach(b=>{b.broken=Array.isArray(saved.broken)&&saved.broken.includes(b.id);});
  const pickup=saved.cardPickup;if(pickup&&pickup.x===25575&&pickup.y===325)this.cardPickup={...pickup};
  if(!this.bearBeatEventCompleted&&(saved.pendingDialogue||saved.pendingReactor)){this.dialogueIndex=saved.dialogueIndex===1?1:0;this.mode=saved.pendingReactor?'reactor':'bear-dialogue';this.reactorTime=1.2;}
  // A collected chest reward survives even if closing/reloading interrupts the modal.
  if(saved.cardPending&&this.hasMushroomArtCard02){this.cardAlreadyCollected=true;this.mode='art-card3';}
  this.invulnerable=1.2;return true;
 }
}
