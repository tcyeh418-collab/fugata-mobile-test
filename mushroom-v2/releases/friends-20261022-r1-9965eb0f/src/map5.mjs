import {FALLING_CONFIG,SPIKE_TIMING,CRUSHER_TIMING,POWER_UPS,GACHA_POOL,PLAYER_TOP_BOUND,cycleAt} from './map4.mjs?rev=map5-20261020-r1';
export {FALLING_CONFIG,SPIKE_TIMING,CRUSHER_TIMING,POWER_UPS,GACHA_POOL,PLAYER_TOP_BOUND,cycleAt};
export const id=5,worldWidth=33000;
export const SECTIONS=[{id:1,start:0,end:10000,name:'最後的試煉',english:'READ / RIDE / CROSS'},{id:2,start:10000,end:23000,name:'跨越最後一道河',english:'THE FINAL PLATFORM CHALLENGE'},{id:3,start:23000,end:33000,name:'微光的歸處',english:'FIND MUSHROOM / BRING THE KEY'}];
export const CHECKPOINTS=[{id:'A',x:9500,y:590},{id:'B',x:22900,y:590}];
export const GAPS=[{x:1700,width:1000,bridge:true},{x:3350,width:650,bridge:true},{x:7000,width:1200,bridge:true},{x:14080,width:700,bridge:true},{x:18400,width:1500,bridge:true},{x:26200,width:880,bridge:true}];
export const GROUND=[];let cursor=0;for(const g of GAPS){GROUND.push({id:`m5-ground-${cursor}`,x:cursor,y:590,width:g.x-cursor,height:160,ground:true});cursor=g.x+g.width;}GROUND.push({id:`m5-ground-${cursor}`,x:cursor,y:590,width:worldWidth-cursor,height:160,ground:true});
const p=(id,x,y,width,style='girder')=>({id:`m5-${id}`,x,y,width,height:24,style});
export const STATIC_PLATFORMS=[p('boarding-a',1440,550,260,'pier'),p('boarding-c',18100,550,300,'pier'),p('high-shot-exit',15780,510,320,'pipe'),p('final-step',21200,510,300,'pipe'),p('final-rise',21570,405,330,'suspended'),p('final-crown',21950,310,450,'roof'),
 // S1: a structural tower crosses a missing quay; climb before crossing.
 p('gantry-foot',3100,510,260,'pier'),p('gantry-mid',3420,410,220,'girder'),p('gantry-crown',3680,310,300,'roof'),p('gantry-down',4100,460,230,'suspended'),
 // S2: a sunken pump channel alternates rising and falling landings.
 p('pump-entry',13920,520,240,'pipe'),p('pump-valve',14220,425,180,'pipe'),p('pump-low',14500,500,220,'pier'),p('pump-exit',14730,410,240,'suspended'),
 // S3: distinct skyline routes, with safe ground beneath the collectible climbs.
 p('archive-foot',23200,505,240,'pier'),p('archive-mid',23500,400,240,'girder'),p('archive-roof',23800,290,380,'roof'),
 p('offset-a',24950,510,240,'pipe'),p('offset-b',25260,420,200,'suspended'),p('offset-c',25570,455,220,'girder'),
 // A split-level viaduct: upper spore route and lower recovery stepping stones.
 p('viaduct-entry',26030,510,240,'girder'),p('viaduct-rise',26370,405,210,'suspended'),p('viaduct-crown',26660,315,230,'roof'),p('viaduct-down',26980,415,250,'girder'),p('viaduct-exit',27300,500,250,'pier'),
 p('recovery-a',26230,640,250,'pier'),p('recovery-b',26580,640,220,'pier'),p('recovery-c',26900,640,220,'pier'),
 p('lantern-foot',28550,510,260,'pipe'),p('lantern-mid',28860,405,220,'girder'),p('lantern-top',29130,300,280,'roof'),p('lantern-down',29430,420,240,'suspended')];
