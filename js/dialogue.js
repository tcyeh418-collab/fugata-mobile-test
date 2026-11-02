import { isGameplayNarration } from './feedback-policy.js';

export const INTRO_DIALOGUE = [
  { speaker: "Miss DJ Bear Beat", text: "{nickname}，你聽見了嗎？\n同一段旋律，\n正從不同方向靠近。" },
  { speaker: "Leroy", text: "像每個人走著不同的路，\n最後卻踩進\n同一個呼吸裡。" },
  { speaker: "Miss DJ Bear Beat", text: "這就是 Fugata。\n別急著找出口——\n先聽它怎麼長出來。" },
  { speaker: "系統", text: "聆聽。追尋。重新組建。" },
  { speaker: "Leroy", text: "五段旋律，\n但只有一段會像種子一樣，\n一路長回整首曲子裡。" },
  { speaker: "Miss DJ Bear Beat", text: "別先追著音色跑。\n記住旋律的輪廓——\n它會在別的聲部留下影子。" },
  { speaker: "Leroy", text: "所以不是找最華麗的，\n是找那個最難忘的。" },
  { speaker: "Miss DJ Bear Beat", text: "正確。找到它，\n我們才知道這首曲子\n是從哪裡開始思考的。" },
];

export const WRONG_HINTS = {
  1: [
    { speaker: "Miss DJ Bear Beat", text: "很醒目的聲音，\n不一定就是樂句主題。\n再聽一次它的音高走向。" },
  ],
  2: [
    { speaker: "Leroy", text: "先把音色放到旁邊。\n哪一段最容易讓你\n用嘴巴哼回來？" },
  ],
  3: [
    { speaker: "Miss DJ Bear Beat", text: "回想整首曲子的開頭。\n找那段最早被種下，\n後來又被其他聲部模仿的旋律。" },
  ],
};

export const COMPLETION_DIALOGUE = [
  { speaker: "Miss DJ Bear Beat", text: "抓到了。\n它不是一段裝飾，\n而是整首曲子的名字牌。" },
  { speaker: "Leroy", text: "樂句主題。\n它每次回來，\n故事就像重新認出自己。" },
  { speaker: "系統", text: "樂句主題已確認" },
];

export const DOOR02_INTRO = [
  { speaker: "Leroy", text: "樂句主題才剛說完，\n另一個聲音\n好像立刻接了話。" },
  { speaker: "Miss DJ Bear Beat", text: "那不是錄音重播。\n是另一個聲部站在自己的位置，\n用同一個輪廓回答。" },
  { speaker: "Leroy", text: "像我打一個節奏，\n遠處有人聽懂了，\n再用自己的鼓回我。" },
  { speaker: "Miss DJ Bear Beat", text: "對。先記住樂句主題，\n再去找那個\n真正聽懂它的主題答句。" },
];

export const DOOR02_WRONG_HINTS = {
  1: [
    { speaker: "Miss DJ Bear Beat", text: "這段旋律很有個性，\n但它沒有在回答樂句主題。\n主題答句不會突然換一個話題。" },
  ],
  2: [
    { speaker: "Leroy", text: "再把兩段接著聽。\n它們的方向、節奏和呼吸，\n真的像在一問一答嗎？" },
  ],
  3: [
    { speaker: "Miss DJ Bear Beat", text: "找保留樂句主題輪廓的聲部。\n起點可以不同，\n但它說的仍是同一句話。" },
  ],
};

export const DOOR02_COMPLETION = [
  { speaker: "Leroy", text: "就是它。\n不是學舌，\n是真的接住了前一句。" },
  { speaker: "Miss DJ Bear Beat", text: "樂句主題有了回應，\n音樂也從一條線，\n開始變成對話。" },
  { speaker: "系統", text: "主題答句已確認" },
];

export const DOOR03_INTRO = [
  { speaker: "Leroy", text: "這個房間看起來像是\n一群機器把內臟\n全部攤在桌上。" },
  { speaker: "Miss DJ Bear Beat", text: "很接近。\n只不過這些內臟\n是靠電壓呼吸的。" },
  { speaker: "Leroy", text: "所以這次不是找答案，\n而是把它接到活起來？" },
  { speaker: "Miss DJ Bear Beat", text: "正是。\n先別急著找心跳——\n先找到它的聲帶：振盪器。" },
];

