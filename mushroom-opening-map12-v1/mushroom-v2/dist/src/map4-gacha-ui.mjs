import {createArtworkBank,artworkURL} from './map4-image-bank.mjs';
// Presentation only. Existing game controls own the roll, duration, prize and confirm.
const ROOT=new URL('../assets/map4-city-details-v3/',import.meta.url);
const bank=createArtworkBank(ROOT,name=>name+'.png');
export function gachaArtStatus(){return bank.status(['prop-gacha',...['drumsticks','magnet','kickSpring','limit','capsule'].map(k=>'reward-'+k)]);}
export const retryGachaArt=bank.retry;
let initialized=false,current='';
export function syncCityGacha(g){
 document.body.dataset.cityGacha=String(g.mapId===4&&['gacha','gacha-reward'].includes(g.mode));
 if(!initialized){initialized=true;const machine=document.createElement('img');machine.className='city-machine-art';machine.alt='';machine.src=artworkURL('prop-gacha.png',ROOT);machine.onerror=()=>{if(!machine.dataset.retry){machine.dataset.retry='1';machine.src=artworkURL('prop-gacha.png',ROOT,1);}else machine.closest('#gachaPanel').dataset.artFailed='true';};machine.onload=()=>machine.closest('#gachaPanel').dataset.artFailed='false';document.getElementById('gachaMachine').append(machine);const reward=document.createElement('img');reward.id='cityRewardArt';reward.alt='';reward.onerror=()=>{document.getElementById('gachaReward').dataset.artReady='false';if(reward.dataset.retry!==current){reward.dataset.retry=current;reward.src=artworkURL('reward-'+current+'.png',ROOT,1);}};reward.onload=()=>document.getElementById('gachaReward').dataset.artReady='true';document.getElementById('rewardSymbol').after(reward);}
 if(g.mapId!==4)return;
 if(g.gachaReward&&g.gachaReward!==current){current=g.gachaReward;const panel=document.getElementById('gachaReward');panel.dataset.artReady='false';panel.dataset.prize=current;document.getElementById('cityRewardArt').src=artworkURL('reward-'+current+'.png',ROOT);}
}
