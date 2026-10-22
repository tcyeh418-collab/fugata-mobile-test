import * as MAP1 from './map.mjs?rev=map5-20261020-r1';
const C=MAP1.CONFIG;
import {calculateSporeLoss} from './legacy.mjs?rev=map5-20261020-r1';
export class Game {
 constructor(level=MAP1){this.level=level;this.mapId=level.id??1;this.mode='title';this.reset();}
 reset(){const {GROUND,SPORES}=this.level;this.player={x:180,y:590,vx:0,vy:0,hp:C.maxHP,grounded:true,support:GROUND[0].id,facing:1};this.time=0;this.elapsed=0;this.intro=0;this.invulnerable=0;this.respawn=0;this.checkpoint=null;this.safe={x:180,y:590};this.spores=SPORES.map(s=>({...s,collected:false}));this.deaths=0;this.falls=0;this.events=[];this.coyote=.1;this.jumpBuffer=0;this.bounceCount=0;}
 start(){this.reset();this.mode='intro';}
 finishIntro(){if(this.mode!=='intro')return;this.intro=5;this.mode='playing';this.events.push('ready');}
 get moveSpeed(){return this.player.crouching?180:C.speed;}
 get count(){return this.spores.filter(s=>s.collected).length;}
 emit(name){this.events.push(name);}
 pause(){if(this.mode==='playing'){this.mode='paused';this.jumpBuffer=0;}else if(this.mode==='paused')this.mode='playing';}
 fall(){
  if(this.mode!=='playing'||this.respawn>0)return;
  this.falls++;
  if(this.invulnerable>0){this.teleport(this.safe);return;}
  this.player.hp--;this.invulnerable=1;this.emit('hurt');
  if(this.player.hp>0){this.teleport(this.safe);return;}
  this.deaths++;const lost=this.count-calculateSporeLoss(this.count).remainingSpores;
  const cp=this.checkpoint??{x:180,y:590};
  this.spores.filter(s=>s.collected).slice(-lost||this.spores.length).forEach((s,i)=>{s.collected=false;s.x=cp.x+80+i*42;s.y=cp.y-36-(i%2)*24;});
  this.respawn=.9;this.teleport(cp);this.safe={x:cp.x,y:cp.y};this.emit('death');
 }
 teleport(at){Object.assign(this.player,{x:at.x,y:at.y,vx:0,vy:0,grounded:true,support:null});this.jumpBuffer=0;this.coyote=0;}
 step(dt,input={}){
  const {GROUND,PLATFORMS,CHECKPOINTS,MUSHROOM,FINISH,movingAt}=this.level;const worldWidth=this.level.worldWidth??C.worldWidth;
  dt=Math.max(0,Math.min(dt,1/30));
  if(this.mode==='intro'){this.intro+=dt;if(this.intro>=5)this.finishIntro();return;}
  if(this.mode!=='playing')return;
  if(this.respawn>0){this.respawn=Math.max(0,this.respawn-dt);if(!this.respawn){this.player.hp=C.maxHP;this.invulnerable=1;this.emit('respawn');}return;}
  this.time+=dt;this.elapsed+=dt;this.invulnerable=Math.max(0,this.invulnerable-dt);
  const p=this.player,previousY=p.y,previousX=p.x,solids=this.level.SOLIDS??[];
  if(this.level.CROUCH_OBSTACLES){const blocked=solids.some(s=>p.x+15>s.x&&p.x-15<s.x+s.width&&p.y>s.y&&p.y-42<s.y+s.height);p.crouching=!!input.crouch||blocked;}
  const bodyHeight=p.crouching?22:42;
  const moving=t=>this.level.movingPlatformsAt?.(t)??[movingAt(t)].filter(Boolean),oldMoving=moving(this.time-dt),movingNow=moving(this.time);
  const support=movingNow.find(s=>s.id===p.support),oldSupport=oldMoving.find(s=>s.id===p.support);
  if(support&&oldSupport&&p.grounded){p.x+=support.x-oldSupport.x;p.y+=support.y-oldSupport.y;}
  this.coyote=p.grounded?.1:Math.max(0,this.coyote-dt);
  this.jumpBuffer=input.jump?.12:Math.max(0,this.jumpBuffer-dt);
  if(this.jumpBuffer>0&&this.coyote>0){p.vy=-(this.jumpPower??C.jump);p.grounded=false;p.support=null;this.coyote=0;this.jumpBuffer=0;this.emit('jump');}
  const direction=Number(!!input.right)-Number(!!input.left);
  p.vx+=(direction*(this.moveSpeed??C.speed)-p.vx)*Math.min(1,dt*12);if(direction)p.facing=direction;
  p.x=Math.max(18,Math.min(worldWidth-18,p.x+p.vx*dt));p.vy+=C.gravity*dt;p.y+=p.vy*dt;
  for(const s of solids){
   if(p.y>s.y&&p.y-bodyHeight<s.y+s.height){if(previousX+15<=s.x&&p.x+15>s.x){p.x=s.x-15;p.vx=0;}else if(previousX-15>=s.x+s.width&&p.x-15<s.x+s.width){p.x=s.x+s.width+15;p.vx=0;}}
   if(p.vy<0&&p.x+15>s.x&&p.x-15<s.x+s.width&&previousY-bodyHeight>=s.y+s.height&&p.y-bodyHeight<s.y+s.height){p.y=s.y+s.height+bodyHeight;p.vy=0;}
  }
  p.grounded=false;p.support=null;
  const surfaces=[...GROUND,...PLATFORMS,...movingNow].filter(s=>p.x+15>s.x&&p.x-15<s.x+s.width&&previousY<=s.y+.5&&p.y>=s.y).sort((a,b)=>a.y-b.y);
  if(p.vy>=0&&surfaces.length){const s=surfaces[0];p.y=s.y;p.vy=0;p.grounded=true;p.support=s.id;
   // Safe points only on broad, static ground, well inside both edges.
   if(s.ground&&s.width>260&&p.x>s.x+85&&p.x<s.x+s.width-85)this.safe={x:p.x,y:s.y};
  }
  if(p.vy>=0&&previousY<=MUSHROOM.capY+.5&&p.y>=MUSHROOM.capY&&Math.abs(p.x-MUSHROOM.x)<MUSHROOM.width/2+15){p.y=MUSHROOM.capY;p.vy=-C.bounce;p.grounded=false;p.support=null;this.bounceCount++;this.emit('bounce');}
  for(const cp of CHECKPOINTS)if(p.x>=cp.x&&(!this.checkpoint||cp.x>this.checkpoint.x)){this.checkpoint=cp;this.emit(`checkpoint-${cp.id}`);}
  for(const s of this.spores)if(!s.collected&&Math.abs(s.x-p.x)<34&&s.y>p.y-C.height-20&&s.y<p.y+16){s.collected=true;this.emit('spore');}
  if(p.y>735){this.fall();return;}
  if(p.x>=FINISH.x&&p.grounded){this.mode='result';p.vx=p.vy=0;this.emit('clear');}
 }
 continue(){if(this.mode==='result')this.mode='coming-soon';}
}
