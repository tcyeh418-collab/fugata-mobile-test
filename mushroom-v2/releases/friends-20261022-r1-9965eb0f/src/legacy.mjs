// Clean extraction from the read-only Mushroom MVP core.mjs (2026-07-26).
// Keep the source's remaining-spore rule and overlap convention.
export function calculateSporeLoss(currentSpores) {
  const current = Math.max(0, Math.floor(currentSpores));
  const remainingSpores = Math.ceil(current / 2);
  return { remainingSpores, lostSpores: current - remainingSpores };
}
export function rectanglesOverlap(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
