// Helicopter flight model. Pure functions, no Phaser, so it can also run in
// Node for the level check (npm run check).
//
// Controls (build brief):
//  - press  -> upward impulse immediately (same frame)
//  - still held after `hoverDelay` ms -> hover: vertical speed eases to zero
//  - release -> gravity
//  - optional limited hover (tuning.hoverLimitMode):
//      1 = after `hoverTimeLimit` s of hovering in one hold, it starts sinking
//      2 = hover gauge: drains while hovering, refills while not holding
//  - forward speed is fixed; the player only controls height.

export function createHeli(x, y) {
  return {
    x, // left edge (world px)
    y, // top edge (world px)
    vy: 0, // + is down
    held: false,
    holdTime: 0,
    hovering: false,
    // Before the first touch after GO! the heli hovers, so a new player
    // isn't dropped into the ground before they've touched the screen.
    waitingForFirstTouch: true,
    hoverTime: 0, // hover time used in this hold (mode 1)
    gauge: 1, // 0..1 (mode 2)
  };
}

export function press(heli, t) {
  heli.vy = -t.tapImpulse;
  heli.held = true;
  heli.holdTime = 0;
  heli.hovering = t.hoverDelay <= 0;
  heli.hoverTime = 0;
  heli.waitingForFirstTouch = false;
}

export function release(heli) {
  heli.held = false;
  heli.hovering = false;
}

export function stepHeli(heli, t, dt) {
  heli.x += t.forwardSpeed * dt;
  if (heli.held && !heli.hovering) {
    heli.holdTime += dt;
    if (heli.holdTime * 1000 >= t.hoverDelay) heli.hovering = true;
  }
  let canHover = true;
  if (heli.hovering) {
    if (t.hoverLimitMode === 1) {
      heli.hoverTime += dt;
      canHover = heli.hoverTime < t.hoverTimeLimit;
    } else if (t.hoverLimitMode === 2) {
      heli.gauge = Math.max(0, heli.gauge - dt / t.gaugeSeconds);
      canHover = heli.gauge > 0;
    }
  }
  if (!heli.held && t.hoverLimitMode === 2) {
    heli.gauge = Math.min(1, heli.gauge + dt / t.gaugeRefillSeconds);
  }
  if ((heli.hovering && canHover) || heli.waitingForFirstTouch) {
    heli.vy *= Math.exp(-t.hoverStrength * dt);
    if (Math.abs(heli.vy) < 0.5) heli.vy = 0;
  } else {
    heli.vy = Math.min(heli.vy + t.gravity * dt, t.maxFallSpeed);
  }
  heli.y += heli.vy * dt;
}
