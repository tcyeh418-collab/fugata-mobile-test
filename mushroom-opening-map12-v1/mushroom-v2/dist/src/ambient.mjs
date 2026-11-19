import {drawCityNPC,drawCityBubble} from './map4-npc-art.mjs';
// Map4 lines approved 2026-11-01; Map5 copy remains temporary. No collision or rewards.
export const AMBIENT_NPCS=Object.freeze([
 {map:4,id:'m4-leroy',actor:'leroy',name:'LEROY',x:1000,y:590,temporary:false,line:'這一切都發生在2024年的夏天...'},
 {map:4,id:'m4-bear',actor:'bear',name:'MISS DJ BEAR BEAT',x:35400,y:590,temporary:false,line:'高雄連日的大雨，導致人行道長滿香菇...'},
 {map:5,id:'m5-leroy',actor:'leroy',name:'LEROY',x:600,y:590,temporary:true,line:'「你也到這裡啦！我剛才還在想，這段路真不簡單。」'},
 {map:5,id:'m5-bear',actor:'bear',name:'MISS DJ BEAR BEAT',x:28000,y:590,temporary:true,line:'「這裡的 Pulse 好清楚……核心應該就在附近了。」'},
]);
// These silhouettes reuse the existing Map 2 human drummer / Map 3 headphone bear shapes.
function actor(r,n,x){const y=n.y,c=r.c;c.save();c.translate(x,y);
 if(n.actor==='leroy'){
  r.rect(-15,-41,12,39,'#263d40');r.rect(4,-41,12,39,'#263d40');r.rect(-21,-90,42,54,'#ae705a');r.rect(-26,-85,9,39,'#d2ab85');r.rect(18,-85,9,39,'#d2ab85');r.ellipse(0,-106,18,21,'#d6b18a');r.rect(-19,-122,38,10,'#3f5f53');r.rect(-24,-114,48,5,'#4f7762');r.line(-18,-48,32,-76,'#eddbad',4);r.line(24,-48,-13,-75,'#eddbad',4);
 }else{
  r.ellipse(0,-101,22,22,'#aa8167');r.ellipse(-19,-121,10,11,'#aa8167');r.ellipse(20,-121,10,11,'#aa8167');r.ellipse(0,-97,12,10,'#d0b28b');r.ellipse(-7,-105,2,3,'#17383a');r.ellipse(8,-105,2,3,'#17383a');r.rect(-24,-78,48,52,'#726e85');r.rect(-21,-27,16,27,'#334b51');r.rect(7,-27,16,27,'#334b51');r.line(-26,-113,25,-113,'#b3c5a1',5);r.rect(-29,-113,7,21,'#314b54');r.rect(22,-113,7,21,'#314b54');
 }c.restore();}
export function bubbleLayout(ctx,n,screenX,canvasWidth){
 const fontSize=20,width=Math.min(440,canvasWidth-48),padding=20,lines=[];ctx.font=`${fontSize}px sans-serif`;let line='';
 for(const ch of n.line){if(line&&ctx.measureText(line+ch).width>width-padding*2){lines.push(line);line='';}line+=ch;}if(line)lines.push(line);
 const height=54+lines.length*29,left=Math.max(24,Math.min(canvasWidth-width-24,screenX-width/2));
 return {left,top:n.y-158-height,width,height,fontSize,lines};
}
export function drawAmbient(r,g){
 const c=r.c;for(const n of AMBIENT_NPCS.filter(n=>n.map===g.mapId)){
  const x=n.x-r.camera;if(x<32||x>r.canvas.width-32)continue;if(g.mapId===4){if(!drawCityNPC(r,n,x))actor(r,n,x);drawCityBubble(r,n,x);continue;}actor(r,n,x);
  const b=bubbleLayout(c,n,x,r.canvas.width),tail=Math.max(b.left+22,Math.min(b.left+b.width-22,x));
  c.fillStyle='#16393df5';c.strokeStyle='#c4c8a5';c.lineWidth=2;c.beginPath();c.roundRect(b.left,b.top,b.width,b.height,14);c.fill();c.stroke();
  c.beginPath();c.moveTo(tail-10,b.top+b.height-1);c.lineTo(x,n.y-142);c.lineTo(tail+10,b.top+b.height-1);c.fill();c.stroke();
  c.textAlign='left';c.font='12px monospace';c.fillStyle='#c7bf92';c.fillText(n.name,b.left+20,b.top+25);c.font=`${b.fontSize}px sans-serif`;c.fillStyle='#f3ead0';b.lines.forEach((line,i)=>c.fillText(line,b.left+20,b.top+55+i*29));
 }
}
