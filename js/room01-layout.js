export const ROOM01_ARTBOARD = Object.freeze({ width: 1920, height: 1280 });

export const ROOM01_VIEWPORT = Object.freeze({
  x: -120,
  y: 0,
  width: 960,
  height: 640,
  scale: 0.5,
});

export function room01SourcePoint(x, y) {
  return Object.freeze({
    x: ROOM01_VIEWPORT.x + x * ROOM01_VIEWPORT.scale,
    y: ROOM01_VIEWPORT.y + y * ROOM01_VIEWPORT.scale,
  });
}

export function room01SourceRect(x, y, width, height) {
  const origin = room01SourcePoint(x, y);
  return Object.freeze({
    x: origin.x,
    y: origin.y,
    width: width * ROOM01_VIEWPORT.scale,
    height: height * ROOM01_VIEWPORT.scale,
  });
}

function measuredFloorRing(id, x, y, radiusX, radiusY) {
  return Object.freeze({
    id,
    sourceCenter: Object.freeze({ x, y }),
    center: room01SourcePoint(x, y),
    sourceRadius: Object.freeze({ x: radiusX, y: radiusY }),
  });
}

// Ellipse centers measured from the gold floor inlays in the 1920 x 1280 art.
// The order preserves the public labels: upper-left, upper-right, center,
// lower-right, then lower-left.
export const ROOM01_FLOOR_RINGS = Object.freeze([
  measuredFloorRing("floor-ring-01", 623, 589, 136, 58),
  measuredFloorRing("floor-ring-02", 1285, 582, 136, 57),
  measuredFloorRing("floor-ring-03", 958, 740, 246, 143),
  measuredFloorRing("floor-ring-04", 1405, 922, 220, 103),
  measuredFloorRing("floor-ring-05", 493, 917, 171, 100),
]);

export const ROOM01_STATION_SPRITE = Object.freeze({
  width: 90,
  height: 134,
  sourceWidth: 470,
  sourceHeight: 700,
  sourceAnchorX: 207,
  sourceAnchorY: 511,
  sourceCoreY: 293,
  // The station's lower circular plinth, rather than the atlas frame, is the
  // visual anchor that must land on the measured gold floor-ring center.
  anchorX: 90 * 207 / 470,
  anchorY: 134 * 511 / 700,
  coreOffsetY: 134 * (293 - 511) / 700,
  labelOffsetY: 22,
  emptyLabelOffsetY: 34,
  interactionRadius: 58,
});

export const ROOM01_STATIONS = Object.freeze(
  ROOM01_FLOOR_RINGS.map((ring, index) => Object.freeze({
    id: `pedestal-0${index + 1}`,
    floorRingId: ring.id,
    x: ring.center.x,
    y: ring.center.y,
    interactionRadius: ROOM01_STATION_SPRITE.interactionRadius,
  })),
);

const themeReplayAnchor = room01SourcePoint(330, 790);

export const ROOM01_THEME_REPLAY_DEVICE = Object.freeze({
  id: "room01-theme-replay",
  displayName: "Fugata 主題留聲機",
  sourceAnchor: Object.freeze({ x: 330, y: 790 }),
  x: themeReplayAnchor.x,
  y: themeReplayAnchor.y,
  width: 130,
  height: 88,
  anchorX: 65,
  anchorY: 88,
  interactionPoint: Object.freeze(room01SourcePoint(456, 772)),
  interactionRadius: 72,
  playbackFocusOffsetX: -4,
  playbackFocusOffsetY: -47,
  footprint: Object.freeze({ width: 100, height: 24, offsetY: -9 }),
});

const gateSprite = room01SourceRect(1584, 184, 260, 434);
const gateFocus = room01SourcePoint(1724, 397);
const passage = room01SourceRect(1600, 380, 240, 220);
const interactionZone = room01SourceRect(1640, 350, 160, 250);
const collider = room01SourceRect(1800, 380, 44, 220);

export const ROOM01_DOORWAY = Object.freeze({
  // Background architecture measurements. The gate atlas draws only inside it.
  visibleFrame: room01SourceRect(1584, 202, 280, 406),
  innerOpening: room01SourceRect(1648, 248, 184, 344),
  gateSprite: Object.freeze({
    ...gateSprite,
    focusX: gateFocus.x,
    focusY: gateFocus.y,
  }),
  focus: gateFocus,
  // Exact original-background pixels drawn above the avatar only while the
  // player is inside the open tunnel, restoring the doorway's foreground lip.
  foregroundSprite: room01SourceRect(1540, 160, 380, 520),
  depthZone: Object.freeze({
    startX: room01SourcePoint(1680, 0).x,
    endX: room01SourcePoint(1840, 0).x,
    minY: passage.y,
    maxY: passage.y + passage.height,
  }),
  passage,
  interactionZone,
  collider,
  walls: Object.freeze({
    subjectRightTop: Object.freeze({ x: 662, y: 40, width: 18, height: passage.y - 40 }),
    subjectRightBottom: Object.freeze({ x: 662, y: passage.y + passage.height, width: 18, height: 600 - (passage.y + passage.height) }),
    corridorTop: Object.freeze({ x: passage.x, y: passage.y - 18, width: passage.width, height: 18 }),
    corridorBottom: Object.freeze({ x: passage.x, y: passage.y + passage.height, width: passage.width, height: 18 }),
  }),
  threshold: Object.freeze({
    sourceX: 1840,
    x: room01SourcePoint(1840, 0).x,
    minY: passage.y,
    maxY: passage.y + passage.height,
  }),
  trigger: Object.freeze({
    // Trigger from inside the painted opening instead of requiring the player
    // to press against Room 1's x=800 navigation boundary.
    x: room01SourcePoint(1812, 0).x,
    minY: passage.y,
    maxY: passage.y + passage.height,
  }),
  // These remain Room 2 walls. They are ignored only while an opened Door 1
  // is crossing the shared seam, then resume at the confirmed Room 2 entry.
  openConnectorWallIds: Object.freeze(["echo-left-top", "echo-left-bottom"]),
});

export const ROOM01_WALKABLE = Object.freeze({
  room: Object.freeze({ x: 40, y: 40, width: 640, height: 560 }),
  corridor: passage,
});
