export function moveWithCollisions(player, direction, deltaTime, walls) {
  const length = Math.hypot(direction.x, direction.y) || 1;
  const dx = (direction.x / length) * player.speed * deltaTime;
  const dy = (direction.y / length) * player.speed * deltaTime;

  // Resolve only axes that actually moved. Zero horizontal input must never
  // eject an overlapping actor to the far end of a horizontal wall.
  // Substeps also keep a slow frame from tunnelling through a narrow base.
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / Math.max(1, player.radius / 2)));
  for (let i = 0; i < steps; i += 1) {
    if (dx !== 0) {
      player.x += dx / steps;
      for (const wall of walls) resolveCircleRect(player, wall, "x", dx);
    }
    if (dy !== 0) {
      player.y += dy / steps;
      for (const wall of walls) resolveCircleRect(player, wall, "y", dy);
    }
  }
}

function resolveCircleRect(circle, rect, axis, movement) {
  if (!circleTouchesRect(circle, rect)) return;
  if (axis === "x") {
    circle.x = movement > 0 ? rect.x - circle.radius : rect.x + rect.width + circle.radius;
  } else {
    circle.y = movement > 0 ? rect.y - circle.radius : rect.y + rect.height + circle.radius;
  }
}

export function circleTouchesRect(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

export function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width
    && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
