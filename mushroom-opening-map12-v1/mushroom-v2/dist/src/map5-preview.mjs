import {Game} from './engine.mjs?rev=map5-20261020-r1';
import {cleanGiant} from './map3-game.mjs?rev=map5-20261020-r1';
const level={id:5,worldWidth:2000,GROUND:[{id:'map5-preview-ground',x:0,y:590,width:2000,height:160,ground:true}],PLATFORMS:[],GAPS:[],SPORES:[],CHECKPOINTS:[],MUSHROOM:{x:-10000,y:590,capY:524,width:100},FINISH:{x:3000,y:590},movingAt:()=>null,sectionAt:()=>({id:1,name:'下一段旅程',english:'MAP 5 / PREVIEW'})};
export class Map5Preview extends Game{
 constructor(state={}){super(level);this.carry=structuredClone(state);Object.assign(this,cleanGiant(state));this.player.hp=Math.max(1,Math.min(3,Math.floor(state.hp)||3));this.player.x=600;this.buffs={...state.buffs};this.bonusSpores=state.bonusSpores??0;this.advancedDanceCleared=state.advancedDanceCleared===true;this.mode='map5-preview';}
 get runState(){return {...this.carry,...cleanGiant(this),hp:this.player.hp,buffs:{...this.buffs},bonusSpores:this.bonusSpores,advancedDanceCleared:this.advancedDanceCleared,nextMapId:5};}
}
