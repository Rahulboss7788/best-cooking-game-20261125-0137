// Ember & Thyme — the kitchen itself: orders, stations, chopping, cooking,
// plating, serving, the shift timer and the dinner rush. Pure logic, no drawing.
import {
  BEST_KEY, BURN_SECONDS, CHOP_SECONDS, COOK_SECONDS, FLASH_TIP_PENALTY,
  FLOOR, MAX_ORDERS, ORDER_GAP, ORDER_PATIENCE, PLAYER_RADIUS, PLAYER_SPEED,
  RUSH_AT, RUSH_GAP, SHIFT_SECONDS, STATIONS, TIP_MAX,
} from './config.js';
import { INGREDIENT_KEYS, makeIngredient, recipeById, recipeForPlate, RECIPES } from './recipes.js';
import { createRandom } from './random.js';

export const EVENT_ORDER = 1;
export const EVENT_SERVED = 2;
export const EVENT_FAILED = 4;
export const EVENT_OVER = 8;
export const EVENT_BURN = 16;
export const EVENT_RUSH = 32;

let orderId = 0;

function centre(rect) {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

function distToRect(px, py, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  return Math.hypot(px - cx, py - cy);
}

function collidesCircleRect(px, py, r, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  return Math.hypot(px - cx, py - cy) < r;
}

export { createRandom } from './random.js';

function pickRecipe(random, avoidId) {
  let recipe = RECIPES[Math.floor(random() * RECIPES.length)];
  if (recipe.id === avoidId && RECIPES.length > 1) {
    recipe = RECIPES[(RECIPES.indexOf(recipe) + 1) % RECIPES.length];
  }
  return recipe;
}

export function createWorld(random) {
  const state = {
    player: { x: 660, y: 420, tx: null, ty: null, facing: 1 },
    held: null,
    pantryPick: 0,
    board: { item: null, progress: 0 },
    stove: [
      { item: null, progress: 0, flashed: false },
      { item: null, progress: 0, flashed: false },
    ],
    plate: [],
    orders: [],
    queue: [],
    coins: 0,
    served: 0,
    failed: 0,
    burnt: 0,
    flashedDishes: 0,
    timeLeft: SHIFT_SECONDS,
    spawnTimer: 6,
    rush: false,
    rushAnnounced: false,
    over: false,
    popups: [],
    message: '',
    messageTtl: 0,
  };

  function popup(text, x, y, colour = '#fff3d6') {
    state.popups.push({ text, x, y, ttl: 1.6, colour });
  }

  function say(text, seconds = 2) {
    state.message = text;
    state.messageTtl = seconds;
  }

  function spawnOrder() {
    const nextId = state.queue.length > 0 ? state.queue.shift() : null;
    const recipe = nextId ? recipeById(nextId) : pickRecipe(random, null);
    const patience = ORDER_PATIENCE + Math.floor(random() * 15);
    state.orders.push({ id: ++orderId, recipeId: recipe.id, patience, maxPatience: patience });
    while (state.queue.length < 2) {
      state.queue.push(pickRecipe(random, state.orders[state.orders.length - 1]?.recipeId).id);
    }
    return EVENT_ORDER;
  }

  function nearestStation() {
    let best = null;
    let bestDist = 78;
    for (const [name, rect] of Object.entries(STATIONS)) {
      const d = distToRect(state.player.x, state.player.y, rect);
      if (d < bestDist) {
        bestDist = d;
        best = name;
      }
    }
    return best;
  }

  function interact() {
    const station = nearestStation();
    if (!station) return 0;
    const p = state.player;
    if (station === 'pantry') {
      if (state.held) { say('Hands full — serve or plate what you hold first.'); return 0; }
      const kind = INGREDIENT_KEYS[state.pantryPick];
      state.held = makeIngredient(kind);
      say(`Picked up ${kind}.`);
      return 0;
    }
    if (station === 'garden') {
      if (state.held) { say('Hands full.'); return 0; }
      state.held = makeIngredient('herb');
      say('Picked fresh thyme from the garden.');
      return 0;
    }
    if (station === 'board') {
      const board = state.board;
      if (!board.item && state.held && state.held.state === 'raw' && ['tomato', 'onion', 'mushroom'].includes(state.held.kind)) {
        board.item = state.held;
        board.progress = 0;
        state.held = null;
        say('Chopping…');
        return 0;
      }
      if (board.item && board.progress >= CHOP_SECONDS) {
        state.held = board.item;
        state.board = { item: null, progress: 0 };
        say(`Picked up chopped ${state.held.kind}.`);
        return 0;
      }
      if (board.item) { say('Still chopping — give it a second.'); return 0; }
      say('Bring something to chop: tomato, onion or mushroom.');
      return 0;
    }
    if (station === 'stove') {
      const burner = state.stove.find((b) => b.item && b.progress >= COOK_SECONDS);
      if (burner) {
        state.held = burner.item;
        burner.item = null;
        burner.progress = 0;
        burner.flashed = false;
        say(`Picked up cooked ${state.held.kind}.`);
        return 0;
      }
      const free = state.stove.find((b) => !b.item);
      if (free && state.held && ['tomato', 'mushroom', 'bread', 'cheese'].includes(state.held.kind)) {
        free.item = { ...state.held, state: 'cooked' };
        free.progress = 0;
        free.flashed = false;
        state.held = null;
        say('On the stove — sizzling.');
        return 0;
      }
      if (!free) { say('Both burners are busy.'); return 0; }
      say('That does not go on the stove.');
      return 0;
    }
    if (station === 'counter') {
      if (state.held && state.plate.length < 3) {
        state.plate.push(state.held);
        state.held = null;
        const done = recipeForPlate(state.plate);
        if (done) say(`${done.name} is ready — serve it at the window!`);
        else say('Added to the plate.');
        return 0;
      }
      if (!state.held && state.plate.length > 0) {
        state.held = state.plate.pop();
        say('Took it back off the plate.');
        return 0;
      }
      say('The plate is full — serve it or clear it (Q).');
      return 0;
    }
    if (station === 'window') {
      const recipe = recipeForPlate(state.plate);
      if (!recipe) {
        say('That plate does not match any order yet.');
        return 0;
      }
      const orderIndex = state.orders.findIndex((o) => o.recipeId === recipe.id);
      if (orderIndex === -1) {
        say('Nobody ordered that right now.');
        return 0;
      }
      const order = state.orders[orderIndex];
      const flashed = state.plate.some((item) => item.flashed);
      let tip = Math.round((order.patience / order.maxPatience) * TIP_MAX);
      if (flashed) {
        tip = Math.round(tip * (1 - FLASH_TIP_PENALTY));
        state.flashedDishes += 1;
      }
      const earned = recipe.price + tip;
      state.coins += earned;
      state.served += 1;
      state.orders.splice(orderIndex, 1);
      state.plate = [];
      const c = centre(STATIONS.window);
      popup(`+$${earned}`, c.x, c.y - 60, '#ffc93c');
      say(`${recipe.name} served! +$${earned} (tip $${tip}).`);
      return EVENT_SERVED;
    }
    return 0;
  }

  function flashFry() {
    const station = nearestStation();
    if (station !== 'stove') {
      say('Flash fry only works at the stove.');
      return 0;
    }
    const burner = state.stove.find((b) => b.item && b.progress < COOK_SECONDS);
    if (!burner) {
      say('Nothing cooking to flash-fry.');
      return 0;
    }
    burner.progress = COOK_SECONDS;
    burner.flashed = true;
    if (burner.item) burner.item.flashed = true;
    const c = centre(STATIONS.stove);
    popup('FLASH FRY!', c.x, c.y - 60, '#ff9a3c');
    say('Flash fry! Done in a flash — but the tip takes a hit.');
    return 0;
  }

  function clearPlate() {
    if (state.held) {
      state.held = null;
      say('Tossed what you were holding.');
      return 0;
    }
    if (state.plate.length > 0) {
      state.plate = [];
      say('Plate cleared.');
      return 0;
    }
    return 0;
  }

  function step(dt, controls) {
    if (state.over) return EVENT_OVER;
    let events = 0;
    const p = state.player;

    // Movement: keys win over click-to-walk.
    let dir = controls.dir;
    if (dir.x === 0 && dir.y === 0 && p.tx !== null) {
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) {
        p.tx = null;
        p.ty = null;
      } else {
        dir = { x: dx / d, y: dy / d };
      }
    }
    if (dir.x !== 0 || dir.y !== 0) {
      p.facing = dir.x !== 0 ? Math.sign(dir.x) : p.facing;
      let nx = p.x + dir.x * PLAYER_SPEED * dt;
      let ny = p.y + dir.y * PLAYER_SPEED * dt;
      nx = Math.max(FLOOR.x + PLAYER_RADIUS, Math.min(FLOOR.x + FLOOR.w - PLAYER_RADIUS, nx));
      ny = Math.max(100 + PLAYER_RADIUS, Math.min(660 - PLAYER_RADIUS, ny));
      const blocked = Object.values(STATIONS).some((rect) => collidesCircleRect(nx, ny, PLAYER_RADIUS, rect));
      if (!blocked) {
        p.x = nx;
        p.y = ny;
      } else {
        const tryX = !Object.values(STATIONS).some((rect) => collidesCircleRect(nx, p.y, PLAYER_RADIUS, rect));
        const tryY = !Object.values(STATIONS).some((rect) => collidesCircleRect(p.x, ny, PLAYER_RADIUS, rect));
        if (tryX) p.x = nx;
        if (tryY) p.y = ny;
      }
    }
    if (controls.click) {
      p.tx = Math.max(FLOOR.x + 10, Math.min(FLOOR.x + FLOOR.w - 10, controls.click.x));
      p.ty = Math.max(110, Math.min(650, controls.click.y));
    }
    if (typeof controls.numberKey === 'number') {
      state.pantryPick = Math.max(0, Math.min(5, controls.numberKey - 1));
    }
    if (controls.interact) events |= interact();
    if (controls.flash) events |= flashFry();
    if (controls.clear) events |= clearPlate();

    // Chopping and cooking advance on their own once started.
    if (state.board.item && state.board.progress < CHOP_SECONDS) {
      state.board.progress += dt;
      if (state.board.progress >= CHOP_SECONDS) {
        state.board.item = { ...state.board.item, state: 'chopped' };
        say(`Chopped ${state.board.item.kind} — pick it up.`);
      }
    }
    for (const burner of state.stove) {
      if (!burner.item) continue;
      burner.progress += dt;
      if (burner.progress >= BURN_SECONDS) {
        const c = centre(STATIONS.stove);
        popup('BURNT!', c.x, c.y - 60, '#ff5a3c');
        say(`Burnt the ${burner.item.kind}! Left on the stove too long.`);
        burner.item = null;
        burner.progress = 0;
        burner.flashed = false;
        state.burnt += 1;
        events |= EVENT_BURN;
      }
    }

    // Shift timer and the dinner rush.
    state.timeLeft -= dt;
    if (state.timeLeft <= RUSH_AT && !state.rush) {
      state.rush = true;
      state.rushAnnounced = true;
      popup('DINNER RUSH!', 660, 300, '#ff9a3c');
      say('Dinner rush! Orders are coming faster.');
      events |= EVENT_RUSH;
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      return events | EVENT_OVER;
    }

    // Orders arrive, patience runs out.
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.orders.length < MAX_ORDERS) {
      events |= spawnOrder();
      state.spawnTimer = state.rush ? RUSH_GAP : ORDER_GAP;
      if (state.orders.length === MAX_ORDERS) state.spawnTimer = 8;
    }
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        const recipe = recipeById(order.recipeId);
        state.orders.splice(i, 1);
        state.failed += 1;
        popup('WALKED OUT', 180, 200, '#ff5a3c');
        say(`${recipe.name} walked out — too slow.`);
        events |= EVENT_FAILED;
      }
    }

    if (state.messageTtl > 0) {
      state.messageTtl -= dt;
      if (state.messageTtl <= 0) state.message = '';
    }
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      state.popups[i].ttl -= dt;
      state.popups[i].y -= dt * 24;
      if (state.popups[i].ttl <= 0) state.popups.splice(i, 1);
    }
    return events;
  }

  function reset() {
    orderId = 0;
    const fresh = createWorld(random);
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh.state);
  }

  // A shift opens with one order already on the board — no empty first seconds.
  spawnOrder();

  return {
    state,
    step,
    reset,
    nearestStation,
    spawnOrder,
    bestKey: BEST_KEY,
  };
}
