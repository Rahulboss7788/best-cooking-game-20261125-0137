// Ember & Thyme — configuration: canvas, timings, prices, colours.
// One place for every number the rest of the game tunes against.
export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 180;
export const RUSH_AT = 45;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 95;
export const ORDER_GAP = 22;
export const RUSH_GAP = 13;
export const CHOP_SECONDS = 2.2;
export const COOK_SECONDS = 3.5;
export const BURN_SECONDS = 7;
export const FLASH_TIP_PENALTY = 0.15;
export const TIP_MAX = 8;
export const PLAYER_SPEED = 260;
export const PLAYER_RADIUS = 20;
export const BEST_KEY = 'ember-and-thyme-best';

// Warm bistro palette: raw ingredients pale, cooked warm, ready-to-serve glowing.
export const COLOURS = {
  wall: '#7a4a2b',
  wallTop: '#93592f',
  floor: '#c98f5a',
  floorAlt: '#bd8250',
  counter: '#8a5a33',
  counterTop: '#a9713f',
  board: '#e8c98f',
  stove: '#3d3d46',
  window: '#2e6f5e',
  garden: '#4d7a3a',
  pantry: '#6b4a8a',
  gold: '#ffc93c',
  cream: '#fff3d6',
  ink: '#2b1a10',
  red: '#d94f3d',
  green: '#5da24a',
};

export const STATIONS = {
  pantry: { x: 340, y: 104, w: 220, h: 92, label: 'PANTRY', hint: '1-6 pick · E take' },
  board: { x: 600, y: 104, w: 170, h: 92, label: 'CHOPPING BOARD', hint: 'E chop' },
  stove: { x: 810, y: 104, w: 170, h: 92, label: 'STOVE', hint: 'E cook · F flash fry' },
  garden: { x: 340, y: 556, w: 220, h: 92, label: 'HERB GARDEN', hint: 'E pick herb — free' },
  counter: { x: 600, y: 556, w: 170, h: 92, label: 'ASSEMBLY COUNTER', hint: 'E add to plate · Q clear' },
  window: { x: 810, y: 556, w: 170, h: 92, label: 'SERVING WINDOW', hint: 'E serve plate' },
};

// Kitchen floor the chef walks on (inside the walls, clear of station tiles).
export const FLOOR = { x: 320, y: 210, w: 680, h: 330 };
