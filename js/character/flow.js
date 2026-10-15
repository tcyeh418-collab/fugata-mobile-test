// Change this destination and register a handler when Chapter I is integrated.
// The creator knows no room numbers and persists no Fugata progress.
export const CHARACTER_FLOW = Object.freeze({destination:'fugata'});
export function createCharacterRouter(destinations) {
 return async (character,{destination}) => {
  const enter=destinations[destination];
  if(typeof enter!=='function')throw new Error(`Unknown character destination: ${destination}`);
  return enter(character);
 };
}
