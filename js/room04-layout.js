import { ROOM03_DEVICE_GEOMETRY } from "./room03-layout.js?v=room04-movement-fixes-v6";

export const ROOM04_ARTBOARD = Object.freeze({ width: 1536, height: 1024 });

// Room 4 is authored as one 3:2 frame. Background art, equipment, doors,
// interaction anchors, transition thresholds, and collision geometry all use
// this single source-to-world transform.
export const ROOM04_VIEWPORT = Object.freeze({
  x: 2510,
  y: 0,
  width: 960,
  height: 640,
  scale: 0.625,
  offsetX: 2510,
  offsetY: 0,
  aspectRatio: 3 / 2,
});

export function room04SourceToWorld(x, y) {
  return Object.freeze({
    x: ROOM04_VIEWPORT.offsetX + x * ROOM04_VIEWPORT.scale,
    y: ROOM04_VIEWPORT.offsetY + y * ROOM04_VIEWPORT.scale,
  });
}

export function room04SourceLength(value) {
  return value * ROOM04_VIEWPORT.scale;
}

function sourcePoint(x, y) {
  return Object.freeze({ sourceX: x, sourceY: y, ...room04SourceToWorld(x, y) });
}

function sourceRect(x, y, width, height) {
  const point = room04SourceToWorld(x, y);
  return Object.freeze({
    sourceX: x,
    sourceY: y,
    sourceWidth: width,
    sourceHeight: height,
    x: point.x,
    y: point.y,
    width: room04SourceLength(width),
    height: room04SourceLength(height),
  });
}

// The four base anchors follow the engraved circles in the approved clean
// background. The consoles and four entry wells retain the existing Room 4
// gameplay positions, expressed here in artboard coordinates.
export const ROOM04_PLACEMENTS = Object.freeze({
  voicePedestals: Object.freeze([
    Object.freeze({ id: "door04-pedestal-01", ...sourcePoint(260, 496) }),
    Object.freeze({ id: "door04-pedestal-02", ...sourcePoint(1276, 496) }),
    Object.freeze({ id: "door04-pedestal-03", ...sourcePoint(260, 851) }),
    Object.freeze({ id: "door04-pedestal-04", ...sourcePoint(1276, 851) }),
  ]),
  referenceConsole: sourcePoint(768, 386),
  voiceLoom: sourcePoint(768, 616),
  testConsole: sourcePoint(1245, 657),
  voiceSlots: Object.freeze([
    Object.freeze({ id: "door04-entry-01", index: 0, ...sourcePoint(574, 606), socketY: room04SourceToWorld(0, 500).y }),
    Object.freeze({ id: "door04-entry-02", index: 1, ...sourcePoint(703, 606), socketY: room04SourceToWorld(0, 500).y }),
    Object.freeze({ id: "door04-entry-03", index: 2, ...sourcePoint(833, 606), socketY: room04SourceToWorld(0, 500).y }),
    Object.freeze({ id: "door04-entry-04", index: 3, ...sourcePoint(962, 606), socketY: room04SourceToWorld(0, 500).y }),
  ]),
});

export const ROOM04_DEVICE_GEOMETRY = Object.freeze({
  voiceInteractionRadius: room04SourceLength(80),
  slotInteractionRadius: room04SourceLength(108),
  referenceInteractionRadius: room04SourceLength(108.8),
  testInteractionRadius: room04SourceLength(80),
  slotWidth: room04SourceLength(147.2),
  slotHeight: room04SourceLength(131.2),
});

export const ROOM04_SPRITE_LAYOUT = Object.freeze({
  capsuleAtlas: Object.freeze(Object.fromEntries(["placed", "listening", "carried"].map(key =>
    [key, Object.freeze({ x: 63, y: 54, width: 388, height: 918 })]))),
  capsulePedestal: Object.freeze({
    width: room04SourceLength(176),
    height: room04SourceLength(264),
    anchorX: room04SourceLength(88),
    anchorY: room04SourceLength(235),
  }),
  capsuleSlotted: Object.freeze({
    width: room04SourceLength(52),
    height: room04SourceLength(124),
    anchorX: room04SourceLength(26),
    anchorY: room04SourceLength(116),
  }),
  // Moving hand anchors are defined in room04-carry.js.
  referenceConsole: Object.freeze({
    anchor: sourcePoint(768, 352),
    width: room04SourceLength(390),
    height: room04SourceLength(170),
  }),
  voiceLoom: Object.freeze({
    anchor: ROOM04_PLACEMENTS.voiceLoom,
    width: room04SourceLength(666),
    height: room04SourceLength(205),
  }),
  testConsole: Object.freeze({
    anchor: sourcePoint(1245, 657),
    width: room04SourceLength(190),
    height: room04SourceLength(165),
  }),
});

function characterPair(leroy, pinxin) {
  return Object.freeze({
    leroy: sourcePoint(...leroy),
    pinxin: sourcePoint(...pinxin),
  });
}

export const ROOM04_CHARACTER_SPOTS = Object.freeze({
  arrival: characterPair([707, 864], [849, 864]),
  idle: characterPair([707, 864], [849, 864]),
  reference: characterPair([624, 800], [912, 800]),
  loom: characterPair([624, 800], [912, 800]),
  exit: characterPair([1010, 800], [1110, 890]),
});

export const ROOM04_CHARACTER_INITIAL = ROOM04_CHARACTER_SPOTS.arrival;