export const FALLING_PLATFORMS=[p('fall-a',7110,550,300,'falling'),p('fall-b',7530,490,320,'falling'),p('fall-c',7920,550,320,'falling'),p('high-fall',15100,510,440,'falling')];
export const PLATFORMS=[...STATIC_PLATFORMS,...FALLING_PLATFORMS];
export const MOVING_PATHS=[{id:'m5-ferry-a',from:1500,to:2240,y:550,width:440,period:16},{id:'m5-ferry-c',from:18200,to:19550,y:550,width:500,period:24}];
export function movingPlatformsAt(t){return MOVING_PATHS.map(q=>{const phase=((t%q.period)+q.period)%q.period/q.period;return {id:q.id,x:q.from+(q.to-q.from)*(phase<.5?phase*2:2-phase*2),y:q.y,width:q.width,height:24,style:'pier',moving:true};});}
export const movingAt=()=>null;
export const SPIKES=[{id:'m5-spike-shot',x:4610,width:110,offset:.8},{id:'m5-crusher-spike',x:11180,width:110,offset:1.1}];
export const CRUSHERS=[{id:'m5-crusher',x:11000,width:120,raisedBottom:365,height:90}];
export const EMITTERS=[{id:'m5-moving-high',x:2660,y:510,sequence:['high']},{id:'m5-spike-low',x:4950,y:578,sequence:['low']},{id:'m5-falling-high',x:15750,y:470,sequence:['high']},{id:'m5-moving-low',x:20100,y:538,sequence:['low']}];
export const HAZARD_ZONES=[{id:'ride-high',start:1300,end:2900,kinds:['moving','projectile']},{id:'spike-low',start:4200,end:5150,kinds:['spikes','projectile']},{id:'fall-pit',start:6800,end:8450,kinds:['falling','pit']},{id:'crusher-spikes',start:10400,end:11500,kinds:['crusher','spikes']},{id:'fall-high',start:14800,end:16200,kinds:['falling','projectile']},{id:'ride-low-pit',start:17800,end:20400,kinds:['moving-over-pit','projectile']}];
export const GACHA=Object.freeze({x:13000,y:590,radius:110,animationDuration:1.3,safeStart:12300,safeEnd:13700});
export const SUPPLY_CRATE=GACHA;
export const SPORES=[[2100,502,1,'ride'],[3820,262,1,'upper'],[7660,442,1,'upper'],[11600,548,2,'main'],[14590,452,2,'upper'],[15320,462,2,'upper'],[19200,502,2,'ride'],[22200,262,2,'upper'],[24000,242,3,'upper'],[25660,407,3,'upper'],[26770,267,3,'upper'],[29260,252,3,'upper'],[2800,548,1,'main'],[3510,362,1,'main'],[8080,502,1,'main'],[11280,400,2,'main'],[14850,362,2,'main'],[21400,462,2,'main'],[26170,462,3,'main'],[27430,452,3,'main']].map(([x,y,section,route],i)=>({id:`map5-spore-${i+1}`,x,y,section,route,category:[6, 8, 9, 10, 11, 12].includes(i+1)?'optional':'main'}));
export const RESCUE=Object.freeze({x:30200,y:590,radius:145,duration:8});
export const QA_ROOM=Object.freeze({x:30900,y:590,radius:120,returnX:30600});
export const SECRET=QA_ROOM;
// Rescue requires a key and an explicit interaction; crossing the level never clears it.
export const MUSHROOM={x:-10000,y:590,capY:524,width:100},FINISH={x:worldWidth+1000,y:590};
export const sectionAt=x=>SECTIONS.find(s=>x<s.end)??SECTIONS.at(-1);

export const TERRAIN_REVISION=2;
export const LANDMARKS=[{id:'gantry',start:3050,end:4350},{id:'pump',start:13850,end:15000},{id:'archive',start:23150,end:24200},{id:'offset',start:24900,end:25800},{id:'viaduct',start:25950,end:27600},{id:'lantern',start:28500,end:29700}];
