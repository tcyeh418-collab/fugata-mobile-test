// Map 2 changes world contents only. All camera, pixel scale and physics come from Map 1.
export const id = 2;
export const worldWidth = 39000;
export const layoutRevision = 3;
export const SECTIONS = [
 {id:1,start:0,end:10500,name:'鐵道起伏',english:'A SIGNAL IN THE RAIN'},
 {id:2,start:10500,end:21500,name:'鼓棒與風',english:'MEET LEROY / RUN WITH THE RHYTHM'},
 {id:3,start:21500,end:39000,name:'地底的節拍',english:'SOMETHING BELOW THE SURFACE'},
];
export const CHECKPOINTS = [{id:'A',x:10300,y:590},{id:'B',x:21400,y:590},{id:'RUN',x:11450,y:590}];
export const GAPS = [
 {x:2400,width:140},{x:3000,width:1100,bridge:true},{x:4800,width:190},{x:6900,width:190},{x:8100,width:210},
 {x:12300,width:310,speedGate:true},{x:13800,width:320,speedGate:true},{x:15300,width:330,speedGate:true},{x:18100,width:340,speedGate:true},
 {x:22300,width:1050,bridge:true},{x:25800,width:190},{x:26900,width:170},{x:29300,width:1500,bridge:true},{x:31000,width:210},{x:32300,width:200},{x:33700,width:210},
];
export const GROUND = [];
let cursor=0;
for(const gap of GAPS){GROUND.push({id:`m2-ground-${cursor}`,x:cursor,y:590,width:gap.x-cursor,height:160,ground:true});cursor=gap.x+gap.width;}
GROUND.push({id:`m2-ground-${cursor}`,x:cursor,y:590,width:worldWidth-cursor,height:160,ground:true});
export const PLATFORMS = [
 {id:'m2-step-a',x:1000,y:530,width:260,height:24},
 {id:'m2-step-b',x:1400,y:465,width:320,height:24},
 {id:'m2-overlook',x:1800,y:355,width:430,height:24,style:'container',upper:true},
 {id:'m2-observe',x:5500,y:480,width:380,height:24},
 {id:'m2-signal-pier-a',x:3080,y:550,width:200,height:24,style:'pier'},
 {id:'m2-signal-pier-b',x:3400,y:455,width:220,height:24,style:'pier'},
 {id:'m2-signal-pier-c',x:3730,y:520,width:240,height:24,style:'pier'},
 {id:'m2-switch-base',x:8450,y:500,width:320,height:24,style:'girder'},
 {id:'m2-switch-right',x:8890,y:395,width:320,height:24,style:'suspended'},
 {id:'m2-switch-left',x:8640,y:285,width:260,height:24,style:'girder'},
 {id:'m2-switch-exit',x:9090,y:195,width:380,height:24,style:'suspended'},
 {id:'m2-sprint-podium',x:15900,y:520,width:320,height:24,style:'container'},
 {id:'m2-sprint-gantry',x:16420,y:415,width:300,height:24,style:'gantry'},
 {id:'m2-sprint-crown',x:16980,y:300,width:440,height:24,style:'gantry'},
 {id:'m2-sprint-return',x:17520,y:430,width:300,height:24,style:'container'},
 {id:'m2-crane-walk',x:7350,y:510,width:310,height:24,style:'container'},
 {id:'m2-tide-a',x:22400,y:545,width:230,height:24,style:'pier'},
 {id:'m2-tide-b',x:22740,y:445,width:240,height:24,style:'pier'},
 {id:'m2-tide-c',x:23070,y:515,width:210,height:24,style:'pier'},
 {id:'m2-saddle-a',x:23720,y:390,width:480,height:24,style:'roof'},
 {id:'m2-saddle-b',x:24280,y:310,width:360,height:24,style:'girder'},
 {id:'m2-saddle-low',x:24750,y:390,width:300,height:24,style:'roof'},
 {id:'m2-saddle-exit',x:25200,y:285,width:320,height:24,style:'girder'},
 {id:'m2-chain-a',x:29360,y:540,width:250,height:24,style:'suspended'},
 {id:'m2-chain-b',x:29700,y:445,width:200,height:24,style:'suspended'},
 {id:'m2-chain-c',x:30000,y:350,width:240,height:24,style:'suspended'},
 {id:'m2-chain-d',x:30370,y:460,width:260,height:24,style:'suspended'},
 {id:'m2-roof-entry',x:35200,y:500,width:240,height:24,style:'roof'},
 {id:'m2-roof-high',x:35550,y:385,width:300,height:24,style:'girder'},
 {id:'m2-roof-low',x:35900,y:470,width:300,height:24,style:'roof'},
 {id:'m2-roof-exit',x:36340,y:360,width:300,height:24,style:'girder'},
];
export const MUSHROOM = {x:23600,y:590,capY:524,width:100};
export const FINISH = {x:38200,y:590};
export const SPORES = [
 [1200,482,1,'main'],[5200,548,1,'main'],[9300,147,1,'upper'],
 [12455,385,2,'sprint'],[13960,385,2,'sprint'],[15465,385,2,'sprint'],[17180,252,2,'upper'],[18270,385,2,'sprint'],
 [22860,397,3,'main'],[25360,237,3,'upper'],[30120,302,3,'main'],[36500,312,3,'branch'],[1100,398,1,'main'],[3500,407,1,'main'],[5650,432,1,'main'],[12680,548,2,'main'],[15780,548,2,'main'],[23200,452,3,'main'],[1550,417,1,'upper'],[8790,237,1,'upper']].map(([x,y,section,route],i)=>({id:`map2-spore-${i+1}`,x,y,section,route,category:[3, 7, 10, 12, 19, 20].includes(i+1)?'optional':'main'}));
export const LEROY = Object.freeze({x:11200,y:590,trigger:11040});
export const LEROY_LINES = Object.freeze(['「你終於到這邊啦！」','「前面那段路還行吧？辛苦你了。」','「來，這個鼓棒給你用，速度會快很多！」']);
export const DRUMSTICKS = Object.freeze({duration:30,multiplier:1.6});
export const SPRINT = Object.freeze({start:11450,end:20000,restartX:11500,layoutRevision:2});
export const LANDMARKS=[{x:3080,end:3970,name:'斷橋墩台',kind:'pier'},{x:8450,end:9470,name:'折返吊架',kind:'switchback'},{x:11450,end:20000,name:'鼓棒水道試跑',kind:'sprint'},{x:15900,end:17820,name:'四層吊車冠頂',kind:'gantry'},{x:22400,end:23280,name:'潮汐墩台',kind:'pier'},{x:23720,end:25520,name:'起伏屋頂',kind:'roof'},{x:29360,end:30630,name:'跨水吊橋',kind:'suspended'},{x:35200,end:36640,name:'高低屋簷',kind:'roof'}];
export const SECRET = Object.freeze({x:37000,y:590,radius:110,returnX:36840});
export const EMITTERS = Object.freeze([{id:'low-01',x:6100,y:570},{id:'low-02',x:28300,y:570}]);
export const PROJECTILE = Object.freeze({telegraph:1.2,cooldown:3.8,speed:180,lifetime:3.2,range:720,width:22,height:18});
export const movingAt=()=>null;
export const sectionAt=x=>SECTIONS.find(s=>x<s.end)??SECTIONS.at(-1);
