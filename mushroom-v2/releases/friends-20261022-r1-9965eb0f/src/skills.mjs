import {POWER_UPS} from './map4.mjs?rev=map5-20261020-r1';
const paths={
 drumsticks:'M14 12L35 36M12 14L33 38M34 12L13 36M36 14L15 38',
 magnet:'M13 12V26A11 11 0 0 0 35 26V12H28V26A4 4 0 0 1 20 26V12ZM13 20H20M28 20H35',
 kickSpring:'M12 38H29M15 34L26 30L15 26L26 22L15 18H27M35 28V11M29 17L35 11L41 17',
 limit:'M24 9L37 14V25Q36 33 24 40Q12 33 11 25V14ZM18 24L23 29L31 19',
 giant:'M10 25Q8 12 22 11Q36 12 34 25ZM18 26V37H27V26M18 18H19M26 16H27M35 25L30 33H36L32 41L42 30H36L40 25',
};
export function activeSkills(game){
 const skills=[];
 if(game.mapId===2&&game.drumsticksRemaining>0)skills.push({id:'drumsticks',remaining:game.drumsticksRemaining,duration:30,name:'Drumsticks'});
 for(const [id,remaining] of Object.entries(game.buffs??{}))if(remaining>0&&POWER_UPS[id])skills.push({id,remaining,duration:POWER_UPS[id].duration,name:POWER_UPS[id].name});
 if(game.isGiant&&game.giantShield>0)skills.push({id:'giant',name:'Giant · Shield'});
 return skills.map(s=>({...s,ratio:s.duration?Math.max(0,Math.min(1,s.remaining/s.duration)):null,warning:!!s.duration&&s.remaining<=3}));
}
export function renderSkills(root,game,{visible=true,studio=false}={}){
 root.hidden=!visible;root.classList.toggle('in-studio',studio);root.classList.toggle('frozen',game.mode!=='playing');
 const skills=visible?activeSkills(game):[];
 for(const el of [...root.children])if(!skills.some(s=>s.id===el.dataset.skill))el.remove();
 for(const s of skills){let el=[...root.children].find(e=>e.dataset.skill===s.id);if(!el){el=document.createElement('span');el.className='skill-icon';el.dataset.skill=s.id;el.setAttribute('role','img');el.innerHTML=`<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="skill-base" cx="24" cy="24" r="22"/><path class="skill-symbol" d="${paths[s.id]}"/>${s.duration?'<circle class="skill-ring" cx="24" cy="24" r="22" pathLength="100"/>':''}</svg>`;root.append(el);}el.setAttribute('aria-label',s.name);el.title=s.name;el.classList.toggle('warning',s.warning);el.querySelector('.skill-ring')?.setAttribute('stroke-dashoffset',String(100*(1-s.ratio)));}
}
