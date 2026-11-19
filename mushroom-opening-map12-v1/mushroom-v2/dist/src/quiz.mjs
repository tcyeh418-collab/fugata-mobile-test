export const QUESTIONS=Object.freeze([
 {question:'請問《Logic Code》這張專輯是由誰和誰一起製作完成的？',options:['Leroy 與 Miss DJ Bear Beat','兩顆在錄音室待太久的香菇','一台失控的節拍器與一隻路過的熊'],correct:0},
 {question:'請問《Logic Code》這張專輯主要使用到哪兩種樂器？',options:['吉他與直笛','爵士鼓與 Modular Synthesizer','三角鐵與更多三角鐵'],correct:1},
 {question:'請問《Mushroom 菇》這首歌的靈感來自於什麼事情？',options:['某天高雄因連日大雨所產生路面上的野生香菇','Leroy 某天吃到了一朵很可疑的香菇','Bear Beat 不小心把 Patch Cable 插錯地方後發生的事故'],correct:0},
 {question:'請問 Bear Beat 使用的 Modular Synthesizer，中文名稱是？',options:['模組化烤麵包機','模組合成器','電壓控制型大型香菇培養設備'],correct:1},
 {question:'請問，你購買《Logic Code》實體專輯了嗎？',options:['有，而且我現在開始覺得這是一場忠誠度測驗。','還沒有……你們居然在最後一關問這個？','等等，我只是來救香菇的啊！'],correct:null},
]);
export const quizScore=answers=>answers.slice(0,4).reduce((sum,a,i)=>sum+Number(a===QUESTIONS[i].correct),0);
export function answerFeedback(index,answer){return index===4?'Accepted':answer===QUESTIONS[index].correct?'Correct':'Wrong';}

const correctReplies=[
 '沒錯！Leroy 的鼓與 Miss DJ Bear Beat 的聲音一起完成了這張專輯。',
 '答對了！爵士鼓與 Modular Synthesizer 在這裡一起對話。',
 '沒錯，就是雨後路面冒出的野生香菇，讓這首歌開始發芽。',
 '答對了！一條條接線，讓模組合成器長出不同的聲音。',
];
const acceptedReplies=['謝謝你把音樂帶回家！這題沒有分數，只有感謝。','沒關係，先把香菇救回家，再慢慢認識這張專輯！','對，你的任務還在等你！謝謝你陪香菇走到這裡。'];
export function answerDetails(index,answer){
 if(index===4)return `Accepted · ${acceptedReplies[answer]}`;
 const q=QUESTIONS[index];
 return answer===q.correct?`Correct · ${correctReplies[index]}`:`Wrong · 正確答案：${'ABC'[q.correct]}. ${q.options[q.correct]}`;
}
