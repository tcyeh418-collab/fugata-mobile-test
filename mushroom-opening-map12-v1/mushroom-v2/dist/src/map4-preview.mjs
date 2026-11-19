import {Game} from './engine.mjs?rev=map5-20261020-r1';
import {cleanGiant} from './map3-game.mjs?rev=map5-20261020-r1';
const level={id:4,worldWidth:2000,GROUND:[{id:'preview-ground',x:0,y:590,width:2000,height:160,ground:true}],GAPS:[],PLATFORMS:[],SPORES:[],CHECKPOINTS:[],MUSHROOM:{x:-10000,y:590,capY:524,width:100},FINISH:{x:3000,y:590},movingAt:()=>null,sectionAt:()=>({id:1,name:'下一段旅程',english:'MAP 4 / PREVIEW'})};
export class Map4Preview extends Game{
 constructor(runState){super(level);Object.assign(this,cleanGiant(runState));this.mode='map4-preview';this.player.x=600;}
 get runState(){return {...cleanGiant(this),nextMapId:4};}
}
