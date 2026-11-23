// Art coordinates are independent of the established puzzle/save coordinates.
import {integratedChapterRequested} from './chapter-route.js';
// Floor positions project into the wide room; sprites retain uniform proportions.
export const DARK_ROOM1 = Object.freeze({
  width:2520, height:1080, floorScaleX:3, floorScaleY:.7,
  floorOffsetX:130, floorOffsetY:565,
  assetRoot:'assets/art/fugata/room01/dark-v1/',
});

export function darkRoom1Projection(width,height) {
  const displayHeight=Math.min(height,width*DARK_ROOM1.height/DARK_ROOM1.width);
  const renderWidth=Math.max(DARK_ROOM1.width,Math.round(DARK_ROOM1.height*width/displayHeight));
  const sceneScale=renderWidth/DARK_ROOM1.width;
  return {width:renderWidth,height:DARK_ROOM1.height,displayHeight,sceneScale,
    scaleX:3*sceneScale,scaleY:.7,
    offsetX:130*sceneScale,offsetY:(1080-1080*sceneScale)/2+731*sceneScale-237*.7};
}

export function darkRoom1Point(point,projection) {
  return {x:point.x*projection.scaleX+projection.offsetX,
    y:point.y*projection.scaleY+projection.offsetY};
}

export function darkRoom1FloorProjection(sceneScale=1) {
  return {scaleX:3,scaleY:.7/sceneScale,offsetX:130,offsetY:731-237*.7/sceneScale};
}

export function isDarkRoom1State(state) {
  return state.gameProgress.currentRoom===1&&state.room01Presentation?.kind==='dark-v1';
}

// The star at the centre of the floor inlay, measured on the clean source.
// Sixteen art pixels place the centre of the plinth above its bottom anchor.
export const DARK_ROOM1_CENTRE=Object.freeze({x:970*2520/1914,y:615*1080/822,plinthOffset:16});
export const DARK_ROOM1_EXIT=Object.freeze({left:2300,right:2448,front:740,threshold:700,back:650});

export function configureDarkRoom1(state) {
  state.room01Presentation={kind:'dark-v1',sceneScale:1};
  state.player.x=300;state.player.y=520;
  state.room01ThemeReplay.interactionPoint={x:55,y:365};
  syncDarkRoom1SceneScale(state,1);
  state.door01.interactionZone={x:705,y:245,width:72,height:105};
}

export function syncDarkRoom1SceneScale(state,sceneScale) {
  state.room01Presentation.sceneScale=sceneScale;
  const p=darkRoom1FloorProjection(sceneScale);
  const centre={x:(DARK_ROOM1_CENTRE.x-p.offsetX)/p.scaleX,
    y:(DARK_ROOM1_CENTRE.y+DARK_ROOM1_CENTRE.plinthOffset-p.offsetY)/p.scaleY};
  const station=state.fragments.find(f=>f.pedestalId==='pedestal-03');
  if(station){Object.assign(station,centre);station.originalPosition={...centre};}
}

export function darkRoom1MovementScale(state) {
  if(!isDarkRoom1State(state))return {x:1,y:1};
  const s=state.room01Presentation.sceneScale||1;
  // Normalise input BEFORE compensation: diagonal movement must not be faster.
  // 205 world units/s -> 307.5 art pixels/s along either screen axis at s=1.
  return {x:.5,y:1.5*s/.7};
}

export function darkRoom1Walls(state) {
  const p=darkRoom1FloorProjection(state.room01Presentation.sceneScale||1);
  const rect=(id,x,y,width,height)=>({id,x:(x-p.offsetX)/p.scaleX,y:(y-p.offsetY)/p.scaleY,
    width:width/p.scaleX,height:height/p.scaleY});
  const walls=[
    {id:'dark-room1-top',x:40,y:40,width:768,height:18},
    {id:'dark-room1-bottom',x:40,y:582,width:768,height:18},
    {id:'dark-room1-left',x:40,y:40,width:18,height:560},
    {id:'dark-room1-right',x:788,y:40,width:20,height:560},
    // These occupy the painted stonework, not the former horizontal connector.
    rect('dark-room1-left-doorpost',2200,0,100,728),
    rect('dark-room1-right-doorpost',2448,0,72,810),
    rect('dark-room1-tunnel-back',2300,595,148,20),
  ];
  if(state.door01.status!=='open')walls.push(rect('door-01-collider',2300,714,148,18));
  return walls;
}

export function darkRoom1ExitTrigger(state,baseTrigger) {
  const p=darkRoom1FloorProjection(state.room01Presentation.sceneScale||1);
  return {...baseTrigger,x:(DARK_ROOM1_EXIT.left-p.offsetX)/p.scaleX,
    minX:(DARK_ROOM1_EXIT.left-p.offsetX)/p.scaleX+state.player.radius,
    maxX:(DARK_ROOM1_EXIT.right-p.offsetX)/p.scaleX-state.player.radius,
    minY:(DARK_ROOM1_EXIT.back-p.offsetY)/p.scaleY,
    maxY:(DARK_ROOM1_EXIT.threshold-p.offsetY)/p.scaleY,
    perspective:{vanishingPoint:{x:(2370-p.offsetX)/p.scaleX,y:(670-p.offsetY)/p.scaleY},
      duration:.55,minScale:.88,fadeStart:.6}};
}

export function darkRoom1DoorDepth(state) {
  if(!isDarkRoom1State(state)||state.door01.status!=='open')return 0;
  const p=darkRoom1FloorProjection(state.room01Presentation.sceneScale||1),foot=darkRoom1Point(state.player,p);
  if(foot.x<DARK_ROOM1_EXIT.left+30||foot.x>DARK_ROOM1_EXIT.right-30)return 0;
  return Math.max(0,Math.min(1,(DARK_ROOM1_EXIT.front-foot.y)/(DARK_ROOM1_EXIT.front-DARK_ROOM1_EXIT.back)));
}

export function isDarkRoom1Trial(locationLike) {
  if(integratedChapterRequested(locationLike))return true;
  const q=new URLSearchParams(locationLike?.search??'');
  return ['127.0.0.1','localhost','::1'].includes(locationLike?.hostname)
    && /^(?:room[1-6]|1|ending)$/.test(q.get('test')??'')
    && q.get('artTrial')==='dark-v1'&&!q.has('mobile');
}

export function darkRoom1HitHeight(target) {
  if(target.id==='room01-theme-replay')return 300;
  if(target.id==='door-01')return 560;
  return 365;
}
