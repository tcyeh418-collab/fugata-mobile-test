import {walkPreset,supportsWalk,loadWalkArt,loadCreatorWalkArt} from './walk-v14.js';
import {selectableOutfit,selectableOutfits,sexForTemplate} from './outfit-registry.js';
import {OPTIONS,graphemes,validateNickname,saveCharacter,fixedCharacterDraft} from './model.js';

const steps=['暱稱與性別','選擇服裝','選一個樂器','確認進入遊戲'];
const directions=[['front','正面'],['left','左側'],['right','右側'],['back','背面']];
const el=(tag,attrs={},text='')=>{const node=document.createElement(tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);node.textContent=text;return node;};
const button=(text,run)=>{const node=el('button',{type:'button'},text);node.addEventListener('click',run);return node;};
export const changeCreatorTemplate=(draft,template)=>walkPreset(template,draft.nickname,draft.instrument);
export const changeCreatorOutfit=(draft,outfit)=>walkPreset(draft.template,draft.nickname,draft.instrument,outfit);

// Shared creator: its only output is a confirmed character, never chapter progress.
export function createCharacterCreator({root,storage,onComplete,onCancel,destination='fugata'}){
 let draft=walkPreset(),step=0,direction='front',editing=false,composing=false;
 let request=0,ready=false,saving=false,active=false,openingNotice='';
 root.className='character-creator';root.hidden=true;
 root.dataset.artMode='fixed-v2';root.dataset.assemblyVersion='walk-registry';
 const header=el('header',{class:'creator-header'}),title=el('h2',{},'建立你的角色'),nav=el('nav',{'aria-label':'角色創造步驟'});
 header.append(el('p',{class:'creator-brand'},'✦ FUGATA'),title,nav);
 const layout=el('div',{class:'creator-layout'}),preview=el('section',{class:'creator-preview','aria-label':'角色預覽'}),options=el('section',{class:'creator-options','aria-label':'造型選項'});
 const nameRow=el('div',{class:'creator-name'}),input=el('input',{id:'character-nickname',placeholder:'你希望大家怎麼稱呼你？',autocomplete:'off','aria-describedby':'character-count character-error'}),count=el('output',{id:'character-count',for:'character-nickname'});
 nameRow.append(el('label',{for:'character-nickname'},'暱稱'),input,count);
 const stage=el('div',{class:'creator-stage'}),portrait=el('canvas',{width:640,height:832,role:'img','aria-label':'全身角色預覽'}),caption=el('p',{class:'creator-caption'},'選一個角色，一起踏上旅程。');stage.append(portrait,caption);
 const controls=el('div',{class:'creator-view-controls'});
 for(const [id,label]of directions){const control=button(label,()=>{if(saving)return;direction=id;render();});control.dataset.direction=id;controls.append(control);}
 const error=el('p',{id:'character-error',role:'alert',class:'creator-error'}),status=el('p',{class:'creator-help',role:'status'}),retry=button('重新載入',()=>render());retry.hidden=true;
 preview.append(nameRow,stage,controls,error,status,retry);layout.append(preview,options);
 const footer=el('footer',{class:'creator-footer'}),cancel=button('返回封面',async()=>{if(saving)return;await onCancel?.();}),prev=button('← 上一步',()=>setStep(step-1)),next=button('',()=>step<steps.length-1?setStep(step+1):finish());
 next.className='creator-primary';footer.append(cancel,prev,next);root.replaceChildren(header,layout,footer);
 input.addEventListener('compositionstart',()=>{composing=true;});
 input.addEventListener('compositionend',()=>{composing=false;updateName();});
 input.addEventListener('input',()=>{if(!composing)updateName();});
 input.addEventListener('blur',()=>{if(!composing){input.value=input.value.trim();updateName();}});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!composing&&!event.isComposing){event.preventDefault();if(step<steps.length-1)setStep(step+1);else finish();}});
 function updateName(){draft.nickname=input.value;count.textContent=`${graphemes(input.value.trim()).length} / 12`;const checked=validateNickname(input.value);error.textContent=checked.error;input.setAttribute('aria-invalid',String(Boolean(checked.error)));}
 function valid(){if(composing)return false;updateName();const checked=validateNickname(input.value);if(checked.error){input.focus();return false;}draft.nickname=checked.nickname;input.value=checked.nickname;return true;}
 function setStep(value){if(saving||value<0||value>=steps.length||value>step&&!valid())return;step=value;render();options.querySelector('h3')?.focus();}
 function lock(){for(const control of root.querySelectorAll('button'))control.disabled=saving;input.disabled=saving;next.disabled=saving||!ready;}
 function choicesForStep(){
  if(step===0)return OPTIONS.template.map(([id,label])=>({id,label,candidate:changeCreatorTemplate(draft,id)}));
  if(step===1)return selectableOutfits(sexForTemplate(draft.template)).map(outfit=>({id:outfit.id,label:outfit.label,candidate:changeCreatorOutfit(draft,outfit.id)}));
  if(step===2)return OPTIONS.instrument.map(([id,label])=>({id,label,candidate:{...draft,instrument:id}}));
  return [];
 }
 function render(){
  if(!active)return;
  const ticket=++request,selected={...draft},view=direction,choiceEntries=choicesForStep();
  ready=false;retry.hidden=true;status.textContent='正在載入角色…';
  root.dataset.step=String(step+1);root.dataset.selection=`${draft.template}:${draft.outfit}:${draft.instrument}`;
  nav.replaceChildren();steps.forEach((label,index)=>{const control=button(`${index+1}　${label}`,()=>setStep(index));if(index===step)control.setAttribute('aria-current','step');nav.append(control);});
  prev.hidden=step===0;cancel.textContent=editing?'取消修改':'返回封面';
  next.textContent=step===0?'下一步：選擇服裝 →':step===1?'下一步：選一個樂器 →':step===2?'下一步：確認角色 →':'確認並進入密室';
  for(const control of controls.children)control.setAttribute('aria-pressed',String(control.dataset.direction===direction));
  options.replaceChildren(el('h3',{tabindex:-1},`✦ ${steps[step]}`));
  const selectedKey=['template','outfit','instrument'][step];
  const grid=el('div',{class:`creator-grid ${step===0?'creator-templates':step===1?'creator-outfits':'creator-instruments'}`,role:'group','aria-label':steps[step]});
  if(step<3)options.append(grid);
  else options.append(confirmationSummary(selected));
  const cards=[];
  for(const entry of choiceEntries){
   const control=button('',()=>{if(saving)return;draft=entry.candidate;draft.nickname=input.value;openingNotice='';render();options.querySelector(`[data-option="${selectedKey}:${entry.id}"]`)?.focus();});
   control.className='creator-choice';control.dataset.option=`${selectedKey}:${entry.id}`;control.dataset.thumbnail='loading';control.setAttribute('aria-label',entry.label);control.setAttribute('aria-pressed',String(draft[selectedKey]===entry.id));
   const thumbnail=el('canvas',{width:80,height:104,'aria-hidden':'true'});control.append(thumbnail,el('span',{},entry.label),el('span',{class:'creator-check','aria-hidden':'true'},'✓'));grid.append(control);cards.push({control,thumbnail});
  }
  lock();
  loadCreatorWalkArt(selected,view,choiceEntries.map(entry=>entry.candidate)).then(loaded=>{
   if(ticket!==request||!active)return;
   const portraitContext=portrait.getContext('2d');portraitContext.clearRect(0,0,640,832);portraitContext.imageSmoothingEnabled=false;portraitContext.drawImage(loaded.portrait,0,0,640,832);
   loaded.thumbnails.forEach((image,index)=>{const context=cards[index].thumbnail.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(image,0,0,80,104);cards[index].control.dataset.thumbnail='ready';});
   portrait.setAttribute('aria-label',`${selected.template==='girl'?'女生':'男生'}・${directions.find(([id])=>id===view)[1]}・${OPTIONS.instrument.find(([id])=>id===selected.instrument)[1]}`);
   ready=true;status.textContent=openingNotice;lock();
 }).catch(()=>{if(ticket!==request||!active)return;ready=false;status.textContent='角色圖片載入失敗，請按「重新載入」再試一次。';retry.hidden=false;lock();});
 }
 function confirmationSummary(character){
  const outfit=selectableOutfit(character.outfit,sexForTemplate(character.template));
  const rows=[
   ['暱稱',character.nickname],
   ['性別',character.template==='girl'?'女生':'男生'],
   ['服裝',outfit?.label??'預設服裝'],
   ['器材',OPTIONS.instrument.find(([id])=>id===character.instrument)?.[1]??'空手'],
  ];
  const summary=el('dl',{class:'creator-confirmation','aria-label':'角色確認'});
  for(const [term,value]of rows)summary.append(el('dt',{},term),el('dd',{},value));
  return summary;
 }
 async function finish(){
  if(!active||saving||!ready||!valid())return;
  const selected={...draft};if(!supportsWalk(selected))return;
  saving=true;lock();
  try{await loadWalkArt(selected);}catch{saving=false;ready=false;status.textContent='角色圖片載入失敗，請重新載入後再完成。';retry.hidden=false;lock();return;}
  try{draft=saveCharacter(storage,selected);}catch{saving=false;error.textContent='無法保存角色，請確認瀏覽器允許本機儲存後重試。';lock();return;}
  try{await onComplete({...draft},{destination,editing});close();}catch{error.textContent='角色已保存，但暫時無法進入遊戲，請再試一次。';}finally{saving=false;lock();}
 }
 function close(){active=false;++request;root.hidden=true;}
 return {open(character,{edit=false,target=destination}={}){
  ++request;active=true;saving=false;editing=edit;destination=target;draft=fixedCharacterDraft(character);step=0;direction='front';composing=false;
  const sourceSex=sexForTemplate(character?.template),invalidOutfit=character?.outfit!==undefined&&!selectableOutfit(character.outfit,sourceSex);
  openingNotice=character?.loadNotice??(invalidOutfit?'原角色包含未開放或不相容的服裝，已改用這個性別的預設服裝；遊戲進度不會被清除。':'');
  input.value=draft.nickname;count.textContent=`${graphemes(draft.nickname.trim()).length} / 12`;error.textContent='';input.removeAttribute('aria-invalid');
  const confirming=Boolean(character&&!supportsWalk(character));title.textContent=confirming?'確認你的角色':edit?'修改你的角色':'建立你的角色';caption.textContent=confirming?'請確認這次旅程的造型，你的遊戲進度會保留。':'選一個角色，一起踏上旅程。';root.hidden=false;render();input.focus();
 },close};
}
