export const DESKTOP_RENDER=Object.freeze({width:1280,height:720});
// Desktop keeps the original 16:9 world window. Letterboxing changes no world units,
// camera range, enemy activation distance or projectile lifetime.
export function fitGame(width,height){
 width=Math.max(1,Number(width)||1);height=Math.max(1,Number(height)||1);
 const renderWidth=width<=750?Math.round(720*width/430):DESKTOP_RENDER.width;
 const scale=Math.min(width/renderWidth,height/720);
 return {renderWidth,renderHeight:720,width:renderWidth*scale,height:720*scale,uiScale:Math.max(.8,Math.min(1.18,scale))};
}
export function mountDisplay({host,stage,canvas,onResize=()=>{},Observer=ResizeObserver}){
 const resize=()=>{const rect=host.getBoundingClientRect(),layout=fitGame(rect.width,rect.height);
  stage.style.width=`${layout.width}px`;stage.style.height=`${layout.height}px`;stage.style.setProperty('--ui-scale',layout.uiScale);
  if(canvas.width!==layout.renderWidth)canvas.width=layout.renderWidth;
  if(canvas.height!==layout.renderHeight)canvas.height=layout.renderHeight;
  onResize(layout);return layout;
 };
 const observer=new Observer(resize);observer.observe(host);resize();
 return {resize,destroy:()=>observer.disconnect()};
}
export function mountFullscreen({root,button,status,document:doc=document,onResize=()=>{},onChange=()=>{}}){
 let switching=false;
 const active=()=>doc.fullscreenElement===root;
 const supported=typeof root.requestFullscreen==='function'&&doc.fullscreenEnabled!==false;
 const sync=()=>{const full=active();button.setAttribute('aria-pressed',String(full));button.setAttribute('aria-label',full?'退出全螢幕':'進入全螢幕');button.title=full?'退出全螢幕 · Esc':'進入全螢幕';button.dataset.fullscreen=String(full);button.querySelector('.fullscreen-label').textContent=full?'退出全螢幕':'全螢幕';button.disabled=!supported;if(!supported)button.title='此瀏覽器不支援全螢幕；仍可滿版遊玩';onResize();};
 const changed=()=>{sync();onChange(active());};
 const toggle=async()=>{
  if(switching||!supported)return false;switching=true;
  try{if(active())await doc.exitFullscreen();else await root.requestFullscreen();status.textContent='';return true;}
  catch{status.textContent='未能開啟全螢幕，仍可在目前的滿版畫面遊玩。';return false;}
  finally{switching=false;sync();}
 };
 const exit=async()=>{if(!active())return false;switching=true;try{await doc.exitFullscreen();return true;}catch{return false;}finally{switching=false;sync();}};
 button.addEventListener('click',toggle);doc.addEventListener('fullscreenchange',changed);sync();
 return {get switching(){return switching;},get active(){return active();},toggle,exit,destroy(){button.removeEventListener('click',toggle);doc.removeEventListener('fullscreenchange',changed);}};
}
