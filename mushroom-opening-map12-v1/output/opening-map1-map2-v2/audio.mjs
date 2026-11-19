import {PreviewBGM} from '/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/bgm-preview-v1.mjs';
import {PlaytestSFX} from './map1-sfx.mjs';
export class CampaignAudio {
 constructor(){const a=new Audio('/fugata-mobile-test/mushroom-opening-map12-v1/output/map1-local-playtest-v9/audio/MushroomBGM_Map1_v1_1024.mp3');a.preload='metadata';this.bgm=new PreviewBGM(a,{status:document.createElement('span')});this.bgm.setSuspended(true);this.sfx=new PlaytestSFX({status:document.createElement('span')});this.game=null;this.focused=true;window.addEventListener('blur',()=>{this.focused=false;this.bgm.setSuspended(true);this.sfx.setSuspended(true,true)});window.addEventListener('focus',()=>this.focused=true);window.addEventListener('pagehide',()=>{this.bgm.setSuspended(true);this.sfx.stopAll()});}
 unlock(){this.sfx.unlock();this.bgm.unlock();}
 update(g,enabled){if(g!==this.game){this.sfx.reset();this.bgm.audio.pause();this.bgm.audio.currentTime=0;this.game=g;}
 this.bgm.enabled=enabled;this.sfx.enabled=enabled;const hidden=document.hidden||!this.focused,playing=g.mapId===1&&['playing','police-caught'].includes(g.mode);this.bgm.setSuspended(hidden||!playing);this.bgm.sync();this.sfx.setSuspended(hidden||g.mapId!==1||g.mode==='paused',hidden);if(!enabled)this.sfx.stopAll();}
 handleEvent(event,g){if(g.mapId!==1)return false;this.sfx.handle([event],()=>this.bgm.setSuspended(true));return true;}
}