export const DOOR03_EDUCATION = Object.freeze({
  0: Object.freeze([
    { speaker: "Miss DJ Bear Beat", text: "振盪器只會說一個字，\n而且可以一直把它\n拖到永遠。" },
    { speaker: "Leroy", text: "現在是一條不會換音高，\n也不懂得停下來的\n鋸齒波。" },
    { speaker: "Miss DJ Bear Beat", text: "很好。\n至少它已經有聲音了。\n接下來教它唱哪個音。" },
  ]),
  1: Object.freeze([
    { speaker: "Leroy", text: "音序器自己沒有聲音，\n卻像一張會移動的樂譜。" },
    { speaker: "Miss DJ Bear Beat", text: "音高控制電壓會告訴振盪器：\n下一個音在這裡，\n再下一個音往那裡。" },
    { speaker: "系統", text: "音序器「音高控制輸出」\n→ 振盪器「音高輸入」" },
  ]),
  2: Object.freeze([
    { speaker: "Leroy", text: "音高開始走了，\n但這聲音還有點\n像沒削過的木頭。" },
    { speaker: "Miss DJ Bear Beat", text: "交給濾波器。\n它不改你演奏哪個音，\n只雕刻聲音的明暗與質地。" },
    { speaker: "Miss DJ Bear Beat", text: "這裡使用高通濾波。\n低頻讓開一點，\n高頻就會亮起來。" },
    { speaker: "系統", text: "振盪器「音訊輸出」\n→ 濾波器「音訊輸入」" },
  ]),
  3: Object.freeze([
    { speaker: "Leroy", text: "現在聲音站得很清楚，\n但房間好像\n還沒有回應它。" },
    { speaker: "Miss DJ Bear Beat", text: "讓延遲效果留下一點回聲。\n效果比例大約 30%——\n有空間，但不把原聲淹沒。" },
    { speaker: "系統", text: "濾波器「音訊輸出」\n→ 效果器「音訊輸入」" },
  ]),
  4: Object.freeze([
    { speaker: "Leroy", text: "音高、音色、空間都有了。\n可它還是一直響，\n完全不需要呼吸。" },
    { speaker: "Miss DJ Bear Beat", text: "先把聲音送進電壓控制放大器。\n它像一道門，\n但現在還沒有人控制開關。" },
    { speaker: "系統", text: "效果器「音訊輸出」\n→ 電壓控制放大器「音訊輸入」" },
  ]),
  5: Object.freeze([
    { speaker: "Leroy", text: "所以觸發訊號不是聲音，\n比較像鼓手舉手示意：\n現在，開始。" },
    { speaker: "Miss DJ Bear Beat", text: "正確。觸發訊號會喚醒包絡產生器。\n起音、衰減、延音、釋放，\n會決定這口氣怎麼走完。" },
    { speaker: "Miss DJ Bear Beat", text: "你現在聽到的是\n包絡產生器的動作示範，\n還不是完整的合成器接線。" },
    { speaker: "系統", text: "音序器「觸發訊號輸出」\n→ 包絡產生器「觸發輸入」" },
  ]),
  6: Object.freeze([
    { speaker: "Leroy", text: "包絡產生器已經知道\n什麼時候吸氣，\n也知道怎麼吐氣了。" },
    { speaker: "Miss DJ Bear Beat", text: "把這條曲線送給電壓控制放大器。\n讓聲音不只是出現，\n而是有形狀地活著。" },
    { speaker: "系統", text: "包絡產生器「控制電壓輸出」\n→ 電壓控制放大器「音量控制輸入」" },
  ]),
});

export const DOOR03_COMPLETION = [
  { speaker: "Miss DJ Bear Beat", text: "合成器接線完成。\n音高控制電壓選擇音高，\n觸發訊號決定何時開始。" },
  { speaker: "Leroy", text: "包絡產生器給它呼吸，\n音訊則一路穿過\n濾波器、效果器和電壓控制放大器。" },
  { speaker: "Miss DJ Bear Beat", text: "你剛才不是把六條線\n插進六個孔而已。\n你組出了一個會呼吸的聲音。" },
  { speaker: "系統", text: "模組合成器接線完成" },
];

