import {
  ROOM03_DEVICE_GEOMETRY,
  ROOM03_PLACEMENTS,
} from "./room03-layout.js?v=room03-side-gate-v1";

export const DOOR03_SIGNAL_TYPES = Object.freeze({
  audio: Object.freeze({ id: "audio", label: "音訊訊號", color: "#f59b45" }),
  "pitch-cv": Object.freeze({ id: "pitch-cv", label: "音高控制電壓", color: "#66a8ff" }),
  gate: Object.freeze({ id: "gate", label: "觸發訊號", color: "#f2d05c" }),
  "envelope-cv": Object.freeze({ id: "envelope-cv", label: "包絡控制電壓", color: "#b77cff" }),
});

export const VALID_DOOR03_EDGES = Object.freeze([
  Object.freeze({
    id: "sequencer-pitch-to-vco",
    fromPortId: "sequencer-pitch-cv-out",
    toPortId: "vco-1v-oct-in",
    outputPortId: "sequencer-pitch-cv-out",
    inputPortId: "vco-1v-oct-in",
    signalType: "pitch-cv",
  }),
  Object.freeze({
    id: "vco-audio-to-filter",
    fromPortId: "vco-audio-out",
    toPortId: "filter-audio-in",
    outputPortId: "vco-audio-out",
    inputPortId: "filter-audio-in",
    signalType: "audio",
  }),
  Object.freeze({
    id: "filter-audio-to-effect",
    fromPortId: "filter-audio-out",
    toPortId: "effect-audio-in",
    outputPortId: "filter-audio-out",
    inputPortId: "effect-audio-in",
    signalType: "audio",
  }),
  Object.freeze({
    id: "effect-audio-to-vca",
    fromPortId: "effect-audio-out",
    toPortId: "vca-audio-in",
    outputPortId: "effect-audio-out",
    inputPortId: "vca-audio-in",
    signalType: "audio",
  }),
  Object.freeze({
    id: "sequencer-gate-to-envelope",
    fromPortId: "sequencer-gate-out",
    toPortId: "envelope-gate-in",
    outputPortId: "sequencer-gate-out",
    inputPortId: "envelope-gate-in",
    signalType: "gate",
  }),
  Object.freeze({
    id: "envelope-cv-to-vca",
    fromPortId: "envelope-cv-out",
    toPortId: "vca-cv-in",
    outputPortId: "envelope-cv-out",
    inputPortId: "vca-cv-in",
    signalType: "envelope-cv",
  }),
]);

export function isDoor03StaticGuideEdge(edge) {
  return edge.signalType !== "envelope-cv";
}

export const DOOR03_STAGE_AUDIO = Object.freeze({
  1: "door03Stage01OscillatorRaw",
  2: "door03Stage02PitchSequence",
  3: "door03Stage03Filtered",
  4: "door03Stage04Effected",
  5: "door03Stage05EnvelopeDemo",
  6: "door03Stage06CompletePatch",
});

export const DOOR03_FIXED_LAYOUT = Object.freeze(
  Object.fromEntries(
    Object.entries(ROOM03_PLACEMENTS.modules).map(([id, point]) => [
      id,
      Object.freeze({ x: point.x, y: point.y }),
    ]),
  ),
);

export const DOOR03_PATCH_MONITOR = Object.freeze({
  id: "door03-patch-monitor",
  displayName: "接線監聽器",
  x: ROOM03_PLACEMENTS.patchMonitor.x,
  y: ROOM03_PLACEMENTS.patchMonitor.y,
  width: ROOM03_DEVICE_GEOMETRY.patchMonitor.width,
  height: ROOM03_DEVICE_GEOMETRY.patchMonitor.height,
  interactionRadius: ROOM03_DEVICE_GEOMETRY.patchMonitor.interactionRadius,
});

export const DOOR03_SPEAKER = Object.freeze({
  id: "door03-speaker-output",
  displayName: "揚聲器／輸出",
  x: ROOM03_PLACEMENTS.speaker.x,
  y: ROOM03_PLACEMENTS.speaker.y,
});

