import {Game} from './engine.mjs?rev=map5-20261020-r1';
const level={id:0,worldWidth:2400,GROUND:[{id:'studio-floor',x:0,y:590,width:2400,height:160,ground:true}],PLATFORMS:[{id:'studio-step',x:580,y:550,width:240,height:24,style:'pipe'}],GAPS:[],SPORES:[],CHECKPOINTS:[],MUSHROOM:{x:-10000,y:590,capY:524,width:100},FINISH:{x:3000},movingAt:()=>null,sectionAt:()=>({id:1,name:'地下工作室',english:'LEROY + MISS DJ BEAR BEAT'})};
export class Studio extends Game{
 constructor(mapId,source){super(level);this.visitMap=mapId;this.source=source;this.teleport({x:1270,y:590});this.player.hp=source?.player.hp??3;this.mode='studio-talk';}
 get isGiant(){return this.source?.isGiant===true;}
 get giantShield(){return this.source?.giantShield??0;}
 step(dt,input){super.step(dt,input);if(this.mode==='playing'&&this.player.x>=1270){this.mode='studio-talk';this.player.vx=0;}}
}
export function drawStudio(r,g){const x=1500-r.camera,c=r.c;r.rect(1140-r.camera,295,1060,295,'#183d43');r.rect(1170-r.camera,315,1000,8,'#a8ad84');r.line(1160-r.camera,590,2180-r.camera,590,'#c7c59b',4);r.rect(x-280,470,85,120,'#304f53');for(const y of [505,555])r.ellipse(x-237,y,24,24,'#aeb59a');r.rect(x+280,470,85,120,'#304f53');for(const y of [505,555])r.ellipse(x+323,y,24,24,'#aeb59a');
 r.ellipse(x-65,555,42,35,'#ad9272');r.ellipse(x-65,555,31,28,'#2c4d4f');r.line(x-115,485,x-115,590,'#b0bba0',3);r.ellipse(x-115,485,37,5,'#d0b889');r.line(x+5,485,x+5,590,'#b0bba0',3);r.ellipse(x+5,485,37,5,'#d0b889');r.mushroom(x-70,480,.6,false,true);
 r.rect(x+100,485,130,75,'#566e65');r.rect(x+90,560,150,12,'#b8b893');for(let j=0;j<6;j++){r.line(x+115+j*20,495,x+115+j*20,550,'#a7b6a0',1);for(let k=0;k<3;k++)r.ellipse(x+120+j*20,505+k*17,3,3,['#e6c58d','#98c5bc','#be9b91'][k]);}r.mushroom(x+170,480,.6,true,true);r.ellipse(x+155,432,14,12,'#927d66');r.ellipse(x+183,432,14,12,'#927d66');
 for(let j=0;j<4;j++)r.line(x+80+j*25,560,x-90+j*35,587,'#8da47e',2);r.glow(x+50,500,170,'#c7d9a222');c.font='14px monospace';c.fillStyle='#ddd4ab';c.fillText('LEROY',x-115,395);c.fillText('MISS DJ BEAR BEAT',x+70,395);c.fillText('STUDIO',x-275,350);r.line(350-r.camera,550,1050-r.camera,550,'#839c8244',3);}
