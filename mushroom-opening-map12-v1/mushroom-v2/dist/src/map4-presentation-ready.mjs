import {cityPropStatus,retryCityProps} from './map4-city-props.mjs';
import {cityNPCStatus,retryCityNPCs} from './map4-npc-art.mjs';
import {studioArtStatus,retryStudioArt} from './studio-art.mjs';
import {gachaArtStatus,retryGachaArt} from './map4-gacha-ui.mjs';
let overlay=null,skipped=false;
export function warmMap4Presentation(){skipped=false;cityPropStatus();cityNPCStatus();gachaArtStatus();studioArtStatus();}
export function map4PresentationStatus({studio=false}={}){const groups={props:cityPropStatus(),npc:cityNPCStatus(),gacha:gachaArtStatus()};if(studio)groups.studio=studioArtStatus();return{ready:Object.values(groups).every(s=>s.ready),failed:Object.entries(groups).flatMap(([group,s])=>s.failed.map(key=>group+':'+key)),groups};}
export function retryMap4Presentation(){retryCityProps();retryCityNPCs();retryGachaArt();retryStudioArt();warmMap4Presentation();}
export function waitForMap4Artwork(game,{studio=false}={}){
 if(game.mapId!==4||['result','map5-preview','coming-soon'].includes(game.mode)){if(overlay)overlay.hidden=true;return false;}
 const status=map4PresentationStatus({studio:studio||game.mode.startsWith('studio-')});
 if(!overlay){overlay=document.createElement('section');overlay.id='cityArtLoading';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.innerHTML='<h2>正在準備城市燈火</h2><p></p><div><button type="button" data-art-action="retry">重試載入</button><button type="button" data-art-action="fallback">使用替代畫面繼續</button></div>';overlay.querySelector('[data-art-action="retry"]').onclick=retryMap4Presentation;overlay.querySelector('[data-art-action="fallback"]').onclick=()=>{skipped=true;};document.querySelector('.stage').append(overlay);}
 const waiting=!status.ready&&!skipped;overlay.hidden=!waiting;overlay.querySelector('p').textContent=status.failed.length?'部分場景未能載入，請重試。':'即將開始探索…';overlay.querySelector('div').hidden=!status.failed.length;return waiting;
}
