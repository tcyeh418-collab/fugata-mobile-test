// Shared with the DOM reveal and the world drawing; read the reliable one-use reward flags.
export function toolboxState(game){
 if(game.gachaRewardGranted)return {phase:'open',openness:1};
 if(game.mode==='gacha')return {phase:'opening',openness:Math.max(0,Math.min(1,(game.gachaProgress-.12)/.7))};
 return {phase:'closed',openness:0};
}
export function drawToolbox(r,x,y,openness=0){
 const c=r.c,open=Math.max(0,Math.min(1,openness));
 r.ellipse(x,y+2,77,7,'#0a242d77');
 r.rect(x-65,y-70,130,70,'#65776a');r.rect(x-56,y-59,112,49,'#49645d');
 r.line(x-61,y-6,x+61,y-6,'#b7b28a',4);
 for(const dx of [-58,58]){r.rect(x+dx-5,y-65,10,57,'#b1b18c');r.rect(x+dx-7,y-10,14,10,'#87967b');}
 if(open>0){r.rect(x-57,y-75,114,15,'#102e34');r.line(x-54,y-67,x+53,y-67,'#798f78',3);}
 // Two latches and a small wrench identify a toolbox without a text status label.
 for(const dx of [-39,39])r.rect(x+dx-5,y-69,10,17,'#d2c394');
 r.line(x-12,y-26,x+8,y-46,'#d2c394',5);r.line(x+7,y-46,x+17,y-48,'#d2c394',4);r.line(x+8,y-46,x+8,y-55,'#d2c394',4);
 c.save();c.translate(x-65,y-73);c.rotate(-open*1.08);
 r.rect(0,-14,130,19,'#a4ae8a');r.rect(5,-10,120,7,'#6e8977');
 r.line(48,-15,48,-27,'#cfc596',5);r.line(48,-27,81,-27,'#cfc596',5);r.line(81,-27,81,-15,'#cfc596',5);
 c.restore();
}
