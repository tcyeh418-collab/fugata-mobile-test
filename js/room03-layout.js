export const ROOM03_ARTBOARD = Object.freeze({ width: 1536, height: 1024 });

// Room 3 is authored as one 3:2 frame. The camera, background, equipment,
// doors, characters, cable routes, and collision geometry all derive from
// this single artboard-to-world transform.
export const ROOM03_VIEWPORT = Object.freeze({
  x: 1550,
  y: 0,
  width: 960,
  height: 640,
  scale: 0.625,
  offsetX: 1550,
  offsetY: 0,
  aspectRatio: 3 / 2,
});

export function room03SourceToWorld(x, y) {
  return Object.freeze({
    x: ROOM03_VIEWPORT.offsetX + x * ROOM03_VIEWPORT.scale,
    y: ROOM03_VIEWPORT.offsetY + y * ROOM03_VIEWPORT.scale,
  });
}

export function room03SourceLength(value) {
  return value * ROOM03_VIEWPORT.scale;
}

function sourcePoint(x, y) {
  return Object.freeze({ sourceX: x, sourceY: y, ...room03SourceToWorld(x, y) });
}

function sourceRect(x, y, width, height) {
  const point = room03SourceToWorld(x, y);
  return Object.freeze({
    sourceX: x,
    sourceY: y,
    sourceWidth: width,
    sourceHeight: height,
    x: point.x,
    y: point.y,
    width: room03SourceLength(width),
    height: room03SourceLength(height),
  });
}

function sourceRoute(points) {
  return Object.freeze(points.map(([x, y]) => sourcePoint(x, y)));
}

export const ROOM03_PLACEMENTS = Object.freeze({
  modules: Object.freeze({
    "oscillator-vco": sourcePoint(736, 800),
    sequencer: sourcePoint(296, 768),
    "filter-vcf": sourcePoint(280, 320),
    effect: sourcePoint(1144, 752),
    "envelope-adsr": sourcePoint(712, 296),
    "amp-vca": sourcePoint(1136, 336),
  }),
  patchMonitor: sourcePoint(720, 528),
  speaker: sourcePoint(1328, 528),
});

export const ROOM03_DEVICE_GEOMETRY = Object.freeze({
  module: Object.freeze({
    width: room03SourceLength(211.2),
    height: room03SourceLength(150.4),
    interactionRadius: room03SourceLength(121.6),
    portOffsetX: room03SourceLength(112),
    portSpacingY: room03SourceLength(51.2),
    portInteractionRadius: room03SourceLength(70.4),
  }),
  patchMonitor: Object.freeze({
    width: room03SourceLength(246.4),
    height: room03SourceLength(131.2),
    interactionRadius: room03SourceLength(118.4),
  }),
  sprites: Object.freeze({
    module: Object.freeze({ width: room03SourceLength(284.8), height: room03SourceLength(211.2) }),
    monitor: Object.freeze({ width: room03SourceLength(304), height: room03SourceLength(220.8) }),
    speaker: Object.freeze({ width: room03SourceLength(150.4), height: room03SourceLength(198.4) }),
    character: Object.freeze({ width: room03SourceLength(108.8), height: room03SourceLength(163.2) }),
  }),
});

export const ROOM03_OVERLAY_LAYOUT = Object.freeze({
  moduleLabelOffsetY: room03SourceLength(105.6),
  portLabelOffsetY: room03SourceLength(36.8),
  speakerLabelOffsetY: room03SourceLength(115.2),
  characterSpriteLift: room03SourceLength(164.8),
  characterLabelLift: room03SourceLength(174.4),
  legend: sourcePoint(160, 888),
});

export const ROOM03_CABLE_WAYPOINTS = Object.freeze({
  "sequencer-pitch-to-vco": sourceRoute([[508.8, 841.6]]),
  "vco-audio-to-filter": sourceRoute([[704, 704], [496, 547.2], [296, 438.4]]),
  "filter-audio-to-effect": sourceRoute([[528, 396.8], [732.8, 508.8], [918.4, 649.6]]),
  "effect-audio-to-vca": sourceRoute([[1232, 662.4], [1251.2, 521.6], [1171.2, 432]]),
  "sequencer-gate-to-envelope": sourceRoute([[428.8, 668.8], [518.4, 528], [600, 416]]),
  "envelope-cv-to-vca": sourceRoute([[915.2, 304]]),
  "fixed-speaker-output": sourceRoute([[1283.2, 403.2], [1308.8, 470.4]]),
});

function characterPair(leroy, pinxin) {
  return Object.freeze({
    leroy: sourcePoint(...leroy),
    pinxin: sourcePoint(...pinxin),
  });
}

export const ROOM03_CHARACTER_INITIAL = characterPair([512, 656], [944, 656]);

