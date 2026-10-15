import { backupBeforeWrite } from '../save-backups.js';
import {walkPreset} from './walk-v14.js';
import {selectableOutfit,sexForTemplate} from './outfit-registry.js';
import {isTrialCharacter,trialCharacter,TRIAL_OPTIONS} from './trial-model.js';
// Shared across chapters. IDs are persisted; labels and order may change independently.
export const CHARACTER_KEY = 'logic-code.character.v1';
export const OPTIONS = {
  template: [['boy','男生'],['girl','女生']],
  skin: [['porcelain','瓷白','#f3d1b0'],['peach','暖膚','#e8b48e'],['honey','蜜色','#c68e60'],['bronze','古銅','#98633f'],['umber','深棕','#654332']],
  body: [['slim','纖細'],['regular','標準'],['round','圓潤']],
  hair: [['crop','俐落短髮'],['part','側分短髮'],['wave','微捲短髮'],['swept','後梳短髮'],['shag','層次短髮'],['bob','齊耳短髮'],['long','柔順長髮'],['pony','高馬尾'],['braid','側編髮'],['bun','丸子頭']],
  hairColor: [['espresso','深棕','#372a2b'],['chestnut','栗棕','#76503c'],['gold','亞麻金','#bd9456'],['silver','霧銀','#a3abba'],['plum','莓紫','#735275']],
  expression: [['smile','微笑'],['calm','冷靜'],['serious','認真'],['playful','調皮'],['dreamy','呆萌']],
  outfit: [['casual-m','日系休閒・襯衫工裝褲'],['minimal-m','韓系簡約・外套直筒褲'],['chinese-m','中式日常・盤扣長褲'],['street-m','歐美休閒・帽Ｔ牛仔褲'],['musician-m','音樂人・紫背心'],['casual-f','日系休閒・罩衫長裙'],['minimal-f','韓系簡約・針織寬褲'],['chinese-f','中式日常・斜襟長裙'],['street-f','歐美休閒・印花Ｔ牛仔褲'],['musician-f','音樂人・藍綠短外套']],
  hat: [['none','不戴帽子'],['cap','棒球帽'],['beanie','毛帽'],['beret','貝雷帽'],['bucket','漁夫帽']],
  glasses: [['none','不戴眼鏡'],['thin','細框眼鏡'],['round','圓框眼鏡'],['classic-sun','經典墨鏡'],['round-sun','圓框墨鏡']],
  instrument: [['sticks','鼓棒'],['violin','小提琴'],['modular','小型模組合成器'],['macbook','MacBook 電腦'],['guitar','吉他'],['keyboard','小型鍵盤'],['sax','薩克斯風'],['mic','麥克風'],['score','樂譜'],['none','空手']],
};
export const DEFAULT_CHARACTER = Object.freeze({ version:1, artSet:'walk-v14', nickname:'', sex:'male', template:'boy', skin:'porcelain', body:'regular', hair:'crop', hairColor:'espresso', expression:'smile', outfit:'casual-m', hat:'none', glasses:'none', instrument:'none' });
const segmenter = new Intl.Segmenter('zh-Hant', { granularity:'grapheme' });
export const graphemes = text => Array.from(segmenter.segment(String(text)), item => item.segment);
export function validateNickname(value) {
  const nickname = String(value ?? '').trim().normalize('NFC');
  if (!nickname) return {nickname, error:'請輸入暱稱。'};
  if (graphemes(nickname).length > 12) return {nickname, error:'暱稱最多十二個字。'};
  if (!/^[\p{Script=Han}\p{Script=Latin}\p{M}\p{N} ]+$/u.test(nickname)) return {nickname, error:'請使用中文、英文或數字。'};
  return {nickname, error:''};
}
export function normalizeCharacter(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  if (isTrialCharacter(raw)) return trialCharacter(raw);
  const template=raw.template==='girl'||raw.sex==='female'?'girl':'boy';
  const instrument=OPTIONS.instrument.some(([id])=>id===raw.instrument)?raw.instrument:'none';
  const sex=sexForTemplate(template),outfit=selectableOutfit(raw.outfit,sex);
  return walkPreset(template,typeof raw.nickname==='string'?raw.nickname:'',instrument,outfit?.id);
}
export function loadCharacter(storage) {
  try {
    const raw = JSON.parse(storage.getItem(CHARACTER_KEY));
    if (!raw?.created) return null;
    const character = normalizeCharacter(raw);
    const checked = validateNickname(character.nickname);
    if(checked.error)return null;
    const result={...character,nickname:checked.nickname};
    const sex=sexForTemplate(result.template),invalidOutfit=raw.outfit!==undefined&&!selectableOutfit(raw.outfit,sex);
    const invalidInstrument=raw.instrument!==undefined&&!OPTIONS.instrument.some(([id])=>id===raw.instrument);
    if(invalidOutfit||invalidInstrument)Object.defineProperty(result,'loadNotice',{value:'原角色包含未開放或不相容的造型，已改用這個性別的預設服裝；遊戲進度未受影響。',enumerable:false});
    return result;
  } catch { return null; }
}
export function saveCharacter(storage, character) {
  const clean = normalizeCharacter(character), checked = validateNickname(clean.nickname);
  if (checked.error) throw new Error(checked.error);
  clean.nickname = checked.nickname;
  const serialized = JSON.stringify({...clean, created:true});
  backupBeforeWrite(storage,CHARACTER_KEY,serialized);
  storage.setItem(CHARACTER_KEY, serialized);
  return clean;
}
export function randomizeAppearance(character, random = Math.random) {
  const next = {...character};
  if (isTrialCharacter(character)) {
    for (const [key, values] of Object.entries(TRIAL_OPTIONS)) next[key] = values[Math.floor(random()*values.length)][0];
    return trialCharacter(next);
  }
  for (const [key, values] of Object.entries(OPTIONS)) next[key] = values[Math.floor(random()*values.length)][0];
  next.body=character.body;
  return next;
}
export function instrumentVisible(state) { return !state.gameProgress.heldFragmentId && !state.door04.heldVoiceId; }

// Read without normalizing away old IDs; confirmation never writes to storage.
export function readCharacterForConfirmation(storage) {
 try {const raw=JSON.parse(storage.getItem(CHARACTER_KEY));return raw?.created&&typeof raw==='object'?raw:null;}catch{return null;}
}
export function fixedCharacterDraft(raw={}) {
 const template=raw?.template==='girl'||raw?.sex==='female'?'girl':'boy',sex=sexForTemplate(template);
 return walkPreset(template,typeof raw?.nickname==='string'?raw.nickname:'',raw?.instrument,selectableOutfit(raw?.outfit,sex)?.id);
}
