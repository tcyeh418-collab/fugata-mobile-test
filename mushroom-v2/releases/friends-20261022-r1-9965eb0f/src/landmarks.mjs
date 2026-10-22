// Architecture is tied to individual collision ledges, not a single repeated terrain prefab.
export function drawLedgeArchitecture(r,s){
 const x=s.x-r.camera,c=r.c;if(x+s.width<0||x>r.canvas.width)return;
 if(s.style==='pier'){
  for(const dx of [28,s.width-28]){r.rect(x+dx-12,s.y+18,24,750-s.y,'#52655b');r.rect(x+dx-17,s.y+32,34,10,'#93a088');for(let y=s.y+60;y<730;y+=38)r.line(x+dx-9,y,x+dx+9,y,'#7d8c72',2);}
  r.rect(x-4,s.y+7,s.width+8,14,'#9b886b');r.line(x,s.y+20,x+s.width,s.y+20,'#c1b084',2);
 }else if(s.style==='girder'){
  r.rect(x,s.y+7,s.width,24,'#486c67');for(let dx=0;dx<s.width-36;dx+=40){r.line(x+dx,s.y+9,x+dx+38,s.y+29,'#9eaa88',2);r.line(x+dx,s.y+29,x+dx+38,s.y+9,'#9eaa88',2);}r.line(x,s.y+31,x+s.width,s.y+31,'#b6b88f',3);
  for(const dx of [28,s.width-28])r.line(x+dx,s.y+32,x+dx,590,'#3d5750',4);
 }else if(s.style==='suspended'){
  for(const dx of [25,s.width-25]){for(let y=115;y<s.y-5;y+=15)r.line(x+dx,y,x+dx,y+9,'#9ba890',2);}
  r.rect(x,s.y+5,s.width,13,'#606f63');for(let dx=12;dx<s.width-10;dx+=40)r.line(x+dx,s.y+8,x+dx+22,s.y+17,'#d1bf8b',2);
 }else if(s.style==='pipe'){
  r.rect(x,s.y+6,s.width,15,'#638179');r.line(x+8,s.y+9,x+s.width-8,s.y+9,'#a1b6a1',2);
  for(const dx of [25,s.width-25]){r.rect(x+dx-7,s.y+24,14,590-s.y-24,'#405f57');r.line(x+dx-4,s.y+25,x+dx-4,588,'#a3b49b',2);r.rect(x+dx-12,s.y+39,24,7,'#829681');}
 }else if(s.style==='brick'){
  for(const dx of [10,s.width-32]){for(let y=s.y+24;y<590;y+=20){r.rect(x+dx,y,22,18,'#756352');r.line(x+dx,y+9,x+dx+22,y+9,'#a18b6b55');}}
  r.rect(x,s.y+7,s.width,14,'#7d6b58');for(let dx=8;dx<s.width;dx+=32)r.line(x+dx,s.y+7,x+dx,s.y+20,'#ab9674',1);
 }else if(s.style==='container'){
  r.rect(x,s.y+6,s.width,15,'#6a7270');for(let dx=8;dx<s.width-5;dx+=24)r.line(x+dx,s.y+9,x+dx+10,s.y+19,'#d1b779',2);
  for(const dx of [22,s.width-22])r.line(x+dx,s.y+24,x+dx,590,'#556b67',8);
  r.line(x+25,s.y+24,x+s.width-25,590,'#536d65',2);
 }else if(s.style==='gantry'||s.style==='scaffold'){
  for(const dx of [20,s.width-20])r.line(x+dx,s.y+24,x+dx,590,'#657c73',5);
  r.line(x+20,s.y+24,x+s.width-20,590,'#93a184',2);r.line(x+s.width-20,s.y+24,x+20,590,'#93a184',2);
  r.rect(x,s.y+9,s.width,8,'#82967e');
 }else if(s.style==='roof'){
  r.rect(x-7,s.y+8,s.width+14,7,'#ab7960');for(let dx=5;dx<s.width;dx+=21)r.line(x+dx,s.y+8,x+dx+8,s.y+15,'#d2a47a',1);
  r.line(x+18,s.y+25,x+18,590,'#4f6759',6);r.line(x+s.width-18,s.y+25,x+s.width-18,590,'#4f6759',6);
  for(let dx=30;dx<s.width-20;dx+=45){r.line(x+dx,s.y,x+dx-5,s.y-8,'#9bb07b',2);}
 }
}