export const DOOR04_INTRO = [
  { speaker: "Leroy", text: "四個聲部就像四個人\n都想走進同一個房間。\n拜託，不要一起擠門。" },
  { speaker: "Miss DJ Bear Beat", text: "賦格很講究進場順序。\n每個聲部都要等到\n自己的那一刻才開口。" },
  { speaker: "Leroy", text: "所以先別急著排。\n把完整版本聽完，\n看看誰最早踏進來。" },
  { speaker: "Miss DJ Bear Beat", text: "然後一次多加一個聲部。\n不是背答案，\n是看見音樂怎麼被編織起來。" },
];

export function door04WrongHint(confirmedEntryCount) {
  const confirmed = Math.max(0, Math.min(3, confirmedEntryCount));
  const text = confirmed >= 3 ? '前三個位置已確認，只需比較最後加入的聲部。'
    : confirmed >= 2 ? '前兩個位置已確認，請比較第三個加入的聲部。'
    : '目前尚未確認前兩個位置，請重新比較最早加入的聲部。';
  return [{ speaker: '系統', text }];
}

export const DOOR04_REFERENCE_COMPLETION = [
  { speaker: "Leroy", text: "好，四個都到齊了。\n現在回想一下——\n最先打開門的是誰？" },
];

export const DOOR04_STAGE_COMPLETION = Object.freeze({
  pair: Object.freeze([
    { speaker: "Leroy", text: "前兩個腳步對上了。\n從這裡開始，\n音樂已經不是獨白。" },
    { speaker: "系統", text: "前兩個聲部已確認" },
  ]),
  trio: Object.freeze([
    { speaker: "Leroy", text: "第三條線也進來了。\n你開始聽得見\n旋律彼此讓路的方式。" },
    { speaker: "系統", text: "第三個聲部已確認" },
  ]),
});

export const DOOR04_COMPLETION = [
  { speaker: "Miss DJ Bear Beat", text: "四個聲部，\n各自保留自己的方向，\n卻共享同一個結構。" },
  { speaker: "Leroy", text: "像四個人同時說話，\n但你終於聽得懂\n每一個人何時開口。" },
  { speaker: "系統", text: "四聲部編織完成" },
];

export const DOOR05_INTRO = [
  { speaker: "Leroy", text: "九個拍點，\n可不是九個一樣重的腳印。" },
  { speaker: "Miss DJ Bear Beat", text: "重音會讓電流轉彎。\n位置一換，\n整段律動就往別處傾斜。" },
  { speaker: "Leroy", text: "每一輪找三個支點。\n你不必把節奏敲得完美，\n只要聽出它把重量放在哪裡。" },
  { speaker: "Miss DJ Bear Beat", text: "基礎、推進、衝刺。\n同樣是九拍，\n三種不同的前進方式。" },
];

export const DOOR05_WRONG_HINTS = {
  1: [
    { speaker: "Leroy", text: "還沒踩到律動的骨架。\n別追每一個聲音，\n聽哪幾步真的改變了重心。" },
  ],
  2: [
    { speaker: "Leroy", text: "一個支點站穩了。\n保留它，\n再找另外兩次重心轉移。" },
  ],
  3: [
    { speaker: "Miss DJ Bear Beat", text: "兩個訊號已鎖定。\n現在只差那一下，\n讓整個循環回到起點。" },
  ],
};

export const DOOR05_PHASE_COMPLETION = Object.freeze({
  foundation: Object.freeze([
    { speaker: "Leroy", text: "這是骨架。\n沒有它，\n後面的力量都站不住。" },
    { speaker: "系統", text: "基礎重音已確認" },
  ]),
  drive: Object.freeze([
    { speaker: "Miss DJ Bear Beat", text: "現在律動開始向前傾。\n它不只是循環，\n它有了推進的方向。" },
    { speaker: "系統", text: "推進重音已確認" },
  ]),
  sprint: Object.freeze([
    { speaker: "Leroy", text: "就是這個重心。\n沒有加快拍子，\n音樂卻開始奔跑了。" },
    { speaker: "系統", text: "衝刺重音已確認" },
  ]),
});

