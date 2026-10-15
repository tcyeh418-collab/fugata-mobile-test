import {targets,reachable,selectedTarget,cycleTarget} from './interaction-targets.js?v=room01-theme-replay-v1';
import {setMessage} from './state.js?v=room01-theme-replay-v1';
export function installPointerControls(canvas,getState,input,options={}){
 const panel=document.createElement('section');panel.className='interaction-panel';panel.setAttribute('aria-label','目前選取裝置');canvas.closest('.canvas-frame').after(panel);
 let signature='';
 const blocked=s=>s.phase!=='game'||s.dialogue.active||s.tutorialOpen||s.roomTransition.active||s.door06.status==='confirming';
 function hit(event){const s=getState(),r=canvas.getBoundingClientRect(),p={x:(event.clientX-r.left)*canvas.width/r.width+Number(canvas.dataset.cameraX||0),y:(event.clientY-r.top)*canvas.height/r.height},minimumCssHitSize=Math.max(0,Number(options.minimumCssHitSize)||0),minimumWidth=minimumCssHitSize*canvas.width/r.width,minimumHeight=minimumCssHitSize*canvas.height/r.height;return targets(s).filter(t=>{const w=Math.max(t.hitWidth||50,minimumWidth),h=Math.max(t.hitHeight||60,minimumHeight);return Math.abs(p.x-t.x)<=w/2&&p.y>=t.y-(t.centered?h/2:h)&&p.y<=t.y+(t.centered?h/2:16);}).sort((a,b)=>(b.priority||0)-(a.priority||0)||Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];}
 canvas.addEventListener('pointermove',event=>{const s=getState();if(blocked(s))return;const t=hit(event);s.interaction??={};s.interaction.hoverId=t?.id??null;canvas.style.cursor=t?'pointer':'default';});
 canvas.addEventListener('pointerleave',()=>{const s=getState();if(s.interaction)s.interaction.hoverId=null;});
 canvas.addEventListener('click',event=>{
  const s=getState();if(blocked(s))return;const t=hit(event);if(!t)return;
  Object.assign(s.interaction??={},{selectedId:t.id,explicit:true});
  if(!reachable(s,t)){setMessage(s,['請靠近',t.name+'：請沿走道靠近裝置前方。'],3,'interaction');return;}
  if(t.actions.length===1)input.queueAction(t.id,t.actions[0].code);
 });
 canvas.addEventListener('keydown',event=>{if(event.code==='KeyQ'&&!event.repeat&&!blocked(getState())){event.preventDefault();cycleTarget(getState());}});
 return {render(s){
  panel.hidden=blocked(s);if(panel.hidden)return;
  const selected=selectedTarget(s),hover=targets(s).find(t=>t.id===s.interaction?.hoverId);
  if(!selected&&!hover){panel.hidden=true;signature='';return;}
  const busy=s.gameProgress.currentRoom===4&&['preparing','testing'].includes(s.door04.status);
  const next=JSON.stringify([selected?.id,selected?.name,selected?.actions,selected&&reachable(s,selected),hover?.id,hover&&reachable(s,hover),busy]);if(next===signature)return;signature=next;panel.replaceChildren();
  const activeTarget=selected||hover;const heading=document.createElement('strong');heading.textContent=`${activeTarget.name}${reachable(s,activeTarget)?'':'｜請靠近'}`;panel.append(heading);
  if(hover&&hover.id!==selected?.id){const hint=document.createElement('span');hint.textContent=`指向：${hover.name}｜${hover.actions.map(a=>a.label).join('／')}${reachable(s,hover)?'':'｜請靠近'}`;panel.append(hint);}
  for(const a of selected?.actions||[]){const button=document.createElement('button');button.type='button';button.textContent=a.label;button.disabled=busy;button.onclick=()=>{input.queueAction(selected.id,a.code);canvas.focus({preventScroll:true});};panel.append(button);}
  if(busy){const hint=document.createElement('small');hint.textContent='序列播放中：可走動；請先停止再拿放或試聽。';panel.append(hint);}
 },element:panel};
}
