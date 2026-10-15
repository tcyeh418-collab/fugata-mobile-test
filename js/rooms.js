import { roomFootprints } from "./space.js?v=room01-theme-replay-v1";
import { ROOM05_ART, ROOM05_ENTRY, ROOM05_EXIT } from "./room05-art.js";
import { ROOM06_ART, ROOM06_ENTRY, ROOM06_EXIT, ROOM06_ENDING_TRIGGER } from "./room06-art.js";
import {
  ROOM02_DOORWAY,
  ROOM02_VIEWPORT,
  ROOM02_WALKABLE_WALLS,
} from "./room02-layout.js?v=room02-perspective-exit-v1";
import {
  ROOM01_DOORWAY,
  ROOM01_WALKABLE,
} from "./room01-layout.js?v=room01-theme-replay-v1";
import {
  ROOM03_DOORWAY,
  ROOM03_WALKABLE,
  ROOM03_WALKABLE_WALLS,
} from "./room03-layout.js?v=room03-side-gate-v1";
import {
  ROOM04_DOORWAY,
  ROOM04_WALKABLE,
  ROOM04_WALKABLE_WALLS,
} from "./room04-layout.js?v=room04-movement-fixes-v6";

function room02Wall(id, rect) {
  return Object.freeze({ id, x: rect.x, y: rect.y, width: rect.width, height: rect.height });
}

export const rooms = {
  subject: { id: "room-01", ...ROOM01_WALKABLE.room },
  corridor01: { id: "corridor-01", ...ROOM01_WALKABLE.corridor },
  echo: { id: "room-02", x: 800, y: ROOM02_VIEWPORT.y, width: 800, height: ROOM02_VIEWPORT.height },
  corridor02: {
    id: "corridor-02",
    x: ROOM02_DOORWAY.collider.x,
    y: ROOM02_DOORWAY.trigger.minY,
    width: 1600 - ROOM02_DOORWAY.collider.x,
    height: ROOM02_DOORWAY.trigger.maxY - ROOM02_DOORWAY.trigger.minY,
  },
  room3: { id: "room-03", ...ROOM03_WALKABLE.room },
  corridor03: { id: "corridor-03", ...ROOM03_WALKABLE.corridor },
  room4: { id: "room-04", ...ROOM04_WALKABLE.room },
  corridor04: { id: "corridor-04", ...ROOM04_WALKABLE.corridor },
  room5: { id: "room-05", x: 3520, y: 40, width: 860, height: 560 },
  corridor05: { id: "corridor-05", x: 4380, y: 270, width: 100, height: 120 },
  room6: { id: "room-06", x: 4480, y: 40, width: 860, height: 560 },
  finalCorridor: { id: "final-corridor", x: 5340, y: 270, width: 260, height: 120 },
};