export const ROOM03_CHARACTER_SPOTS = Object.freeze({
  0: characterPair([472, 624], [984, 640]),
  1: characterPair([156.8, 872], [928, 904]),
  2: characterPair([928, 904], [456, 488]),
  3: characterPair([456, 488], [1008, 904]),
  4: characterPair([1008, 904], [984, 544]),
  5: characterPair([156.8, 872], [856, 488]),
  6: characterPair([856, 488], [984, 544]),
  complete: characterPair([504, 672], [1144, 656]),
});

const doorwayMinSourceY = 432;
const doorwayMaxSourceY = 624;
const leftDoorTarget = sourcePoint(80, 512);
const rightDoorTarget = sourcePoint(1456, 512);
const rightWallSourceX = 1436.8;
const exitCorridorSourceWidth = 179.2;

export const ROOM03_GATE_LAYOUT = Object.freeze({
  pixelWidth: 887,
  pixelHeight: 1774,
  seamPixelX: 497,
  // Both dedicated side-gate PNGs share one canvas, pivot, and baseline.
  // Their height is authored as 360 Room 3 artboard units, preserving the
  // generated sprite aspect ratio instead of compressing a frontal doorway.
  scale: room03SourceLength(360) / 1774,
  frameY: room03SourceToWorld(0, 280).y,
  frameWidth: (room03SourceLength(360) / 1774) * 887,
  frameHeight: room03SourceLength(360),
  entranceTarget: leftDoorTarget,
  exitTarget: rightDoorTarget,
});

export function room03GateDestination(side) {
  const target = side === "entrance"
    ? ROOM03_GATE_LAYOUT.entranceTarget
    : ROOM03_GATE_LAYOUT.exitTarget;
  if (!target) return null;
  const displayAnchor = side === "entrance"
    ? ROOM03_GATE_LAYOUT.pixelWidth - ROOM03_GATE_LAYOUT.seamPixelX
    : ROOM03_GATE_LAYOUT.seamPixelX;
  return Object.freeze({
    x: target.x - displayAnchor * ROOM03_GATE_LAYOUT.scale,
    y: ROOM03_GATE_LAYOUT.frameY,
    width: ROOM03_GATE_LAYOUT.frameWidth,
    height: ROOM03_GATE_LAYOUT.frameHeight,
  });
}

export const ROOM03_DOORWAY = Object.freeze({
  entrance: Object.freeze({
    anchor: leftDoorTarget,
    opening: sourceRect(51.2, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    arrival: sourcePoint(152, 512),
  }),
  exit: Object.freeze({
    anchor: rightDoorTarget,
    opening: sourceRect(rightWallSourceX, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    collider: sourceRect(rightWallSourceX, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    focus: sourcePoint(rightWallSourceX, 528),
    interactionZone: sourceRect(1344, 396.8, 108.8, 262.4),
    trigger: Object.freeze({
      ...sourcePoint(1512, 512),
      minY: room03SourceToWorld(0, doorwayMinSourceY).y,
      maxY: room03SourceToWorld(0, doorwayMaxSourceY).y,
    }),
  }),
});

export const ROOM03_WALKABLE = Object.freeze({
  room: sourceRect(80, 64, rightWallSourceX - 80, 896),
  corridor: sourceRect(rightWallSourceX, doorwayMinSourceY, exitCorridorSourceWidth, doorwayMaxSourceY - doorwayMinSourceY),
});

export const ROOM03_WALKABLE_WALLS = Object.freeze([
  Object.freeze({ id: "room3-top", ...sourceRect(80, 64, rightWallSourceX - 80, 28.8) }),
  Object.freeze({ id: "room3-bottom", ...sourceRect(80, 931.2, rightWallSourceX - 80, 28.8) }),
  Object.freeze({ id: "room3-left-top", ...sourceRect(51.2, 64, 28.8, doorwayMinSourceY - 64) }),
  Object.freeze({ id: "room3-left-bottom", ...sourceRect(51.2, doorwayMaxSourceY, 28.8, 336) }),
  Object.freeze({ id: "room3-right-top", ...sourceRect(rightWallSourceX, 64, 28.8, doorwayMinSourceY - 64) }),
  Object.freeze({ id: "room3-right-bottom", ...sourceRect(rightWallSourceX, doorwayMaxSourceY, 28.8, 336) }),
  Object.freeze({ id: "corridor03-top", ...sourceRect(rightWallSourceX, 403.2, exitCorridorSourceWidth, 28.8) }),
  Object.freeze({ id: "corridor03-bottom", ...sourceRect(rightWallSourceX, doorwayMaxSourceY, exitCorridorSourceWidth, 28.8) }),
]);

// These remain live collision records but are never visible greybox geometry
// while the Room 3 artboard is the active view.
export const ROOM03_PROCEDURAL_WALL_IDS = Object.freeze(
  ROOM03_WALKABLE_WALLS.map(({ id }) => id),
);
