export function roomProgressView(state) {
  const room = state.gameProgress.currentRoom;
  if (state.phase !== "game" || ![4, 6].includes(room)) return { visible: false };
  if (room === 4) return door04View(state);
  return door06View(state);
}

export function createRoomProgressController(root) {
  const eyebrow = root?.querySelector("[data-progress-eyebrow]");
  const title = root?.querySelector("[data-progress-title]");
  const copy = root?.querySelector("[data-progress-copy]");
  const steps = root?.querySelector("[data-progress-steps]");
  function render(state) {
    if (!root) return;
    const view = roomProgressView(state);
    root.hidden = !view.visible;
    if (!view.visible) return;
    eyebrow.textContent = view.eyebrow;
    title.textContent = view.title;
    copy.textContent = view.copy;
    steps.replaceChildren(...view.steps.filter((step) => step.state === "active").map((step) => {
      const item = document.createElement("li");
      item.dataset.state = step.state;
      item.textContent = step.label;
      return item;
    }));
  }
  return { render };
}

export function createRoomTransitionController(root) {
  const eyebrow = root?.querySelector("[data-transition-eyebrow]");
  const title = root?.querySelector("[data-transition-title]");
  function render(state) {
    if (!root) return;
    const transition = state.roomTransition;
    root.hidden = !transition.active;
    root.style.opacity = String(transition.opacity);
    root.dataset.phase = transition.phase;
    eyebrow.textContent = transition.roomChanged
      ? `${roomCopy(transition.toRoom).ordinal}／06`
      : "";
    title.textContent = transition.roomChanged ? transition.title ?? "" : "";
  }
  return { render };
}

function door04View(state) {
  const door = state.door04;
  const stageIndex = ({ reference: 0, pair: 1, trio: 2, quartet: 3, complete: 4 })[door.stage] ?? 0;
  const labels = [
    "1. 完整聆聽聲部參考混音",
    "2. 確認前兩個聲部｜位置 1–2",
    "3. 加入第三個聲部｜位置 3",
    "4. 完成四聲部編織｜位置 4",
  ];
  const copy = door.stage === "reference"
    ? "按 E 播放聲部參考混音；可邊聽邊排列；完整聽完才可測試答案。"
    : door.completed
      ? "四個聲部已確認。"
      : `已確認 ${door.confirmedEntryCount}／4 個位置；鎖定項目不會再被更改。`;
  return {
    visible: true,
    eyebrow: "Room 4／聲部的編織",
    title: door.stage === "reference"
      ? "聆聽聲部參考混音"
      : ({ pair: "確認前兩個聲部", trio: "加入第三個聲部", quartet: "完成四聲部編織", complete: "四聲部編織完成" })[door.stage],
    copy,
    steps: labels.map((label, index) => ({
      label,
      state: index < stageIndex ? "complete" : index === stageIndex ? "active" : "locked",
    })),
  };
}

function door06View(state) {
  const door = state.door06;
  const stageIndex = door.stage === "relays" || door.stage === "relay-transition"
    ? 0 : door.stage === "final-reference" ? 1 : 2;
  const nextRelay = ["樂句主題", "主題答句", "合成器接線", "聲部", "節奏"][door.activeRelayIndex];
  return {
    visible: true,
    eyebrow: "Room 6／樂句的回歸",
    title: ["回復五條訊號", "最終參考段落", "辨認回歸的樂句主題"][stageIndex],
    copy: stageIndex === 0
      ? `${door.activatedRelayCount}／5 已完成${nextRelay ? ` · 下一個：${nextRelay}` : ""}`
      : stageIndex === 1
        ? "完整播放最終參考段落，等待自然結束。"
        : door.completed ? "你確認的記憶與最終參考相符。核心重構完成，請走向右側出口。" : "按 E 試聽記憶片段，按 Enter 選取、Space 確認回歸的樂句主題。",
    steps: [
      { label: "1. 樂句主題 → 主題答句 → 合成器接線 → 聲部 → 節奏", state: stageIndex > 0 ? "complete" : "active" },
      { label: "2. 完整聆聽最終參考段落", state: stageIndex > 1 ? "complete" : stageIndex === 1 ? "active" : "locked" },
      { label: "3. 比較並提交回歸的樂句主題", state: door.completed ? "complete" : stageIndex === 2 ? "active" : "locked" },
    ],
  };
}
import { roomCopy } from "./room-copy.js";
