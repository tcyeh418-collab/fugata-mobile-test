export const id=4,worldWidth=38000;
export const SECTIONS=[{id:1,start:0,end:11000,name:'陷阱的呼吸',english:'READ THE CYCLE / KEEP MOVING'},{id:2,start:11000,end:20000,name:'免費的可能性',english:'LOGIC CODE GACHA / ONE FREE TURN'},{id:3,start:20000,end:38000,name:'工業節奏',english:'WAIT / JUMP / LAND'}];
export const CHECKPOINTS=[{id:'A',x:10800,y:590},{id:'B',x:19800,y:590},{id:'C',x:32600,y:590}];
export const GAPS=[{x:3200,width:170},{x:5600,width:480,bridge:true},{x:7300,width:1000,bridge:true},{x:15100,width:140},{x:17400,width:170},{x:28600,width:190},{x:30000,width:1700,bridge:true},{x:33700,width:190}];
export const GROUND=[];let cursor=0;for(const g of GAPS){GROUND.push({id:`m4-ground-${cursor}`,x:cursor,y:590,width:g.x-cursor,height:160,ground:true});cursor=g.x+g.width;}GROUND.push({id:`m4-ground-${cursor}`,x:cursor,y:590,width:worldWidth-cursor,height:160,ground:true});
const p=(id,x,y,width,style='girder')=>({id:`m4-${id}`,x,y,width,height:24,style});
export const STATIC_PLATFORMS=[p('first-step',4100,510,260,'pipe'),p('exit-a',8750,510,280,'pipe'),p('exit-b',9120,410,280,'girder'),p('exit-c',9500,410,430,'suspended'),p('practice-a',15500,510,280,'container'),p('practice-b',15900,400,300,'pipe'),p('practice-high',16300,260,430,'girder'),p('practice-return',16800,440,360,'roof'),p('magnet-a',18100,510,260,'pipe'),p('magnet-b',18450,450,480,'suspended'),p('crusher-watch',24200,470,500,'girder'),p('late-a',33200,510,280,'pipe'),p('late-b',34100,410,280,'girder'),p('late-c',34500,320,450,'roof')];
export const FALLING_CONFIG=Object.freeze({warningDelay:1,gravity:850,reformDelay:2.5,fallLimit:900});
export const FALLING_PLATFORMS=[p('fall-single',5700,550,250,'falling'),p('fall-pair-a',7400,550,270,'falling'),p('fall-pair-b',7810,500,300,'falling'),p('fall-combo',22580,520,260,'falling'),p('fall-final-a',30100,550,270,'falling'),p('fall-final-b',30520,465,270,'falling'),p('fall-final-c',30900,420,280,'falling'),p('fall-final-d',31320,510,240,'falling')];
export const PLATFORMS=[...STATIC_PLATFORMS,...FALLING_PLATFORMS];
export const SPIKE_TIMING=Object.freeze({safe:2.8,warning:1.15,rise:.25,hold:1.2,down:.35});
export const CRUSHER_TIMING=Object.freeze({safe:2.8,warning:1.25,rise:.35,hold:1.1,down:.55});
// Both configs use safe → warning → extend → hold → retract; crushers extend downwards.
export const SPIKES=[{id:'spike-first',x:2200,width:110,offset:0},{id:'spike-jump',x:3700,width:110,offset:.6},{id:'spike-practice',x:14000,width:110,offset:1.5},{id:'spike-falling',x:22640,width:100,offset:0}];
export const CRUSHERS=[{id:'crusher-intro',x:20900,width:120,raisedBottom:365,height:90},{id:'crusher-shot',x:25200,width:120,raisedBottom:365,height:90}];
export const HAZARD_ZONES=[{id:'first-spike',start:1900,end:2600,kinds:['spikes']},{id:'jump-spike',start:3500,end:4000,kinds:['spikes']},{id:'single-fall',start:5400,end:6250,kinds:['falling','pit']},{id:'paired-fall',start:7100,end:8500,kinds:['falling','pit']},{id:'practice',start:13700,end:14300,kinds:['spikes']},{id:'crusher-intro',start:20300,end:21500,kinds:['crusher']},{id:'spike-fall',start:21900,end:23400,kinds:['spikes','falling']},{id:'crusher-shot',start:24200,end:26100,kinds:['crusher','projectile']},{id:'late-fall',start:29800,end:32000,kinds:['falling','pit']}];
export const EMITTERS=[{id:'m4-low',x:25500,sequence:['low']}];
export const GACHA=Object.freeze({x:13000,y:590,radius:110,animationDuration:1.3,safeStart:12300,safeEnd:13400});
export const POWER_UPS=Object.freeze({drumsticks:{name:'Leroy Drumsticks',duration:30,speedMultiplier:1.3},magnet:{name:'CV Magnet Module',duration:20,range:220,pullSpeed:520},kickSpring:{name:'Kick Spring',duration:20,jumpMultiplier:1.38},limit:{name:'LIMIT Module',duration:8},capsule:{name:'Spore Capsule',bonusSpores:2}});
export const GACHA_POOL=Object.freeze(['drumsticks','magnet','kickSpring','limit','capsule']);
export const SPORES=[
 [900,548,1,'main'],[4300,548,1,'main'],[9750,362,1,'upper'],
 [11900,548,2,'main'],[14500,548,2,'main'],[16450,212,2,'upper'],[18800,402,2,'branch'],
 [20500,548,3,'main'],[23200,548,3,'main'],[25800,548,3,'main'],[16100,352,2,'upper'],[34700,272,3,'branch'],[3370,548,1,'main'],[5820,502,1,'main'],[7530,502,1,'main'],[7940,452,1,'main'],[14820,548,2,'main'],[17980,548,2,'main'],[31510,462,3,'main'],[34270,362,3,'upper']].map(([x,y,section,route],i)=>({id:`map4-spore-${i+1}`,x,y,section,route,category:[3, 6, 7, 11, 12, 20].includes(i+1)?'optional':'main'}));
export const SECRET=Object.freeze({x:36700,y:590,radius:110,returnX:36540});
export const MUSHROOM={x:-10000,y:590,capY:524,width:100};export const FINISH={x:37400,y:590};export const movingAt=()=>null;export const sectionAt=x=>SECTIONS.find(s=>x<s.end)??SECTIONS.at(-1);
export const PLAYER_TOP_BOUND=110;
export function cycleAt(time,cfg,offset=0){let t=((time+offset)%Object.values(cfg).reduce((a,b)=>a+b,0)+Object.values(cfg).reduce((a,b)=>a+b,0))%Object.values(cfg).reduce((a,b)=>a+b,0);for(const [key,duration]of Object.entries(cfg)){if(t<duration){const progress=duration?t/duration:0;return {phase:key,progress,extension:key==='rise'?progress:key==='hold'?1:key==='down'?1-progress:0};}t-=duration;}return {phase:'safe',progress:0,extension:0};}
