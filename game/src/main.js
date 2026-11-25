// Ember & Thyme — boot and the one loop: input is read every frame, the world
// advances in fixed 1/60 s steps, and the renderer paints what is there.
// The game moves between four screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=cover|rush|tense|serve (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP, STATIONS } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_BURN, EVENT_FAILED, EVENT_ORDER, EVENT_OVER, EVENT_RUSH, EVENT_SERVED } from './world.js';
import { ACTION_CLEAR, ACTION_CONFIRM, ACTION_FLASH, ACTION_INTERACT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';
import { INGREDIENT_KEYS } from './recipes.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Which station (if any) a canvas point falls on. */
function stationAt(x, y) {
  for (const [name, rect] of Object.entries(STATIONS)) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return name;
  }
  return null;
}

/** Which pantry ingredient a canvas point falls on (bottom picker chips). */
function pantryIndexAt(x, y) {
  if (y < 696 || y > 736) return -1;
  const i = Math.floor((x - 30) / 108);
  return i >= 0 && i < INGREDIENT_KEYS.length && x >= 30 + i * 108 && x <= 30 + i * 108 + 98 ? i : -1;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let pendingClick = null;
  let pendingStation = null;
  const input = createInput(canvas, (x, y) => {
    const pantry = pantryIndexAt(x, y);
    if (pantry >= 0) {
      world.state.pantryPick = pantry;
      return;
    }
    pendingClick = { x, y };
    pendingStation = stationAt(x, y);
    audio.unlock();
  });
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    audio.unlock();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Serve orders before patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    announce(`Shift over. Earned $${world.state.coins}. Best $${best}.`);
  }

  function handleEvents(events) {
    if (events & EVENT_SERVED) audio.coin();
    if (events & EVENT_ORDER) audio.order();
    if (events & EVENT_FAILED) audio.wrong();
    if (events & EVENT_BURN) audio.wrong();
    if (events & EVENT_RUSH) audio.rush();
    if (events & EVENT_OVER) endGame();
  }

  function step(actions, numberKey) {
    if (screen !== SCREEN_PLAY) return;
    let interact = Boolean(actions & ACTION_INTERACT);
    // Clicking a station walks there and interacts on arrival.
    if (pendingStation && world.nearestStation() === pendingStation) {
      interact = true;
      pendingStation = null;
    }
    const click = pendingClick;
    pendingClick = null;
    const events = world.step(STEP, {
      dir: input.direction(),
      interact,
      flash: Boolean(actions & ACTION_FLASH),
      clear: Boolean(actions & ACTION_CLEAR),
      numberKey,
      click,
    });
    handleEvents(events);
  }

  function handleActions(actions) {
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = input.takeActions();
    const numberKey = input.takeNumberKey();
    handleActions(actions);
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      let firstStep = true;
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        if (screen === SCREEN_PLAY) step(firstStep ? actions : 0, firstStep ? numberKey : null);
        firstStep = false;
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, screen === SCREEN_PLAY ? world.nearestStation() : null);
  }

  // Leaving the tab pauses a running game rather than letting orders walk out unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  // Title backdrop: a couple of orders on the board behind the title card.
  world.spawnOrder();
  world.spawnOrder();

  // Test and automation hook: the live world, for playtests only.
  window.__ember = { world, startGame, screen: () => screen };

  announce('Ember and Thyme. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
