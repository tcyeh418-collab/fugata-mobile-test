import {Game} from './engine.mjs?rev=map5-20261020-r1';
const level={id:0,worldWidth:2400,GROUND:[{id:'studio-floor',x:0,y:590,width:2400,height:160,ground:true}],PLATFORMS:[{id:'studio-step',x:580,y:550,width:240,height:24,style:'pipe'}],GAPS:[],SPORES:[],CHECKPOINTS:[],MUSHROOM:{x:-10000,y:590,capY:524,width:100},FINISH:{x:3000},movingAt:()=>null,sectionAt:()=>({id:1,name:'地下工作室',english:'LEROY + MISS DJ BEAR BEAT'})};
export class Studio extends Game{
 constructor(mapId,source){super(level);this.visitMap=mapId;this.source=source;this.teleport({x:1270,y:590});this.player.hp=source?.player.hp??3;this.mode='studio-talk';}
 get isGiant(){return this.source?.isGiant===true;}
 get giantShield(){return this.source?.giantShield??0;}
 step(dt,input){super.step(dt,input);if(this.mode==='playing'&&this.player.x>=1270){this.mode='studio-talk';this.player.vx=0;}}
}
export {drawStudioArt as drawStudio} from './studio-art.mjs';
