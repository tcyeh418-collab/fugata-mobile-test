// Generated for the friends-only production package. Local QA routes are intentionally unavailable.
export const LOCAL_TEST_ROOM_QUERY = 'disabled';
export const LOCAL_ROOM03_GATE_QUERY = 'disabled';
export const LOCAL_TRANSITION_QUERY = 'disabled';
export const LOCAL_ROOM03_GATE_STATES = Object.freeze([]);
export const LOCAL_ROOM04_STATES = Object.freeze([]);
export const LOCAL_TEST_ROOM_OPTIONS = Object.freeze([]);
export function requestedLocalTestRoom(){ return null; }
export function requestedLocalEndingPreview(){ return false; }
export function localTestNeedsFreshStorage(){ return false; }
export function isLocalTestMode(){ return false; }
export function requestedLocalRoom03GateState(){ return null; }
export function requestedLocalRoom04State(){ return null; }
export function requestedLocalTransitionState(){ return null; }
export function createLocalTestRoomState(){ throw new Error('Local QA mode is not included in this playtest package.'); }
