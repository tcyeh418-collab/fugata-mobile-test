// Browser fullscreen must be requested synchronously from a user gesture.
// The CSS viewport layout remains usable if the API is absent or rejects.
export function createScreenMode(host,button,{doc=document,onResize=()=>{}}={}){
 let pending=false;
 const sync=()=>{const full=doc.fullscreenElement===host;button.textContent=full?'↙':'⛶';button.setAttribute('aria-label',full?'退出全螢幕':'全螢幕');button.title=full?'退出全螢幕 · Esc':'全螢幕';button.setAttribute('aria-pressed',String(full));onResize()};
 const enter=()=>{if(doc.fullscreenElement===host||pending||!host.requestFullscreen||doc.fullscreenEnabled===false)return Promise.resolve(false);pending=true;try{return Promise.resolve(host.requestFullscreen()).then(()=>true,()=>false).finally(()=>{pending=false;sync()})}catch{pending=false;sync();return Promise.resolve(false)}};
 const toggle=()=>{if(doc.fullscreenElement===host)return Promise.resolve(doc.exitFullscreen()).catch(()=>false);return enter()};
 button.onclick=toggle;doc.addEventListener('fullscreenchange',sync);
 return{enter,toggle,sync};
}
