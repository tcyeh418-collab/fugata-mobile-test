// Measured in the approved 1536 × 1024 equipment master; no state images.
export const ROOM06_ART = Object.freeze({
  src: new URL("../assets/art/fugata/room06/02-room06-equipment-layout-v1.png", import.meta.url).href,
  sourceWidth: 1536, sourceHeight: 1024,
  scale: 0.625, offsetX: 4430, offsetY: 0,
  clip: Object.freeze({ x: 4430, y: 0, width: 960, height: 640 }),
});
export function room06ImageToWorld(x, y) {
  return { x: ROOM06_ART.offsetX + x * ROOM06_ART.scale, y: y * ROOM06_ART.scale };
}
const points = list => Object.freeze(list.map(([x,y]) => Object.freeze(room06ImageToWorld(x,y))));
export const ROOM06_LANDMARKS = Object.freeze({
  relays: points([[468,279],[621,240],[768,233],[916,240],[1067,279]]),
  memories: points([[1342,337],[1387,368],[1432,400]]),
  core: room06ImageToWorld(768,470),
  final: room06ImageToWorld(768,774),
  left: room06ImageToWorld(45,555), right: room06ImageToWorld(1500,555),
  entry: room06ImageToWorld(155,555),
});
export const ROOM06_ENTRY = Object.freeze({ x: ROOM06_LANDMARKS.left.x, y: ROOM06_LANDMARKS.left.y-25, width: 10, height: 50 });
export const ROOM06_EXIT = Object.freeze({ x: ROOM06_LANDMARKS.right.x, y: ROOM06_LANDMARKS.right.y-25, width: 10, height: 50 });
// Player centre must cross the painted threshold before the ending can start.
export const ROOM06_ENDING_TRIGGER = Object.freeze({ x: ROOM06_EXIT.x+6, y: ROOM06_EXIT.y+13, width: 10, height: 24 });
// Follow the rear brass rail outward, then the radial floor spokes to the core base.
export const ROOM06_ENERGY_PATHS = Object.freeze([
  [[468,340],[360,372],[490,464],[556,505]],
  [[621,300],[551,307],[447,335],[360,372],[490,464],[556,505]],
  [[768,297],[768,324]],
  [[916,300],[987,310],[1086,335],[1186,372],[1050,462],[980,505]],
  [[1067,340],[1186,372],[1050,462],[980,505]],
].map(points));
// Traced inner apertures only; light never covers the stone door frame.
export const ROOM06_PORTALS = Object.freeze({
  left: points([[3,450],[15,417],[29,406],[44,420],[51,445],[51,541],[3,569]]),
  right: points([[1490,445],[1497,420],[1510,411],[1523,425],[1534,451],[1534,568],[1490,541]]),
});
