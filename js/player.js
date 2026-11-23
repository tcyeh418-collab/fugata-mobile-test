import {isDarkRoom6State,darkRoom6MovementScale} from './dark-room6-layout.js';
import {isDarkRoom5State,darkRoom5MovementScale} from './dark-room5-layout.js';
import {isDarkRoom4State,darkRoom4MovementScale} from './dark-room4-layout.js';
import { moveWithCollisions } from "./collision.js";
import {darkRoom1MovementScale} from './dark-room1-layout.js';
import {isDarkRoom2State,darkRoom2MovementScale} from './dark-room2-layout.js';
import {isDarkRoom3State,darkRoom3MovementScale} from './dark-room3-layout.js';

export function updatePlayer(state, direction, deltaTime, walls) {
  const before = {x: state.player.x, y: state.player.y};
  if (direction.x || direction.y) state.player.facing = Math.abs(direction.x) >= Math.abs(direction.y)
    ? (direction.x < 0 ? "left" : "right") : (direction.y < 0 ? "back" : "front");
  moveWithCollisions(state.player, direction, deltaTime, walls,
    isDarkRoom6State(state)?darkRoom6MovementScale(state):isDarkRoom5State(state)?darkRoom5MovementScale(state):isDarkRoom4State(state)?darkRoom4MovementScale(state):isDarkRoom3State(state)?darkRoom3MovementScale(state):isDarkRoom2State(state)?darkRoom2MovementScale(state):darkRoom1MovementScale(state));
  state.player.moving = Math.hypot(state.player.x-before.x, state.player.y-before.y) > 0.01;
  state.player.walkTime = state.player.moving ? (state.player.walkTime || 0) + deltaTime : 0;
  state.player.glowRemaining = Math.max(0, state.player.glowRemaining - deltaTime);
}
