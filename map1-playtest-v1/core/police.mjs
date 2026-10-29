// Two fixed patrol beats; camera position never determines pursuit state.
export const POLICE_ENCOUNTERS=Object.freeze([
 Object.freeze({id:'city-clearance',trigger:11550,end:15500,laneStart:11200,spawnGap:300,speed:270,reset:Object.freeze({x:11620,y:590})}),
 Object.freeze({id:'harbor-clearance',trigger:29000,end:32480,shoreEnd:31372,turnDelay:.3,laneStart:28850,spawnGap:240,speed:270,reset:Object.freeze({x:29060,y:590})}),
]);
export const POLICE=POLICE_ENCOUNTERS[0];
export const newChase=(config=POLICE)=>({id:config.id,state:'waiting',x:0,y:590,vy:0,grounded:true,facing:1,pendingDirection:0,turnRemaining:0,reason:null});
export function updateChase(g,dt){
 const p=g.player;if(g.mode!=='playing'||g.respawn>0)return;
 const encounters=g.chases??[g.chase];
 let e=encounters.find(e=>e?.state==='active');
 if(!e){
  e=encounters.find(e=>{const c=POLICE_ENCOUNTERS.find(c=>c.id===e?.id);return c&&e.state==='waiting'&&p.x>=c.trigger&&p.x<c.end&&p.grounded&&p.y===590&&!p.crouching;});
  if(!e)return;
  const c=POLICE_ENCOUNTERS.find(c=>c.id===e.id);
  Object.assign(e,{state:'active',x:Math.max(c.laneStart,p.x-c.spawnGap),y:590,vy:0,grounded:true});g.chase=e;g.emit('police-start');return;
 }
 g.chase=e;const c=POLICE_ENCOUNTERS.find(c=>c.id===e.id);
 const finish=reason=>{e.state='finished';e.reason=reason;g.emit('police-end');};
 // Reaching a real route boundary ends this beat, even if the officer is offscreen.
 if(p.x>=c.end&&p.grounded){finish('route-cleared');return;}
 const target=Math.max(c.laneStart,Math.min(c.shoreEnd??c.end,p.x)),delta=target-e.x;
 let dir=Math.sign(delta);
 // Harbor guard pauses to turn after a player jumps past; no instant reversal.
 if(dir&&dir!==e.facing){
  if(e.pendingDirection!==dir){e.pendingDirection=dir;e.turnRemaining=c.turnDelay??0;}
  e.turnRemaining=Math.max(0,e.turnRemaining-dt);
  if(e.turnRemaining>1e-9)dir=0;else{e.facing=dir;e.pendingDirection=0;}
 }else{e.pendingDirection=0;e.turnRemaining=0;}

 // Walk and jump over existing gaps; never snap across a hole or walk on water.
 const ground=g.level.GROUND;
 const floor=ground.find(s=>e.x>=s.x&&e.x<=s.x+s.width);
 if(e.grounded&&dir&&floor){
  const edge=dir>0?floor.x+floor.width:floor.x;
  const next=ground.filter(s=>dir>0?s.x>edge:s.x+s.width<edge).sort((a,b)=>dir>0?a.x-b.x:b.x-a.x)[0];
  const gap=next&&(dir>0?next.x-edge:edge-(next.x+next.width));
  if(gap>0&&Math.abs(edge-e.x)<24&&Math.abs(delta)>Math.abs(edge-e.x)){
   e.vy=-g.level.CONFIG.jump;e.grounded=false;
  }
 }
 const previousY=e.y;e.x+=dir*Math.min(Math.abs(delta),c.speed*dt);
 e.y+=e.vy*dt+.5*g.level.CONFIG.gravity*dt*dt;e.vy+=g.level.CONFIG.gravity*dt;
 e.grounded=false;
 if(e.vy>=0&&ground.some(s=>e.x+14>s.x&&e.x-14<s.x+s.width&&previousY<=s.y+.5&&e.y>=s.y)){
  e.y=590;e.vy=0;e.grounded=true;
 }
 if(e.y>735){finish('patrol-fell');return;}
 if(Math.abs(p.x-e.x)<32&&p.y>e.y-72&&p.y-42<e.y&&g.invulnerable<=0){
  finish('caught');g.takeDamage('police-hurt',c.reset);
 }
}
export function drawPolice(r,g){
 if(g.chase?.state!=='active')return;const x=g.chase.x-r.camera,y=g.chase.y,c=r.c;
 r.ellipse(x,y+2,23,4,'#102d3270');r.rect(x-15,y-42,30,30,'#78979a');r.rect(x-13,y-12,10,12,'#274c60');r.rect(x+4,y-12,10,12,'#274c60');r.rect(x-20,y-55,40,19,'#b6c7aa');
 r.ellipse(x,y-70,14,17,'#d4b58b');r.rect(x-16,y-86,32,9,'#345d73');r.rect(x-20,y-78,40,5,'#52768a');r.rect(x-15,y-39,30,5,'#e9d6a1');r.rect(x+15,y-40,6,28,'#d5b993');
 c.font='15px sans-serif';c.textAlign='center';c.fillStyle='#efe2bb';c.fillText('道路清除作業',x,y-104);c.textAlign='left';
}
