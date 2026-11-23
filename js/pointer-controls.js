import {darkRoom6HitSize} from './dark-room6-layout.js';
import {darkRoom5HitSize} from './dark-room5-layout.js';
import {darkRoom4HitSize} from './dark-room4-layout.js';
import {targets,reachable,selectedTarget,cycleTarget} from './interaction-targets.js';
import {canvasPointToWorld} from './wide-room1.js';
import {darkRoom1HitHeight} from './dark-room1-layout.js';
import {darkRoom2HitSize} from './dark-room2-layout.js';
import {darkRoom3HitSize} from './dark-room3-layout.js';
export function installPointerControls(canvas,getState,input,options={}){
 const panel=document.createElement('section');panel.className='interaction-panel';panel.setAttribute('aria-label','目前選取裝置');canvas.closest('.canvas-frame').after(panel);
 let signature='';
 const blocked=s=>s.phase!=='game'||s.dialogue.active||s.tutorialOpen||s.ui.rewardsOpen||s.ui.feedbackDialogOpen||s.roomTransition.active||s.door06.status==='confirming';
 function hit(event){
  const s=getState(),r=canvas.getBoundingClientRect(),p=canvasPointToWorld(canvas,r,event.clientX,event.clientY);
  const scale=Number(canvas.dataset.projectionScale)||1,scaleY=Number(canvas.dataset.projectionScaleY)||scale;
  const minimumCssHitSize=Math.max(0,Number(options.minimumCssHitSize)||0);
  const minimumWidth=minimumCssHitSize*canvas.width/r.width/scale,minimumHeight=minimumCssHitSize*canvas.height/r.height/scaleY;
  return targets(s).filter(t=>{
   const dark=canvas.dataset.artTrial==='dark-v1';
   const room3=dark&&s.gameProgress.currentRoom===3,room4=dark&&s.gameProgress.currentRoom===4,room5=dark&&s.gameProgress.currentRoom===5,room6=dark&&s.gameProgress.currentRoom===6;
   const size=room6?darkRoom6HitSize(t):room5?darkRoom5HitSize(t):room4?darkRoom4HitSize(t):room3?darkRoom3HitSize(t):dark&&s.gameProgress.currentRoom===2?darkRoom2HitSize(t):null;
   const anchor=room3||room4?(t.hitPoint??t):t,centered=size?.centered??t.centered;
   const w=room4||room5||room6?Math.max(minimumWidth,size.width):Math.max(t.hitWidth||50,minimumWidth,size?.width||0);
   const h=Math.max(room4||room5||room6?0:t.hitHeight||60,minimumHeight,size?size.height*scale/3:
    dark&&s.gameProgress.currentRoom===1?darkRoom1HitHeight(t)*scale/3:0);
   return Math.abs(p.x-anchor.x)<=w/2&&p.y>=anchor.y-(centered?h/2:h)&&p.y<=anchor.y+(centered?h/2:16);
  }).sort((a,b)=>{const pa=a.hitPoint??a,pb=b.hitPoint??b;return (b.priority||0)-(a.priority||0)||Math.hypot(p.x-pa.x,p.y-pa.y)-Math.hypot(p.x-pb.x,p.y-pb.y);})[0];
 }
 canvas.addEventListener('pointermove',event=>{const s=getState();if(blocked(s))return;const t=hit(event);s.interaction??={};s.interaction.hoverId=t?.id??null;canvas.style.cursor=t?'pointer':'default';});
 canvas.addEventListener('pointerleave',()=>{const s=getState();if(s.interaction)s.interaction.hoverId=null;});
 canvas.addEventListener('click',event=>{
  const s=getState();if(blocked(s))return;const t=hit(event);if(!t)return;
  Object.assign(s.interaction??={},{selectedId:t.id,explicit:true});
  if(!reachable(s,t))return;
  if(t.actions.length===1)input.queueAction(t.id,t.actions[0].code);
 });
 canvas.addEventListener('keydown',event=>{if(event.code==='KeyQ'&&!event.repeat&&!blocked(getState())){event.preventDefault();cycleTarget(getState());}});
 return {render(s){
  panel.hidden=blocked(s);if(panel.hidden)return;
  const selected=selectedTarget(s),hover=targets(s).find(t=>t.id===s.interaction?.hoverId);
  if(canvas.dataset.artTrial==='dark-v1'&&s.gameProgress.currentRoom===1&&s.door01.status==='open'
    &&(hover||selected)?.id===s.door01.id){panel.hidden=true;signature='';return;}
  if(!selected&&!hover){panel.hidden=true;signature='';return;}
  const busy=s.gameProgress.currentRoom===4&&['preparing','testing'].includes(s.door04.status);
  const next=JSON.stringify([selected?.id,selected?.name,selected?.actions,selected&&reachable(s,selected),hover?.id,hover&&reachable(s,hover),busy]);if(next===signature)return;signature=next;panel.replaceChildren();
  const activeTarget=s.interaction?.explicit&&selected?selected:hover||selected;const heading=document.createElement('strong');heading.textContent=`${activeTarget.name}${reachable(s,activeTarget)?'':'｜請靠近'}`;panel.append(heading);
  for(const a of activeTarget?.actions||[]){const button=document.createElement('button');button.type='button';button.textContent=a.label;button.disabled=busy;button.onclick=()=>{input.queueAction(activeTarget.id,a.code);canvas.focus({preventScroll:true});};panel.append(button);}

 },element:panel};
}
