export const CONFIG = Object.freeze({speed:300, gravity:2100, jump:882, bounce:1080, maxHP:3, invulnerable:1, width:30, height:42, worldWidth:36000, groundY:590, total:20});
export const MAPS = Object.freeze(Array.from({length:5},(_,i)=>({id:i+1,name:i===0?'雨倉之間':i===1?'鼓棒與地底節拍':i===2?'電壓與護盾':i===3?'陷阱與可能性':'微光的歸處',status:'ready',next:i<4?i+2:null})));
export const SECTIONS = [{id:1,start:0,end:11000,name:'雨後倉庫',english:'AFTER THE RAIN'},{id:2,start:11000,end:23000,name:'城市縫隙',english:'LIFE IN THE CRACKS'},{id:3,start:23000,end:36000,name:'港邊排水區',english:'ACROSS THE WATER'}];
export const CHECKPOINTS = [{id:'A',x:10800,y:590},{id:'B',x:22800,y:590}];
export const GAPS = [
 {x:2500,width:140},{x:3800,width:170},{x:6800,width:180},{x:8400,width:200},{x:9900,width:140},
 {x:14200,width:170},{x:16400,width:180},{x:19100,width:210},{x:21600,width:150},
 {x:23500,width:150},{x:24400,width:130},{x:25200,width:170},{x:26300,width:200},{x:27100,width:190},
 {x:28200,width:650},{x:29900,width:200},{x:31400,width:1050},{x:33300,width:180},
];
export const GROUND=[];
let cursor=0;
for(const gap of GAPS){GROUND.push({id:`ground-${cursor}`,x:cursor,y:590,width:gap.x-cursor,height:160,ground:true});cursor=gap.x+gap.width;}
GROUND.push({id:`ground-${cursor}`,x:cursor,y:590,width:36000-cursor,height:160,ground:true});
const ledge=(id,x,y,width,style='roof',extra={})=>({id,x,y,width,height:24,style,...extra});
// Each landmark has its own silhouette and rhythm, rather than a repeated staircase generator.
export const PLATFORMS=[
 ledge('loading-awning',1350,525,260,'brick'),ledge('loading-balcony',1650,440,280,'brick'),ledge('loading-roof',1970,345,360,'roof'),
 ledge('courtyard-wall',4800,520,250,'brick'),ledge('courtyard-pipe',5150,445,260,'pipe'),ledge('courtyard-green-roof',5500,365,420,'roof'),
 ledge('rail-box',7150,530,300,'scaffold'),ledge('rail-beam',7530,440,360,'suspended'),
 ledge('canopy-entry',12100,480,220,'brick'),ledge('canopy-mid',12700,360,350,'scaffold'),ledge('canopy-top',13150,245,420,'roof'),ledge('canopy-exit',13700,405,280,'pipe'),
 ledge('pipe-base',15600,500,250,'pipe'),ledge('pipe-turn',15920,395,260,'pipe'),ledge('pipe-crown',16240,285,350,'pipe'),ledge('pipe-out',16800,430,400,'scaffold'),
 ledge('skylight-base',18400,520,270,'brick'),ledge('skylight-mid',18780,440,260,'suspended'),ledge('skylight-top',19120,325,500,'roof'),
 ledge('skylight-return',19900,440,280,'scaffold'),ledge('skylight-low',20260,510,400,'brick'),
 ledge('drain-overhang',25450,480,330,'pipe'),ledge('drain-beam',27350,460,330,'scaffold'),
 {id:'island',x:28410,y:563,width:230,height:180,ground:true},
 ledge('final-base',33800,510,240,'brick'),ledge('final-mid',34100,410,260,'scaffold'),ledge('final-top',34420,300,400,'roof'),
];
// Solid short steps and low warehouse passages are part of the normal route.
export const SOLIDS=[
 {id:'m1-short-a',x:2900,y:550,width:200,height:40,style:'brick'},
 {id:'m1-short-b',x:3200,y:510,width:220,height:80,style:'pipe'},
 {id:'m1-short-c',x:3480,y:550,width:200,height:40,style:'brick'},
 {id:'m1-low-warehouse-a',x:10450,y:150,width:280,height:410,ceiling:true},
 {id:'m1-low-warehouse-b',x:20750,y:150,width:500,height:410,ceiling:true},
 {id:'m1-short-d',x:21850,y:550,width:180,height:40,style:'scaffold'},
 {id:'m1-short-e',x:22130,y:500,width:220,height:90,style:'brick'},
 {id:'m1-short-f',x:22450,y:550,width:220,height:40,style:'pipe'},
];
PLATFORMS.push(...SOLIDS.filter(s=>!s.ceiling));
export const CROUCH_OBSTACLES=true;
export const LANDMARKS=[
 {x:1350,end:2350,name:'倉庫三層台',kind:'warehouse'}, {x:4800,end:5920,name:'磚牆花園',kind:'garden'},
 {x:7150,end:7890,name:'鐵道吊梁',kind:'rail'}, {x:12100,end:13980,name:'雨棚天際線',kind:'roof'},
 {x:15600,end:17200,name:'排水管塔',kind:'pipe'}, {x:18400,end:20660,name:'天窗迴廊',kind:'skylight'},
 {x:33800,end:34820,name:'港邊觀景頂',kind:'roof'},
];
export const MUSHROOM = {x:12500,y:590,capY:524,width:100};
export const MOVING = {id:'ferry',x:31410,y:548,width:230,height:22,travel:810,period:9};
export const FINISH = {x:35300,y:590};
export const SPORES = [
 [800,548,1,'main'],[2140,297,1,'upper'],[5690,317,1,'upper'],[9600,548,1,'main'],
 [11800,548,2,'main'],[21800,548,2,'main'],[13410,197,2,'upper'],[16380,237,2,'upper'],[19340,277,2,'upper'],
 [24460,405,3,'main'],[28540,505,3,'main'],[34600,252,3,'branch'],[3000,402,1,'main'],[3300,462,1,'main'],[3580,502,1,'main'],[10600,574,1,'main'],[20950,574,2,'main'],[21940,390,2,'main'],[22240,452,2,'main'],[22550,400,2,'main']].map(([x,y,section,route],i)=>({id:`spore-${i+1}`,x,y,section,route,category:[2, 3, 7, 8, 9, 12].includes(i+1)?'optional':'main'}));
export const SAVE_KEY='logiccode.mushroom.v2.map-progress.1';
export function movingAt(time){return {...MOVING,x:MOVING.x+MOVING.travel*(1-Math.cos(time*2*Math.PI/MOVING.period))/2};}
export function sectionAt(x){return SECTIONS.find(s=>x<s.end)??SECTIONS[2];}
