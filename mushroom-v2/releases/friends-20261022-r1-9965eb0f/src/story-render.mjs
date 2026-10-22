const clamp=n=>Math.max(0,Math.min(1,n));
// The opening uses Renderer.player at its existing size and the exact Map1 spawn.
export function drawStory(r,g,sequence,tier=1){
 const c=r.c,W=r.canvas.width,t=sequence.elapsed,opening=sequence.kind==='opening',p=clamp(t/sequence.duration);
 c.save();const camera=r.camera;r.camera=0;r.backdrop();r.ground({...g.level.GROUND[0],x:0,width:W,y:590});
 const spawn=opening?g.player.x:180;
 // Mycelium lives below the pavement and on the margins, never blocking the road.
 const bloom=opening?clamp((t-2)/3):clamp(p*1.7),branches=opening?5:6+tier*8;
 for(let j=0;j<branches;j++){const x=spawn+40+j*(opening?47:Math.max(20,(W-260)/branches));const reach=(opening?35:30+tier*22)*bloom;r.line(x,620,x+reach,600+(j%3)*16,'#c8d6a1',1.5);r.line(x+reach*.45,612,x+reach*.35,640,'#a7c59c',1);}
 if(opening){
  const rain=1-clamp((t-8)/2);for(let i=0;i<65;i++){const x=(i*79+t*120)%W,y=(i*139+t*360)%600;r.line(x,y,x-5,y+16,`rgba(185,211,207,${.28*rain})`,1);}
  r.ellipse(spawn-36,591,40,3,'#c2d6bb55');if(t>=5){const emerge=clamp((t-5)/.55),shake=t>5.7&&t<6.4?Math.sin(t*50)*3:0;c.save();c.beginPath();c.rect(0,0,W,590);c.clip();r.player({...g.player,x:spawn-36*(1-clamp((t-7)/2))+shake,y:590+(1-emerge)*65,vx:t>7&&t<9?18:0,facing:t<6.6?-1:1},false);c.restore();}
  if(t>=7){const pulse=.5+Math.sin(t*8)*.25;for(let j=0;j<4;j++)r.glow(spawn+130+j*110,565-j*8,16+8*pulse,'#d5dfa15a');}
 }else{
  r.rect(0,0,W,590,`rgba(198,213,167,${p*.12})`);
  for(let j=0;j<3+tier*4;j++){const x=300+j*Math.max(35,(W-360)/(3+tier*4));if(p>.15+j*.012){const root=550-(j%3)*9;r.rect(x-24,root+2,48,20,'#35574b');r.ellipse(x,root+2,26,5,'#668061');r.mushroom(x,root,(.13+tier*.035)*clamp(p*2),j%2===0);}}
  r.player({...g.player,x:180,y:590,vx:0,facing:p<.7?1:-1},false);
  for(let j=0;j<tier*7;j++)r.glow((j*93+t*16)%W,340+(j%5)*35,2+(j%3),'#e3dda56a');
 }
 c.textAlign='center';c.fillStyle='#f0e7c9';
 if(opening&&t>=9){c.font='14px monospace';c.fillText('LOGIC CODE',W*.6,240);c.font='32px serif';c.fillText('MUSHROOM 菇',W*.6,290);}
 if(!opening&&p>.72){c.font='14px monospace';c.fillText(tier===3?'FULL BLOOM':tier===2?'LIFE RETURNS':'A SMALL LIFE, RESTORED',W*.6,240);c.font='30px serif';c.fillText('MUSHROOM CLEAR',W*.6,290);}
 c.textAlign='left';r.camera=camera;c.restore();
}
export function drawMyceliumSignal(r,g){if(g.mapId!==1||g.mode!=='playing')return;for(let j=0;j<7;j++){const x=290+j*61-r.camera;r.line(x,609,x+35,601,'#bacd9b70',1.5);if(j!==3)r.line(x+35,601,x+53,615,'#8aac8960',1);if(j===6)r.glow(x,597,12+Math.sin(r.clock*4)*3,'#cde0aa44');}}
