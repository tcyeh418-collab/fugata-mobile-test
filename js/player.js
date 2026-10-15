import { moveWithCollisions } from "./collision.js";

export function updatePlayer(state, direction, deltaTime, walls) {
  const before = {x: state.player.x, y: state.player.y};
  if (direction.x || direction.y) state.player.facing = Math.abs(direction.x) >= Math.abs(direction.y)
    ? (direction.x < 0 ? "left" : "right") : (direction.y < 0 ? "back" : "front");
  moveWithCollisions(state.player, direction, deltaTime, walls);
  state.player.moving = Math.hypot(state.player.x-before.x, state.player.y-before.y) > 0.01;
  state.player.walkTime = state.player.moving ? (state.player.walkTime || 0) + deltaTime : 0;
  state.player.glowRemaining = Math.max(0, state.player.glowRemaining - deltaTime);
}