const MODULE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "oscillator-vco",
    displayName: "振盪器／VCO",
    shortName: "振盪器",
    description: ["產生原始鋸齒波。", "聲音由這裡開始。"],
    ports: Object.freeze([
      Object.freeze({ id: "vco-1v-oct-in", type: "input", signalType: "pitch-cv", label: "音高輸入" }),
      Object.freeze({ id: "vco-audio-out", type: "output", signalType: "audio", label: "音訊輸出" }),
    ]),
  }),
  Object.freeze({
    id: "sequencer",
    displayName: "音序器",
    shortName: "音序器",
    description: ["安排音高並送出觸發訊號。", "提供音高控制與觸發時刻。"],
    ports: Object.freeze([
      Object.freeze({ id: "sequencer-pitch-cv-out", type: "output", signalType: "pitch-cv", label: "音高控制輸出" }),
      Object.freeze({ id: "sequencer-gate-out", type: "output", signalType: "gate", label: "觸發訊號輸出" }),
    ]),
  }),
  Object.freeze({
    id: "filter-vcf",
    displayName: "濾波器／VCF",
    shortName: "濾波器",
    description: ["改變頻率內容與音色。", "這裡使用高通濾波器。"],
    ports: Object.freeze([
      Object.freeze({ id: "filter-audio-in", type: "input", signalType: "audio", label: "音訊輸入" }),
      Object.freeze({ id: "filter-audio-out", type: "output", signalType: "audio", label: "音訊輸出" }),
    ]),
  }),
  Object.freeze({
    id: "effect",
    displayName: "效果器",
    shortName: "效果器",
    description: ["為既有聲音加入延遲效果。", "增加重複與空間感。"],
    ports: Object.freeze([
      Object.freeze({ id: "effect-audio-in", type: "input", signalType: "audio", label: "音訊輸入" }),
      Object.freeze({ id: "effect-audio-out", type: "output", signalType: "audio", label: "音訊輸出" }),
    ]),
  }),
  Object.freeze({
    id: "envelope-adsr",
    displayName: "包絡產生器／ADSR",
    shortName: "包絡產生器",
    description: ["把觸發訊號轉為 ADSR 控制曲線。", "產生隨時間變化的控制曲線。"],
    ports: Object.freeze([
      Object.freeze({ id: "envelope-gate-in", type: "input", signalType: "gate", label: "觸發輸入" }),
      Object.freeze({ id: "envelope-cv-out", type: "output", signalType: "envelope-cv", label: "控制電壓輸出" }),
    ]),
  }),
  Object.freeze({
    id: "amp-vca",
    displayName: "電壓控制放大器／VCA",
    shortName: "電壓控制放大器",
    description: ["依控制電壓改變音量。", "控制聲音的開合與音量輪廓。"],
    ports: Object.freeze([
      Object.freeze({ id: "vca-audio-in", type: "input", signalType: "audio", label: "音訊輸入" }),
      Object.freeze({ id: "vca-cv-in", type: "input", signalType: "envelope-cv", label: "音量控制輸入" }),
      Object.freeze({ id: "vca-audio-out", type: "output", signalType: "audio", label: "音訊輸出", fixed: true }),
    ]),
  }),
]);

export function createDoor03Modules() {
  return MODULE_DEFINITIONS.map((definition) => {
    const slot = DOOR03_FIXED_LAYOUT[definition.id];
    const inputs = definition.ports.filter((port) => port.type === "input");
    const outputs = definition.ports.filter((port) => port.type === "output");
    const positionPorts = (ports, side) => ports.map((port, portIndex) => ({
      ...port,
      moduleId: definition.id,
      moduleName: definition.shortName,
      x: slot.x + side * ROOM03_DEVICE_GEOMETRY.module.portOffsetX,
      y: slot.y + (portIndex - (ports.length - 1) / 2) * ROOM03_DEVICE_GEOMETRY.module.portSpacingY,
      interactionRadius: ROOM03_DEVICE_GEOMETRY.module.portInteractionRadius,
    }));
    return {
      ...definition,
      description: [...definition.description],
      x: slot.x,
      y: slot.y,
      width: ROOM03_DEVICE_GEOMETRY.module.width,
      height: ROOM03_DEVICE_GEOMETRY.module.height,
      inputPorts: positionPorts(inputs, -1),
      outputPorts: positionPorts(outputs, 1),
      interactionRadius: ROOM03_DEVICE_GEOMETRY.module.interactionRadius,
      visualState: "idle",
      isActive: false,
      isInspecting: false,
      inspectionRemaining: 0,
    };
  });
}

export function allDoor03Ports(modules) {
  return modules.flatMap((module) => [...module.inputPorts, ...module.outputPorts]);
}
