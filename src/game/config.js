// Fixed play area. Same size on every device (fair for a future leaderboard).
export const GAME_W = 180;
export const GAME_H = 320;

// Vertical layout of the play area (in game pixels).
export const HUD_H = 24; // black HUD bar at the top (kit/hud.js); its bottom edge is the ceiling
export const CEILING_Y = HUD_H;
export const GROUND_Y = 304; // top of the ground strip
export const GROUND_H = GAME_H - GROUND_Y;

// Helicopter (grey box) size and where it sits on screen.
export const HELI_W = 16;
export const HELI_H = 10;
export const HELI_SCREEN_X = 40; // left edge of the heli, in screen pixels

export const START_LIVES = 3;

// Scoring (design doc §5).
export const POINTS_PERSON = 100;
export const POINTS_HELIPAD = 500;

// Developer tools (?tune=1, ?stats=1). Set to false for the App Store build later.
export const DEV_TOOLS = true;