export const staticWalls = [
  { id: "subject-top", x: 40, y: 40, width: 640, height: 18 },
  { id: "subject-bottom", x: 40, y: 582, width: 640, height: 18 },
  { id: "subject-left", x: 40, y: 40, width: 18, height: 560 },
  { id: "subject-right-top", ...ROOM01_DOORWAY.walls.subjectRightTop },
  { id: "subject-right-bottom", ...ROOM01_DOORWAY.walls.subjectRightBottom },
  { id: "corridor-top", ...ROOM01_DOORWAY.walls.corridorTop },
  { id: "corridor-bottom", ...ROOM01_DOORWAY.walls.corridorBottom },
  room02Wall("echo-top", ROOM02_WALKABLE_WALLS[0]),
  room02Wall("echo-bottom", ROOM02_WALKABLE_WALLS[1]),
  room02Wall("echo-left-top", ROOM02_WALKABLE_WALLS[2]),
  room02Wall("echo-left-bottom", ROOM02_WALKABLE_WALLS[3]),
  room02Wall("echo-right-top", ROOM02_WALKABLE_WALLS[4]),
  room02Wall("echo-right-bottom", ROOM02_WALKABLE_WALLS[5]),
  { id: "corridor02-top", x: ROOM02_DOORWAY.collider.x, y: ROOM02_DOORWAY.trigger.minY - 18, width: 1600 - ROOM02_DOORWAY.collider.x, height: 18 },
  { id: "corridor02-bottom", x: ROOM02_DOORWAY.collider.x, y: ROOM02_DOORWAY.trigger.maxY, width: 1600 - ROOM02_DOORWAY.collider.x, height: 18 },
  ...ROOM03_WALKABLE_WALLS,
  ...ROOM04_WALKABLE_WALLS,
  { id: "room5-top", x: 3520, y: 40, width: ROOM05_EXIT.x - 3520 + 12, height: 18 },
  { id: "room5-bottom", x: 3520, y: 582, width: ROOM05_EXIT.x - 3520 + 12, height: 18 },
  { id: "room5-left-top", x: ROOM05_ENTRY.x, y: 40, width: ROOM05_ENTRY.width, height: ROOM05_ENTRY.y - 40 },
  { id: "room5-left-bottom", x: ROOM05_ENTRY.x, y: ROOM05_ENTRY.y + ROOM05_ENTRY.height, width: ROOM05_ENTRY.width, height: 600 - ROOM05_ENTRY.y - ROOM05_ENTRY.height },
  { id: "room5-entry-backstop", x: ROOM05_ART.clip.x, y: ROOM05_ENTRY.y, width: ROOM05_ENTRY.width, height: ROOM05_ENTRY.height },
  { id: "room5-right-top", x: ROOM05_EXIT.x, y: 40, width: 12, height: ROOM05_EXIT.y - 40 },
  { id: "room5-right-bottom", x: ROOM05_EXIT.x, y: ROOM05_EXIT.y + ROOM05_EXIT.height, width: 12, height: 600 - ROOM05_EXIT.y - ROOM05_EXIT.height },
  { id: "corridor05-top", x: ROOM05_EXIT.x + ROOM05_EXIT.width, y: 252, width: 4480 - ROOM05_EXIT.x - ROOM05_EXIT.width, height: 18 },
  { id: "corridor05-bottom", x: ROOM05_EXIT.x + ROOM05_EXIT.width, y: 390, width: 4480 - ROOM05_EXIT.x - ROOM05_EXIT.width, height: 18 },
  { id: "room6-top", x: ROOM06_ENTRY.x, y: 120, width: ROOM06_EXIT.x-ROOM06_ENTRY.x+10, height: 12 },
  { id: "room6-bottom", x: ROOM06_ENTRY.x, y: 598, width: ROOM06_EXIT.x-ROOM06_ENTRY.x+10, height: 12 },
  { id: "room6-left-top", x: ROOM06_ENTRY.x, y: 120, width: 10, height: ROOM06_ENTRY.y-120 },
  { id: "room6-left-bottom", x: ROOM06_ENTRY.x, y: ROOM06_ENTRY.y+ROOM06_ENTRY.height, width: 10, height: 610-ROOM06_ENTRY.y-ROOM06_ENTRY.height },
  { id: "room6-entry-backstop", x: ROOM06_ART.clip.x, y: ROOM06_ENTRY.y, width: 8, height: ROOM06_ENTRY.height },
  { id: "room6-right-top", x: ROOM06_EXIT.x, y: 120, width: 10, height: ROOM06_EXIT.y-120 },
  { id: "room6-right-bottom", x: ROOM06_EXIT.x, y: ROOM06_EXIT.y+ROOM06_EXIT.height, width: 10, height: 610-ROOM06_EXIT.y-ROOM06_EXIT.height },
  { id: "room6-exit-backstop", x: ROOM06_ART.clip.x+ROOM06_ART.clip.width, y: ROOM06_EXIT.y, width: 8, height: ROOM06_EXIT.height },
];

export const door01Collider = { id: "door-01-collider", ...ROOM01_DOORWAY.collider };
export const door02Collider = room02Wall("door-02-collider", ROOM02_DOORWAY.collider);
export const door03Collider = room02Wall("door-03-collider", ROOM03_DOORWAY.exit.collider);
export const door04Collider = room02Wall("door-04-collider", ROOM04_DOORWAY.exit.collider);
export const door05Collider = { id: "door-05-collider", ...ROOM05_EXIT };
export const door06Collider = { id: "door-06-collider", ...ROOM06_EXIT };
export const endingTrigger = { id: "ending-trigger", ...ROOM06_ENDING_TRIGGER };

export function activeWalls(state) {
  const room = state.gameProgress.currentRoom;
  if (room >= 5) {
    const walls = staticWalls.filter(w => w.id.startsWith(`room${room}-`) || (room === 5 && w.id.startsWith("corridor05-")));
    if (state[`door0${room}`].status !== "open") walls.push(room === 5 ? door05Collider : door06Collider);
    return [...walls,...roomFootprints(state)];
  }
  const roomWalls = staticWalls.filter(w => !w.id.startsWith("room5-") && !w.id.startsWith("room6-") && !w.id.startsWith("corridor05-"));
  const openingRoom01Connector = state.gameProgress.currentRoom === 1
    && state.door01.status === "open";
  const walls = openingRoom01Connector
    ? roomWalls.filter((wall) => !ROOM01_DOORWAY.openConnectorWallIds.includes(wall.id))
    : [...roomWalls];
  if (state.door01.status !== "open") walls.push(door01Collider);
  if (state.door02.status !== "open") walls.push(door02Collider);
  if (state.door03.status !== "open") walls.push(door03Collider);
  if (state.door04.status !== "open") walls.push(door04Collider);
  if (state.door05.status !== "open") walls.push(door05Collider);
  if (state.door06.status !== "open") walls.push(door06Collider);
  return [...walls,...roomFootprints(state)];
}

export function updateCurrentRoom(state) {
  // Room identity changes only under the transition controller's blackout.
  state.gameProgress.currentDoor = state.gameProgress.currentRoom;
}
