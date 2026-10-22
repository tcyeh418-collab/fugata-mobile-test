export const id=3,worldWidth=35000;
export const SECTIONS=[{id:1,start:0,end:11200,name:'高低訊號',english:'JUMP LOW / CROUCH HIGH'},{id:2,start:11200,end:19000,name:'電壓上升',english:'MISS DJ BEAR BEAT / VOLTAGE'},{id:3,start:19000,end:35000,name:'保住微光',english:'SHIELD CHALLENGE / OPTIONAL ART'}];
export const CHECKPOINTS=[{id:'A',x:11200,y:590},{id:'B',x:18500,y:590}];
export const GAPS=[{x:1200,width:1000,bridge:true},{x:4200,width:180},{x:7900,width:200},{x:10100,width:210},{x:15800,width:190},{x:18100,width:190},{x:26700,width:1250,bridge:true},{x:29500,width:200},{x:31400,width:210}];
export const GROUND=[];let cursor=0;for(const g of GAPS){GROUND.push({id:`m3-floor-${cursor}`,x:cursor,y:590,width:g.x-cursor,height:160,ground:true});cursor=g.x+g.width;}GROUND.push({id:`m3-floor-${cursor}`,x:cursor,y:590,width:worldWidth-cursor,height:160,ground:true});
const p=(id,x,y,width,style)=>({id:`m3-${id}`,x,y,width,height:24,style});
export const PLATFORMS=[
 p('intake-pier',1320,550,260,'pier'),p('intake-pipe',1700,500,300,'pipe'),
 p('pipe-entry',4600,500,280,'pipe'),p('pipe-high',5000,420,300,'pipe'),p('pipe-exit',5370,510,300,'pier'),
 p('signal-box',8500,510,280,'girder'),p('signal-beam',8850,405,300,'suspended'),p('signal-crown',9230,330,430,'pipe'),
 p('rack-entry',16450,510,300,'container'),p('rack-mid',16800,425,330,'girder'),p('rack-top',17200,350,400,'suspended'),
 p('challenge-step',22800,480,300,'pipe'),p('challenge-lookout',23140,380,340,'girder'),
 p('chest-entry',24600,510,250,'pier'),p('chest-mid',24940,430,320,'girder'),p('chest-deck',25350,355,460,'roof'),
 p('outflow-a',26780,550,280,'pier'),p('outflow-b',27180,465,270,'pipe'),p('outflow-c',27550,530,250,'pier'),
 p('final-a',32200,500,260,'girder'),p('final-b',32560,400,300,'suspended'),p('final-c',32940,320,420,'roof'),
];
export const SPORES=[
 [1000,548,1,'main'],[5700,548,1,'main'],[9450,282,1,'upper'],
 [11900,548,2,'main'],[14800,548,2,'main'],[16400,548,2,'main'],[17400,302,2,'upper'],
 [19400,548,3,'main'],[21100,548,3,'main'],[23300,332,3,'upper'],[25580,307,3,'branch'],[33140,272,3,'branch'],[1440,502,1,'main'],[1820,452,1,'main'],[4400,548,1,'main'],[10280,548,1,'main'],[18270,548,2,'main'],[26920,502,3,'main'],[27680,482,3,'main'],[5160,372,1,'upper']].map(([x,y,section,route],i)=>({id:`map3-spore-${i+1}`,x,y,section,route,category:[3, 7, 10, 11, 12, 20].includes(i+1)?'optional':'main'}));
export const BEAR=Object.freeze({x:13200,y:590,trigger:12950,safeStart:12100,safeEnd:14500});
export const BEAR_LINES=Object.freeze(['「你真的走到這裡了。」','「讓我來稍微幫你調整一下，嘿嘿...」']);
export const GIANT=Object.freeze({visualScale:1.65,shield:1});
export const BREAKABLES=Object.freeze([{id:'weak-crate',x:15100,y:590,width:52,height:48,kind:'weak'},{id:'weak-barrier',x:17720,y:590,width:60,height:54,kind:'weak'},{id:'voltage-chest',x:25520,y:355,width:110,height:84,kind:'special'}]);
export const EMITTERS=Object.freeze([{id:'low-tutorial',x:3600,sequence:['low']},{id:'high-tutorial',x:7000,sequence:['high']},{id:'challenge-low',x:20500,sequence:['low']},{id:'challenge-high',x:22200,sequence:['high']},{id:'challenge-alternate',x:23900,sequence:['low','high','low']}]);
export const PROJECTILE=Object.freeze({activationScreens:.9,travelScreens:1.25,telegraph:1.35,cooldown:3.2,speed:175,width:24,height:14,lowY:578,highY:550});
// No bounce shortcuts through the shield challenge; the regular exit remains accessible.
export const MUSHROOM={x:-10000,y:590,capY:524,width:100};
export const FINISH={x:34300,y:590};export const movingAt=()=>null;
export const sectionAt=x=>SECTIONS.find(s=>x<s.end)??SECTIONS.at(-1);
