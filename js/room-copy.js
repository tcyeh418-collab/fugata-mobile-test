export const ROOM_COPY = Object.freeze({
  1: Object.freeze({
    ordinal: "第一室",
    action: "找到旋律的種子",
    concept: "樂句的主題",
    full: "第一室｜找到旋律的種子｜樂句的主題",
  }),
  2: Object.freeze({
    ordinal: "第二室",
    action: "聽見另一個聲部接話",
    concept: "主題的回應",
    full: "第二室｜聽見另一個聲部接話｜主題的回應",
  }),
  3: Object.freeze({
    ordinal: "第三室",
    action: "讓聲音活起來",
    concept: "組建模組合成器",
    full: "第三室｜讓聲音活起來｜組建模組合成器",
  }),
  4: Object.freeze({
    ordinal: "第四室",
    action: "讓四個聲部交織",
    concept: "聲部的編織",
    full: "第四室｜讓四個聲部交織｜聲部的編織",
  }),
  5: Object.freeze({
    ordinal: "第五室",
    action: "讓九拍向前奔跑",
    concept: "節奏驅動！",
    full: "第五室｜讓九拍向前奔跑｜節奏驅動！",
  }),
  6: Object.freeze({
    ordinal: "第六室",
    action: "讓最初的旋律回來",
    concept: "樂句的回歸",
    full: "第六室｜讓最初的旋律回來｜樂句的回歸",
  }),
});

export function roomCopy(roomNumber) {
  return ROOM_COPY[roomNumber] ?? ROOM_COPY[1];
}

export function roomTransitionTitle(roomNumber) {
  const room = roomCopy(roomNumber);
  return `${room.action}\n${room.concept}`;
}
