// One short road-clearance encounter, confined to the uninterrupted Section 2 quay.
export const POLICE=Object.freeze({trigger:11550,end:14050,spawnGap:300,speed:205,escapeBuffer:160,reset:{x:11620,y:590}});
export const newChase=()=>({state:'waiting',x:0,y:590,reason:null});
export function updateChase(g,dt){
 const e=g.chase,p=g.player;if(!e||g.mode!=='playing'||g.respawn>0)return;
 if(e.state==='waiting'){
  if(p.x<POLICE.trigger||p.x>POLICE.end||!p.grounded||p.y!==590||p.crouching)return;
  Object.assign(e,{state:'active',x:Math.max(11200,p.x-POLICE.spawnGap),y:590});g.emit('police-start');return;
 }
 if(e.state!=='active')return;
 const width=g.visibleWorldWidth||1280,camera=g.cameraLeft??Math.max(0,p.x-width*.34);
 const finish=reason=>{e.state='finished';e.reason=reason;g.emit('police-end');};
 if(e.x<camera-POLICE.escapeBuffer&&p.x-e.x>width*.34+POLICE.escapeBuffer){finish('escaped');return;}
 // Only this continuous ground lane is used. No path warps, wall crossing or gap snapping.
 const target=Math.max(11200,Math.min(POLICE.end,p.x));const delta=target-e.x;
 e.x+=Math.sign(delta)*Math.min(Math.abs(delta),POLICE.speed*dt);
 if(Math.abs(p.x-e.x)<32&&p.y>e.y-72&&p.y-42<e.y&&g.invulnerable<=0){
  finish('caught');g.takeDamage('police-hurt',POLICE.reset);
 }
}
export function drawPolice(r,g){
 if(g.chase?.state!=='active')return;const x=g.chase.x-r.camera,y=g.chase.y,c=r.c;
 r.ellipse(x,y+2,23,4,'#102d3270');r.rect(x-15,y-42,30,30,'#78979a');r.rect(x-13,y-12,10,12,'#274c60');r.rect(x+4,y-12,10,12,'#274c60');r.rect(x-20,y-55,40,19,'#b6c7aa');
 r.ellipse(x,y-70,14,17,'#d4b58b');r.rect(x-16,y-86,32,9,'#345d73');r.rect(x-20,y-78,40,5,'#52768a');r.rect(x-15,y-39,30,5,'#e9d6a1');r.rect(x+15,y-40,6,28,'#d5b993');
 c.font='15px sans-serif';c.textAlign='center';c.fillStyle='#efe2bb';c.fillText('道路清除作業',x,y-104);c.textAlign='left';
}
