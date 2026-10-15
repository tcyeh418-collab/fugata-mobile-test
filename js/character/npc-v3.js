// v3: five 448 × 576 cells, sole anchor (224, 548). pinxin = Miss DJ Bear Beat.
const art = new Map();
let requested = false;
export function loadNpcArt() {
  if (requested || typeof Image === 'undefined') return;
  requested = true;
  for (const [key, folder] of [['leroy', 'leroy'], ['pinxin', 'miss-dj-bear-beat']]) {
    const pair = {};
    art.set(key, pair);
    for (const direction of ['left', 'right']) {
      const image = new Image();
      image.onload = () => { if (image.naturalWidth === 2240 && image.naturalHeight === 576) pair[direction] = image; };
      image.onerror = () => {}; // Existing room sprite remains the fallback.
      image.src = new URL(`../../assets/characters/npc-v3/${folder}/${direction}/strip.png`, import.meta.url).href;
    }
  }
}
export function updateNpcAnimation(character, previousX, previousY, dt, focusX) {
  const dx = character.x - previousX, dy = character.y - previousY;
  const distance = Math.hypot(dx, dy);
  const animation = character.animation ??= { moving: false, distance: 0, facing: character.facing || 1 };
  const arrived = Math.hypot(character.targetX - character.x, character.targetY - character.y) < 0.001;
  animation.moving = dt > 0 && distance > 0.000001 && !arrived;
  if (animation.moving) {
    // Room 3 uses exponential easing and can briefly exceed normal walking speed.
    // Cap at eight frames/s without changing any authored movement target or speed.
    animation.distance += Math.min(distance, dt * 15 * 8);
    // A velocity dead band plus horizontal dominance avoids near-vertical twitching.
    if (Math.abs(dx) / dt > 3 && Math.abs(dx) > Math.abs(dy) * 0.08) animation.facing = Math.sign(dx);
  } else {
    animation.distance = 0;
    if (Math.abs(focusX - character.x) > 6) animation.facing = Math.sign(focusX - character.x);
  }
  character.facing = animation.facing;
}
export function npcFrame(character, reducedMotion = false) {
  // 88–92 world px/s -> about six frames/s, slower easing means slower steps.
  return character.animation?.moving && !reducedMotion ? 1 + Math.floor(character.animation.distance / 15) % 4 : 0;
}
export function drawNpc(context, character, height, reducedMotion = false) {
  const pair = art.get(character.assetKey);
  // Wait for both directions to avoid switching between new and old art on turns.
  if (!pair?.left || !pair?.right) return false;
  const sprite = pair[character.facing < 0 ? 'left' : 'right'];
  const scale = height / 512;
  context.imageSmoothingEnabled = false;
  context.drawImage(sprite, npcFrame(character, reducedMotion) * 448, 0, 448, 576,
    -224 * scale, -548 * scale, 448 * scale, 576 * scale);
  return true;
}
