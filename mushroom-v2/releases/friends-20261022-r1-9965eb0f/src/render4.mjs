import {GACHA,SECRET,SPIKES,CRUSHER_TIMING,SPIKE_TIMING,FALLING_CONFIG} from './map4.mjs?rev=map5-20261020-r1';
export function drawMap4Details(r,g){
 const c=r.c,cam=r.camera,{SPIKES,GACHA,SECRET,FALLING_CONFIG}=g.rules;
 for(const s of SPIKES){const x=s.x-cam;if(x<-200||x>r.canvas.width+200)continue;const state=g.spikeAt(s);r.rect(x,589,s.width,7,'#515b50');
  for(let dx=5;dx<s.width;dx+=18){c.beginPath();c.moveTo(x+dx,590);c.lineTo(x+dx+7,590-30*state.extension);c.lineTo(x+dx+14,590);c.fillStyle=state.phase==='warning'?'#d8ac6e':state.extension>0?'#ce866a':'#879b83';c.fill();}
  if(state.phase==='warning'){r.line(x,584,x+s.width,584,'#edc182',3);r.glow(x+s.width/2,583,65,'#efbe6937');}
 }
 for(const p of g.falling){if(p.state==='reforming')continue;const x=p.x-cam,y=p.state==='falling'?p.fallY:p.y;if(x<-400||x>r.canvas.width+400)continue;const shake=p.state==='warning'?Math.sin(p.timer*80)*4:0;
  if(p.state==='falling')r.platform({...p,x:p.x+shake,y});
  r.line(x+20+shake,y+5,x+85+shake,y+14,'#d4b389',2);r.line(x+85+shake,y+14,x+130+shake,y+4,'#d4b389',2);r.line(x+130+shake,y+4,x+195+shake,y+17,'#d4b389',2);
  for(let dx=8;dx<p.width;dx+=32)r.rect(x+dx+shake,y+21,17,5,p.state==='warning'?'#e6b778':'#a5a27e');
  if(p.state==='warning'){for(let j=0;j<5;j++)r.ellipse(x+20+j*45+shake,y+29+(1-p.timer/FALLING_CONFIG.warningDelay)*18,2,2,'#c7b489');r.line(x+shake,y,x+p.width+shake,y,'#f4c481',3);}
 }
 for(const q of g.crushers){const x=q.x-cam;if(x<-180||x>r.canvas.width+180)continue;const state=g.crusherAt(q),bottom=q.raisedBottom+(590-q.raisedBottom)*state.extension;
  r.rect(x-10,267,q.width+20,16,'#7b8c7d');r.line(x+10,280,x+10,bottom-q.height,'#a5b18c',7);r.line(x+q.width-10,280,x+q.width-10,bottom-q.height,'#a5b18c',7);
  r.rect(x,bottom-q.height,q.width,q.height,'#496763');r.rect(x+5,bottom-26,q.width-10,26,state.extension>.5?'#b57b62':'#a3916c');for(let dx=5;dx<q.width-10;dx+=24)r.line(x+dx,bottom-24,x+dx+18,bottom-5,'#ead19a',3);
  r.line(x-8,593,x+q.width+8,593,'#ba9b71',4);
  if(state.phase==='warning'){r.glow(x+q.width/2,572,90,'#e6b57533');c.fillStyle='#edcc8f';c.font='24px monospace';c.fillText('!',x+q.width/2-6,bottom-110);r.line(x,579,x+q.width,579,'#efc482',3);}
 }
 for(const e of g.emitters){const x=e.x-cam,y=e.y??578;r.rect(x-18,y-22,36,34,'#3f615a');r.rect(x-40,y-8,30,16,'#a1ad89');r.ellipse(x,y-32,7,7,e.phase==='telegraph'?'#edc787':'#769179');if(e.phase==='telegraph'){r.glow(x,y-28,60,'#edc1783a');r.line(x-150,y,x-47,y,'#efc68c',2);}}
 for(const p of g.projectiles){const x=p.x-cam;if(x<-50||x>r.canvas.width+50)continue;r.rect(x-12,p.y-7,24,14,'#edb183');r.line(x+18,p.y,x+34,p.y,'#d9bd8e',2);}
 const x=GACHA.x-cam;if(g.mapId===4&&x>-160&&x<r.canvas.width+160){r.rect(x-58,412,116,178,'#65827c');r.rect(x-48,423,96,94,'#1e434d');r.ellipse(x,465,34,34,'#486f70');for(let j=0;j<7;j++){const a=j*2.4+(g.mode==='gacha'?g.gachaAnimation*12:0);r.ellipse(x+Math.cos(a)*23,465+Math.sin(a)*22,8,8,['#e2b980','#a1cbba','#a9b7d0'][j%3]);}r.rect(x-35,537,70,37,'#24474b');r.ellipse(x+35,534,11,11,'#ddc496');c.fillStyle='#e2d4af';c.font='11px monospace';c.textAlign='center';c.fillText('LOGIC CODE',x,403);c.fillText(g.map4GachaUsed?'USED':'FREE · 1 PLAY',x,530);c.textAlign='left';}
 const sx=SECRET.x-cam;if(g.mapId===4&&sx>-100&&sx<r.canvas.width+100){r.glow(sx,584,85,'#add1aa37');r.ellipse(sx,588,43,7,'#9cab8c');for(let j=-2;j<=2;j++)r.line(sx-30,587+j*2,sx+30,587+j*2,'#31565c');r.line(sx+54,590,sx+54,505,'#7d977c',4);r.ellipse(sx+54,502,6,6,'#d8e2af');c.fillStyle='#d2dcb7';c.font='22px monospace';c.fillText('↓',sx-7,555);}
}
