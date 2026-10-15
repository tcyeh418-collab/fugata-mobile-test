// One fixed image, uniformly scaled to the 960 × 640 Room 5 view.
// The playable 860 × 560 room lies inside this view; its margins include the portals.
export const ROOM05_ART = Object.freeze({
  src: new URL("../assets/art/fugata/room05/02-room05-equipment-layout-v1.png", import.meta.url).href,
  sourceWidth: 1536, sourceHeight: 1024,
  scale: 0.625, offsetX: 3470, offsetY: 0,
  clip: Object.freeze({ x: 3470, y: 0, width: 960, height: 640 }),
});

export function imageToWorld(x, y) {
  return { x: ROOM05_ART.offsetX + x * ROOM05_ART.scale,
    y: ROOM05_ART.offsetY + y * ROOM05_ART.scale };
}

// Least-squares planar projection of a unit circle onto the nine painted holes.
// Source measurements and residuals are recorded in TESTING.md. No per-node offsets.
const RING_PROJECTION = Object.freeze([
  240.7585164243, -101.9208363161, 765.7342824907,
  -0.6165988401, 83.4698568540, 537.8891940277,
  -0.0011307006, -0.1312427342,
]);
export const ROOM05_RING_CENTER = imageToWorld(RING_PROJECTION[2], RING_PROJECTION[5]);
export function room05RingPoint(angle) {
  const x = Math.cos(angle), y = Math.sin(angle), h = RING_PROJECTION;
  const depth = 1 + h[6] * x + h[7] * y;
  return imageToWorld((h[0] * x + h[1] * y + h[2]) / depth,
    (h[3] * x + h[4] * y + h[5]) / depth);
}

export const ROOM05_LANDMARKS = Object.freeze({
  terminals: Object.freeze([[412, 335], [332, 506], [340, 676]].map(([x, y]) => imageToWorld(x, y))),
  test: imageToWorld(1090, 285),
  relays: Object.freeze([[1208, 418], [1216, 524], [1224, 631]].map(([x, y]) => imageToWorld(x, y))),
  final: imageToWorld(1118, 780),
  left: imageToWorld(60, 560),
  right: imageToWorld(1490, 550),
  entry: imageToWorld(150, 560),
});
export const ROOM05_ENTRY = Object.freeze({
  x: ROOM05_LANDMARKS.left.x, y: ROOM05_LANDMARKS.left.y - 38,
  width: 12, height: 76,
});
export const ROOM05_EXIT = Object.freeze({
  x: ROOM05_LANDMARKS.right.x, y: ROOM05_LANDMARKS.right.y - 38,
  width: 12, height: 76,
});
export const ROOM05_EXIT_TRIGGER = Object.freeze({
  x: ROOM05_EXIT.x + ROOM05_EXIT.width / 2,
  minY: ROOM05_EXIT.y + 13, maxY: ROOM05_EXIT.y + ROOM05_EXIT.height - 13,
});
