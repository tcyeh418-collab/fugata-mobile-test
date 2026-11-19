// Approved Miss DJ Bear Beat pickup portrait; presentation only, original bounds/trajectory below.
const card02Pickup=typeof Image!=='undefined'?new Image():null;
if(card02Pickup)card02Pickup.src=new URL('../assets/art-card-characters-v4/card-02-pickup.png',import.meta.url).href;
// Wooden box presentation. Art chest and ordinary crates keep separate damage/reward rules.
export const CHEST_ANIMATION=Object.freeze({hitDuration:.22,breakDuration:.55,cardDropDuration:.38,hoverAmplitude:2.4,hoverPeriod:3.2});
export const crackStage=durability=>durability>=30?0:durability>20?1:durability>10?2:3;
export function chestImpact(remaining){
 const t=Math.max(0,Math.min(1,1-remaining/CHEST_ANIMATION.hitDuration));
 // A fast, solid downward impulse and tiny recovery. No scale/stretch.
 const down=t<.18?3.2*t/.18:t<.6?3.2*(1-(t-.18)/.42):-.65*Math.sin((t-.6)/.4*Math.PI);
 return {x:remaining>0?Math.sin(t*Math.PI*5)*1.4*(1-t):0,y:remaining>0?down:0,t};
}
export function chestBoards(b){
 const t=Math.max(0,Math.min(1,1-b.breakTime/CHEST_ANIMATION.breakDuration));
 return Array.from({length:7},(_,i)=>{
  const side=i%2?-1:1,travel=(15+(i%3)*7)*Math.sin(t*Math.PI/2);
  return {x:b.x+12+(i%4)*24+side*travel,y:b.y-b.height+15+Math.floor(i/4)*31+(b.height-22-Math.floor(i/4)*31)*t-18*Math.sin(t*Math.PI),width:i<4?25:33,height:10+(i%2)*3,angle:side*t*(.3+(i%3)*.18),alpha:1-Math.max(0,(t-.8)/.2)};
 });
}
export function cardPose(pickup,age=0){
 const t=Math.max(0,age),reveal=Math.min(1,t/CHEST_ANIMATION.cardDropDuration);
 return {x:pickup.x,y:pickup.y-26*(1-reveal)**2-(1-Math.cos(Math.max(0,t-CHEST_ANIMATION.cardDropDuration)*2*Math.PI/CHEST_ANIMATION.hoverPeriod))*CHEST_ANIMATION.hoverAmplitude/2};
}
export function cardBounds(pickup,age){const p=cardPose(pickup,age);return {x:p.x-17,y:p.y-18,width:34,height:34};}
export function drawArtChest(r,b){
 const c=r.c,x=b.x-r.camera;
 if(b.broken){
  // A few boards settle close to the former box; nothing scatters across the route.
  if(b.breakTime>0)for(const p of chestBoards(b)){c.save();c.translate(p.x-r.camera,p.y);c.rotate(p.angle);c.globalAlpha=p.alpha;r.rect(-p.width/2,-p.height/2,p.width,p.height,'#a47c4d');r.line(-p.width/2+2,0,p.width/2-2,0,'#e1bb7d',1);c.restore();}
  else{r.rect(x+8,b.y-4,29,4,'#775b3e');r.rect(x+72,b.y-5,26,5,'#947447');}return;
 }
 const hit=chestImpact(b.shake),left=x+hit.x,top=b.y-b.height+hit.y;
 r.ellipse(x+b.width/2,b.y+2,b.width*.52,4,'#142c3066');
 r.rect(left,top,b.width,b.height,'#4c3828');
 for(let i=0;i<4;i++){const y=top+3+i*20;r.rect(left+4,y,b.width-8,18,['#927044','#a17a49','#8c653d','#9d7749'][i]);r.line(left+10,y+7,left+b.width-12,y+8,'#c39b604f',1);r.line(left+18+i*7,y+13,left+40+i*9,y+12,'#57402b77',1);}
 // Thick braces, worn edges and nail heads make the little chest read as heavy wood.
 for(const dx of [6,b.width-19]){r.rect(left+dx,top+2,13,b.height-4,'#bd965e');r.line(left+dx+2,top+3,left+dx+2,top+b.height-4,'#dec18a',1);for(const dy of [9,b.height-10])r.ellipse(left+dx+7,top+dy,2,2,'#493d31');}
 r.rect(left,top,b.width,5,'#d0ad72');r.rect(left,top+b.height-5,b.width,5,'#62482e');
 const stage=crackStage(b.durability),paths=[[[32,7],[42,19],[35,31],[49,43]],[[76,22],[63,36],[72,49],[61,63]],[[49,43],[39,58],[49,72],[42,82]],[[35,31],[23,37]],[[72,49],[87,58]]];
 const drawPath=(points,color,width)=>{for(let i=1;i<points.length;i++)r.line(left+points[i-1][0],top+points[i-1][1],left+points[i][0],top+points[i][1],color,width);};
 for(let i=0;i<(stage===0?0:stage===1?1:stage===2?3:5);i++){drawPath(paths[i],'#dfb77d',3.5);drawPath(paths[i],'#322c24',2);}
 if(b.shake>0){for(let i=0;i<3;i++){const t=hit.t;r.rect(x+29+i*25+(i-1)*10*t, b.y-b.height-3-12*Math.sin(t*Math.PI)+12*t,3,2,'#d4ae73');}}
 c.font='20px sans-serif';c.textAlign='center';c.fillStyle='#e9d7a6';c.fillText('↓',x+b.width/2,top-15);c.textAlign='left';
}
export function drawArtCard(r,pickup,age){
 const p=cardPose(pickup,age),x=p.x-r.camera,y=p.y;
 r.ellipse(x,pickup.y+17,18,2,'#132c303d');r.glow(x,y,46,'#e3d8a83b');
 if(card02Pickup?.complete&&card02Pickup.naturalWidth){r.c.save();r.c.imageSmoothingEnabled=false;r.c.drawImage(card02Pickup,Math.round(x-17),Math.round(y-18),34,34);r.c.restore();return;}
 r.rect(x-17,y-18,34,34,'#dfc796');r.rect(x-14,y-15,28,28,'#527477');r.rect(x-11,y-13,23,23,'#1c343c');r.ellipse(x,y-1,10,10,'#111f28');r.ellipse(x,y-1,5,5,'#ccaf74');r.ellipse(x,y-1,1.6,1.6,'#263d44');r.line(x-15,y-16,x+15,y-16,'#f2dfb4',1);
}

// Constant fitting to the original small-crate dimensions, never animated squash/stretch.
export function drawSmallCrate(r,b){
 const c=r.c,local=Object.create(r);local.camera=0;c.save();c.translate(b.x-r.camera,b.y);c.scale(b.width/110,b.height/84);
 const durability=b.durability===3?30:b.durability===2?27:b.durability===1?20:0;
 drawArtChest(local,{...b,x:0,y:0,width:110,height:84,durability});c.restore();
}
