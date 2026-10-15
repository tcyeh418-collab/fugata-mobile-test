import { ROOM03_DOORWAY } from "./room03-layout.js?v=room03-side-gate-v1";

export const ROOM02_ARTBOARD = Object.freeze({ width: 1536, height: 1024 });

// Room 2 is authored as one 3:2 frame. Every scene anchor below is measured in
// that artboard and converted through this one transform.
export const ROOM02_VIEWPORT = Object.freeze({
  x: 670,
  y: 0,
  width: 960,
  height: 640,
  scale: 0.625,
  offsetX: 670,
  offsetY: 0,
  aspectRatio: 3 / 2,
});

export function room02SourceToWorld(x, y) {
  return Object.freeze({
    x: ROOM02_VIEWPORT.offsetX + x * ROOM02_VIEWPORT.scale,
    y: ROOM02_VIEWPORT.offsetY + y * ROOM02_VIEWPORT.scale,
  });
}

function sourcePoint(x, y) {
  return Object.freeze({ sourceX: x, sourceY: y, ...room02SourceToWorld(x, y) });
}

function sourceRect(x, y, width, height) {
  const point = room02SourceToWorld(x, y);
  return Object.freeze({
    sourceX: x,
    sourceY: y,
    sourceWidth: width,
    sourceHeight: height,
    x: point.x,
    y: point.y,
    width: width * ROOM02_VIEWPORT.scale,
    height: height * ROOM02_VIEWPORT.scale,
  });
}

export const ROOM02_PLACEMENTS = Object.freeze({
  subjectTerminal: sourcePoint(294, 633),
  echoTowers: Object.freeze([
    sourcePoint(546, 447),
    sourcePoint(938, 438),
    sourcePoint(1098, 545),
    sourcePoint(1218, 679),
  ]),
});

export const ROOM02_DOORWAY = Object.freeze({
  leftThreshold: sourceRect(232, 350, 42, 242),
  rightThreshold: sourceRect(1325, 390, 176, 202),
  collider: sourceRect(1325, 390, 22, 202),
  trigger: Object.freeze({
    // Start the exit while the player is visibly inside the doorway instead
    // of waiting for them to reach the right edge of the whole artboard.
    ...sourcePoint(1345, 500),
    minX: room02SourceToWorld(1345, 0).x,
    maxX: room02SourceToWorld(1494, 0).x,
    minY: room02SourceToWorld(0, 390).y,
    maxY: room02SourceToWorld(0, 592).y,
  }),
  perspective: Object.freeze({
    approach: sourcePoint(1343, 552),
    vanishingPoint: sourcePoint(1420, 350),
    duration: 0.92,
    minScale: 0.2,
    fadeStart: 0.66,
  }),
  // The original prototype used y=320. The art-aligned point stays at x=838
  // but moves up to the visible inner threshold so the player does not spawn
  // through the Subject Terminal artwork.
  entry: sourcePoint(268.8, 368),
  room03Entry: ROOM03_DOORWAY.entrance.arrival,
});

export const ROOM02_WALKABLE_WALLS = Object.freeze([
  sourceRect(232, 278, 1269, 28),
  sourceRect(232, 842, 1269, 28),
  sourceRect(210, 278, 28, 72),
  sourceRect(210, 592, 28, 278),
  sourceRect(1501, 278, 28, 112),
  sourceRect(1501, 592, 28, 278),
]);

export const ROOM02_CABLE_ENDPOINT = sourcePoint(1320, 515);

export const ROOM02_TERMINAL_CABLE_ROUTE = Object.freeze(
  [[338, 633], [704, 586], [1037, 550], [1320, 515]]
    .map(([x, y]) => sourcePoint(x, y)),
);

export const ROOM02_CABLE_ROUTES = Object.freeze([
  Object.freeze([[546, 447], [680, 454], [850, 500], [1160, 500], [1320, 515]].map(([x, y]) => sourcePoint(x, y))),
  Object.freeze([[938, 438], [1030, 454], [1160, 478], [1320, 515]].map(([x, y]) => sourcePoint(x, y))),
  Object.freeze([[1098, 545], [1180, 550], [1265, 532], [1320, 515]].map(([x, y]) => sourcePoint(x, y))),
  Object.freeze([[1218, 679], [1265, 640], [1295, 578], [1320, 515]].map(([x, y]) => sourcePoint(x, y))),
]);

export const ROOM02_SPRITE_LAYOUT = Object.freeze({
  deviceScale: 0.225,
  subjectAnchors: Object.freeze({
    idle: Object.freeze({ sourceX: 364, sourceY: 782 }),
    playing: Object.freeze({ sourceX: 213, sourceY: 782 }),
  }),
  towerAnchors: Object.freeze({
    idle: Object.freeze({ sourceX: 228, sourceY: 535 }),
    listening: Object.freeze({ sourceX: 183, sourceY: 535 }),
    checking: Object.freeze({ sourceX: 172, sourceY: 535 }),
    rejected: Object.freeze({ sourceX: 156, sourceY: 535 }),
    connected: Object.freeze({ sourceX: 132, sourceY: 535 }),
  }),
});
