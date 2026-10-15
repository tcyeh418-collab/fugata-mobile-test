import { VALID_DOOR03_EDGES } from "./door03-synth-data.js";

export const DOOR03_GUIDE_STEPS = Object.freeze([
  "先找到振盪器，聆聽原始鋸齒波。",
  "音序器「音高控制輸出」→ 振盪器「音高輸入」",
  "振盪器「音訊輸出」→ 濾波器「音訊輸入」",
  "濾波器「音訊輸出」→ 效果器「音訊輸入」",
  "效果器「音訊輸出」→ 電壓控制放大器「音訊輸入」",
  "音序器「觸發訊號輸出」→ 包絡產生器「觸發輸入」",
  "包絡產生器「控制電壓輸出」→ 電壓控制放大器「音量控制輸入」",
]);

export function door03GuideViewModel(state) {
  const visible = state.gameProgress.currentRoom === 3;
  const patchCompleted = Boolean(state.gameProgress.flags.patchCompleted);
  const oscillatorDiscovered = Boolean(state.door03.oscillatorDiscovered);
  const currentStep = oscillatorDiscovered
    ? Math.max(1, Math.min(6, state.door03.currentStep))
    : 0;
  const completedEdgeIds = new Set(state.door03.completedEdgeIds);

  return {
    visible,
    patchCompleted,
    currentStep,
    stepLabel: patchCompleted ? "接線完成" : `步驟 ${currentStep}／6`,
    stepCopy: patchCompleted
      ? "模組合成器接線完成"
      : DOOR03_GUIDE_STEPS[currentStep],
    edges: VALID_DOOR03_EDGES.map((edge, index) => ({
      id: edge.id,
      status: completedEdgeIds.has(edge.id)
        ? "completed"
        : !patchCompleted && oscillatorDiscovered && currentStep === index + 1
          ? "current"
          : "upcoming",
    })),
  };
}

export function createDoor03PatchGuide({ root, canvas }) {
  const toggle = root.querySelector("#patch-guide-toggle");
  const details = root.querySelector("#patch-guide-details");
  const stepLabel = root.querySelector("#patch-guide-step-label");
  const stepCopy = root.querySelector("#patch-guide-step-copy");
  const edgeRows = new Map(
    [...root.querySelectorAll("[data-edge-id]")].map((row) => [row.dataset.edgeId, row]),
  );
  let collapsed = true;

  function syncCollapsedState() {
    root.dataset.collapsed = String(collapsed);
    details.hidden = collapsed;
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.textContent = collapsed ? "顯示接線指引" : "隱藏接線指引";
  }

  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    syncCollapsedState();
    requestAnimationFrame(() => canvas.focus());
  });

  function render(state) {
    const model = door03GuideViewModel(state);
    root.hidden = !model.visible;
    if (!model.visible) return;

    stepLabel.textContent = model.stepLabel;
    stepCopy.textContent = model.stepCopy;
    root.dataset.complete = String(model.patchCompleted);

    for (const edge of model.edges) {
      const row = edgeRows.get(edge.id);
      if (!row) continue;
      row.dataset.status = edge.status;
      row.querySelector(".patch-guide-state").textContent =
        edge.status === "completed" ? "✓" : edge.status === "current" ? "▶" : "·";
      if (edge.status === "current") row.setAttribute("aria-current", "step");
      else row.removeAttribute("aria-current");
    }
  }

  function reset() {
    collapsed = true;
    syncCollapsedState();
  }

  syncCollapsedState();
  return { render, reset };
}
