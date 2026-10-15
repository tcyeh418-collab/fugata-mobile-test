// Opt-in, fixed-body art review. Existing v1 characters are never migrated implicitly.
export const TRIAL_ART_SET = 'fixed-v2';
export const isTrialCharacter = c => ['fixed-v2','fixed-v4'].includes(c?.artSet);
export const TRIAL_OPTIONS = {
 template:[['boy','男生'],['girl','女生']],
 skin:[['porcelain','淺膚','#f0c49f'],['umber','深膚','#9d6844']],
 expression:[['smile','自然微笑'],['wink','眨眼']],
 instrument:[['none','空手'],['sticks','鼓棒'],['keyboard','側抱 mini keyboard'],['score','樂譜・封面朝外']],
};
export function trialCharacter(raw={}) {
 const template=raw.template==='girl'?'girl':'boy';
 return {version:1,artSet:raw.artSet==='fixed-v4'?'fixed-v4':TRIAL_ART_SET,nickname:typeof raw.nickname==='string'?raw.nickname:'',template,body:'regular',hair:template==='girl'?'trial-wavy':'trial-short',hairColor:'espresso',outfit:template==='girl'?'musician-f':'casual-m',hat:'none',glasses:'none',expression:raw.expression==='wink'?'wink':'smile',skin:raw.skin==='umber'?'umber':'porcelain',instrument:['none','sticks','keyboard','score'].includes(raw.instrument)?raw.instrument:'none'};
}
export function trialOptions(key,c){
 if(TRIAL_OPTIONS[key])return TRIAL_OPTIONS[key];
 if(key==='hair')return [[c.template==='girl'?'trial-wavy':'trial-short',c.template==='girl'?'黑色瀏海及肩波浪髮':'黑色自然短髮']];
 if(key==='outfit')return [[c.template==='girl'?'musician-f':'casual-m',c.template==='girl'?'藍綠外套・黑色內搭與長褲':'藍色襯衫外套・淺色內搭與工作褲']];
 return [];
}