// The v3 background already contains open side passages. These bounds follow
// the floor of those painted passages, so no additional gate art is needed.
const doorwayMinSourceY = 336;
const doorwayMaxSourceY = 464;
const leftDoorTarget = sourcePoint(80, 400);
const rightDoorTarget = sourcePoint(1504, 400);
const rightWallSourceX = 1436.8;
const corridorSourceWidth = 99.2;

export const ROOM04_DOORWAY = Object.freeze({
  entrance: Object.freeze({
    anchor: leftDoorTarget,
    label: sourcePoint(112, 286),
    opening: sourceRect(51.2, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    arrival: sourcePoint(140.8, 400),
  }),
  exit: Object.freeze({
    anchor: rightDoorTarget,
    label: sourcePoint(1480, 286),
    opening: sourceRect(rightWallSourceX, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    collider: sourceRect(rightWallSourceX, doorwayMinSourceY, 28.8, doorwayMaxSourceY - doorwayMinSourceY),
    focus: sourcePoint(1408, 400),
    interactionZone: sourceRect(1328, 320, 124.8, 176),
    trigger: Object.freeze({
      ...rightDoorTarget,
      minY: room04SourceToWorld(0, doorwayMinSourceY).y,
      maxY: room04SourceToWorld(0, doorwayMaxSourceY).y,
    }),
    room05Arrival: Object.freeze({ x: 3563.75, y: 350 }),
  }),
});

export const ROOM04_WALKABLE = Object.freeze({
  room: sourceRect(80, 340, rightWallSourceX - 80, 620),
  corridor: sourceRect(rightWallSourceX, doorwayMinSourceY, corridorSourceWidth, doorwayMaxSourceY - doorwayMinSourceY),
});

export const ROOM04_WALKABLE_WALLS = Object.freeze([
  Object.freeze({ id: "room4-top", ...sourceRect(80, 340, rightWallSourceX - 80, 28.8) }),
  Object.freeze({ id: "room4-bottom", ...sourceRect(80, 931.2, rightWallSourceX - 80, 28.8) }),
  Object.freeze({ id: "room4-left-top", ...sourceRect(51.2, 64, 28.8, doorwayMinSourceY - 64) }),
  Object.freeze({ id: "room4-left-bottom", ...sourceRect(51.2, doorwayMaxSourceY, 28.8, 496) }),
  Object.freeze({ id: "room4-right-top", ...sourceRect(rightWallSourceX, 64, 28.8, doorwayMinSourceY - 64) }),
  Object.freeze({ id: "room4-right-bottom", ...sourceRect(rightWallSourceX, doorwayMaxSourceY, 28.8, 496) }),
  Object.freeze({ id: "corridor04-top", ...sourceRect(rightWallSourceX, doorwayMinSourceY - 28.8, corridorSourceWidth, 28.8) }),
  Object.freeze({ id: "corridor04-bottom", ...sourceRect(rightWallSourceX, doorwayMaxSourceY, corridorSourceWidth, 28.8) }),
]);

export const ROOM04_PROCEDURAL_WALL_IDS = Object.freeze(
  ROOM04_WALKABLE_WALLS.map(({ id }) => id),
);

// Physical equipment occupancy: the rear of the desk is an equipment zone,
// not a narrow walking slit. The broad northern aisle serves the reference.
export const ROOM04_EQUIPMENT_COLLIDERS = Object.freeze([
  Object.freeze({id: "base-loom", owner: "loom", ...sourceRect(435, 470, 666, 146)}),
  Object.freeze({id: "base-door04-reference-console", owner: "door04-reference-console", ...sourceRect(574, 292, 388, 62)}),
  Object.freeze({id: "base-door04-test-console", owner: "door04-test-console", ...sourceRect(1150, 550, 190, 107)}),
  ...ROOM04_PLACEMENTS.voicePedestals.map(p => Object.freeze({id: `base-${p.id}`, owner: p.id, ...sourceRect(p.sourceX-86, p.sourceY-112, 172, 116)})),
]);
export const ROOM04_ACTOR_LAYOUT = Object.freeze({
  height: ROOM03_DEVICE_GEOMETRY.sprites.character.height,
  propWidth: room04SourceLength(30),
  propHeight: room04SourceLength(72),
  hand: Object.freeze({holding: [22, -45], showing: [22, -45], placing: [22, -45]}),
  poses: Object.freeze({idle: 0, holding: 1, showing: 2, placing: 3, pointing: 1, listening: 2, confirming: 3}),
});
export function room04ActiveSlot(state) {
  return state.door04.status === "testing" ? state.door04.activeEntryCount - 1 : -1;
}

// Source crops describe new standalone sprites, never the approved diagrams.
export const ROOM04_IMAGE_REGIONS = Object.freeze({
  voiceLoom: [0, 0, 666, 205],
  station: [0, 0, 768, 512],
  referenceConsole: [0, 0, 390, 170],
  testConsole: [0, 0, 190, 165],
});
export const ROOM04_STATION_SPRITE = Object.freeze({width: 225, height: 150, anchorX: 93.75, anchorY: 141.25, capsuleWidth: 26.4, capsuleHeight: 67.4, socketLift: 50.4});

export const ROOM04_NAVIGATION_BOUNDS = Object.freeze([
  room04SourceToWorld(100,0).x, room04SourceToWorld(1512,0).x,
  room04SourceToWorld(0,380).y, room04SourceToWorld(0,910).y,
]);
