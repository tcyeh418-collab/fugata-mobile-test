import {drawToolbox,toolboxState} from './toolbox.mjs';
import {RESCUE,QA_ROOM,SUPPLY_CRATE,MOVING_PATHS,LANDMARKS} from './map5.mjs?rev=map5-20261020-r1';
export function drawMap5Details(r,g){const c=r.c,cam=r.camera;
 // Distinct structural silhouettes behind the walkable surfaces; no camera scaling.
 for(const area of LANDMARKS){if(area.end-cam<0||area.start-cam>r.canvas.width)continue;
  const line=(x,y,xx,yy,color='#607c6c',w=3)=>r.line(x-cam,y,xx-cam,yy,color,w);
  if(area.id==='gantry'){for(const x of [3440,3935]){line(x,310,x,665,'#37584f',12);for(let y=350;y<610;y+=80)line(x-20,y,x+20,y+60,'#8b9b77',3);}line(3440,280,3940,280,'#899879',10);r.ellipse(3700-cam,277,24,24,'#314e49');r.ellipse(3700-cam,277,15,15,'#899879');line(3700,299,3700,374);}
  if(area.id==='pump'){for(const x of [14010,14310,14600]){line(x,580,x,665,'#547c76',18);line(x-25,625,x+35,625,'#a0ad86',4);}line(13910,665,14830,665,'#466f6b',22);r.ellipse(14310-cam,475,26,26,'#34534f');r.ellipse(14310-cam,475,19,19,'#9baf88');line(14291,475,14329,475);line(14310,456,14310,494);}
  if(area.id==='archive'){r.rect(23820-cam,314,340,276,'#294b48');for(let x=23845;x<24140;x+=65){r.rect(x-cam,365,28,75,'#54736a');r.rect(x-cam,470,28,62,'#1c3c3e');}line(23790,280,24190,280,'#839b7b',8);}
  if(area.id==='offset'){for(const [x,y]of [[25050,510],[25330,420],[25660,455]]){line(x,y+24,x-80,590,'#557165',7);line(x,y-100,x,y-15,'#a6b28b',2);r.ellipse(x-cam,y-108,7,7,'#c9bc82');}}
  if(area.id==='viaduct'){for(const [x,y]of [[26130,510],[26470,405],[26760,315],[27090,415],[27410,500]]){line(x,y+24,x,675,'#375950',11);line(x,y+45,x+85,y+125,'#6c8771',4);}line(26230,679,27120,679,'#679b9255',8);}
  if(area.id==='lantern'){line(29170,325,29170,590,'#36584e',10);line(29380,325,29380,590,'#36584e',10);line(29170,255,29380,255,'#8b9f7b',6);line(29275,255,29275,190,'#889d7d',2);r.glow(29275-cam,175,95,'#d6d49a27');r.rect(29263-cam,155,24,35,'#b8c18f');}
 }

 for(const path of MOVING_PATHS){r.line(path.from-cam,path.y+35,path.to+path.width-cam,path.y+35,'#a8c1a24a',2);for(const x of [path.from,path.to+path.width]){r.line(x-cam,path.y+29,x-cam,path.y+43,'#c3c89c',3);}}
 const sx=SUPPLY_CRATE.x-cam;if(sx>-200&&sx<r.canvas.width+200)drawToolbox(r,sx,590,toolboxState(g).openness);
 const x=RESCUE.x+65-cam;if(x>-450&&x<r.canvas.width+450){
 const active=g.mode==='rescuing'||g.rescued,t=g.rescued?8:g.rescueTime??0,tier=g.rescue.tier;
 const unlock=active?Math.min(1,t/1.4):0,restore=active?Math.max(0,Math.min(1,(t-1.4)/5)):0,bloom=Math.max(0,Math.min(1,(t-5.8)/2.2));
 // Industrial isolation surrounds a large body and its severed underground network.
 for(let j=0;j<8+tier*6;j++){const a=j*2.399,reach=45+tier*45,cx=x+Math.cos(a)*reach,cy=620+Math.abs(Math.sin(a))*65;
  r.line(x,620,x+(cx-x)*.42,cy,'#7c9c7866',2);r.line(x+(cx-x)*.6,cy,cx,cy,'#7c9c7866',2);
  if(restore>0)r.line(x,620,x+(cx-x)*restore,620+(cy-620)*restore,'#d3e5aa',1+tier*.6);
 }
 r.glow(x,500,65+restore*tier*55,active?'#dceab844':'#bbbd8c15');
 c.save();c.globalAlpha=.55+restore*.45;r.mushroom(x,580-bloom*Math.sin(t*3)*3,2.6,false,true);c.restore();
 r.rect(x-26,590,52,42,'#3f6558');r.line(x,590,x,625,'#bbd19a',3);
 if(unlock<1){c.save();c.globalAlpha=1-unlock;const lift=unlock*100;for(const dx of [-122,122])r.rect(x+dx,340-lift,10,250,'#405a50');r.line(x-124,340-lift,x+132,340-lift,'#a0a78b',9);for(let j=0;j<4;j++)r.line(x-120,390+j*44-lift,x+125,412+j*44-lift,'#9caa83',5);r.rect(x-19,475-lift,38,40,'#d7bc82');r.ellipse(x,474-lift,12,12,'#d7bc82');r.rect(x-4,483-lift,8,17,'#385751');c.restore();}
 if(restore>0&&restore<1&&g.rescue.energy>0){const count=Math.min(36,6+Math.ceil(Math.sqrt(g.rescue.energy)*3));for(let j=0;j<count;j++){const f=((t-1.4)*.65+j/count)%1,fromX=g.player.x-cam,fromY=g.player.y-40,px=fromX+(x-fromX)*f,py=fromY+(450-fromY)*f-Math.sin(f*Math.PI)*50;r.glow(px,py,9,'#f5e3a655');r.ellipse(px,py,2,3,'#fff0b6');}}
 for(let j=0;j<2+tier*3;j++){if(bloom<=0)continue;const side=j%2?-1:1,dx=side*(80+j*22);r.mushroom(x+dx,625+(j%2)*10,(.11+tier*.025)*bloom,j%3===0);}
 c.textAlign='center';c.font='14px monospace';c.fillStyle='#e8deba';c.fillText('MUSHROOM CORE',x,295);c.font='11px monospace';c.fillText(active?(restore<1?'MYCELIUM RESTORATION':'CORE RESTORED'):g.hasRescueKey?'RESCUE KEY ✓':'LOCKED · ⚿',x,316);c.textAlign='left';
 }
 const qx=QA_ROOM.x-cam;if(qx>-160&&qx<r.canvas.width+160){r.rect(qx-65,430,130,160,'#3c5f5e');r.rect(qx-50,447,100,143,'#1b3b42');r.ellipse(qx+26,520,4,4,'#d9cf98');c.fillStyle='#dfd5ab';c.textAlign='center';c.font='14px monospace';c.fillText('Q&A ROOM',qx,414);c.fillText('↓',qx,550);c.textAlign='left';}
}