export const DOOR05_COMPLETION = [
  { speaker: "Leroy", text: "三種律動，\n九個拍點，\n每一輪都有不同的步伐。" },
  { speaker: "Miss DJ Bear Beat", text: "節奏不只是時間的格子。\n重音會替時間\n決定前進的方向。" },
  { speaker: "系統", text: "節奏驅動完成" },
];

export const DOOR06_INTRO = [
  { speaker: "Miss DJ Bear Beat", text: "樂句主題、主題答句、合成器接線、\n聲部與節奏。\n沿路找到的訊號都在這裡。" },
  { speaker: "Leroy", text: "像把散落一路的脈搏，\n一個一個\n送回同一顆心臟。" },
  { speaker: "Miss DJ Bear Beat", text: "依序喚醒五個繼電器。\n每一段都要完整聽完，\n核心才會記得它。" },
];

export const DOOR06_WRONG_HINTS = {
  1: [
    { speaker: "Miss DJ Bear Beat", text: "熟悉的音色可能會騙你。\n別追聲音的外表，\n回想旋律本身的形狀。" },
  ],
  2: [
    { speaker: "Leroy", text: "再聽一次結尾。\n當其他聲部慢慢讓開，\n是哪段旋律留在原地？" },
  ],
  3: [
    { speaker: "Miss DJ Bear Beat", text: "回到旅程開始的地方。\n第一道門找到的樂句主題，\n從來沒有真正消失。" },
  ],
};

export const DOOR06_COMPLETION = [
  { speaker: "Leroy", text: "就是它。\n繞了這麼遠，\n最初的樂句主題還是回來了。" },
  { speaker: "Miss DJ Bear Beat", text: "但它已經不再只是開頭。\n它帶著主題答句、合成器接線、\n聲部和節奏一起回來。" },
  { speaker: "系統", text: "最初的樂句主題已經回歸" },
  { speaker: "系統", text: "《Fugata》重構完成" },
];

export const DOOR06_STAGE_TRANSITION = [
  { speaker: "Miss DJ Bear Beat", text: "五條訊號都回來了。\n核心記得旋律、聲音、\n聲部與節奏。" },
  { speaker: "Leroy", text: "可是它還少了最後一件事：\n這趟旅程結束時，\n是誰回到了我們面前？" },
  { speaker: "Miss DJ Bear Beat", text: "完整聆聽最終參考段落。\n當複雜的聲部逐漸退去，\n注意最後浮現的旋律。" },
];

export function startDialogue(state, sequenceId, entries) {
  // Gameplay explanations remain available in help, without stopping play.
  if (isGameplayNarration(sequenceId)) {
    state.ui.learningNote = { room: state.gameProgress.currentRoom, sequenceId, entries: entries.map(entry => ({ ...entry })) };
    return false;
  }
  state.dialogue.active = true;
  state.dialogue.sequenceId = sequenceId;
  state.dialogue.entries = entries.map((entry) => ({ ...entry }));
  state.dialogue.index = 0;
  return true;
}

export function advanceDialogue(state) {
  if (!state.dialogue.active) return null;
  if (state.dialogue.index < state.dialogue.entries.length - 1) {
    state.dialogue.index += 1;
    return null;
  }
  const completedSequence = state.dialogue.sequenceId;
  state.dialogue.active = false;
  state.dialogue.sequenceId = null;
  state.dialogue.entries = [];
  state.dialogue.index = 0;
  if (
    completedSequence === "intro"
    || completedSequence === "door02-intro"
    || completedSequence === "door03-intro"
    || completedSequence === "door04-intro"
    || completedSequence === "door05-intro"
    || completedSequence === "door06-intro"
  ) {
    state.ui.controlsHintRemaining = 3.2;
  }
  return completedSequence;
}

export function currentDialogueEntry(state) {
  const entry = state.dialogue.active ? state.dialogue.entries[state.dialogue.index] ?? null : null;
  if (!entry) return null;
  // Compatibility only: old saves can contain dialogue authored under the former name.
  // Normalize story copy before nickname substitution; player-chosen names are preserved.
  const stageName = text => text.replaceAll("品心", "Miss DJ Bear Beat");
  return {...entry, text: stageName(entry.text).replaceAll("{nickname}", state.character?.nickname || "朋友"),
    speaker: entry.speaker === "玩家" ? state.character?.nickname || "玩家" : stageName(entry.speaker)};
}
