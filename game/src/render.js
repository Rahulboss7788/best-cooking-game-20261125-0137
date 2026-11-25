// Ember & Thyme — everything the player sees, drawn on one canvas.
// Warm bistro flat art: raw ingredients pale, cooked ones warm and steaming,
// a finished plate glowing gold. No images, no fonts from the network.
import { COLOURS, FLOOR, RUSH_AT, STATIONS, VIEW } from './config.js';
import { INGREDIENTS, INGREDIENT_KEYS, RECIPES, ingredientLabel, recipeById, recipeForPlate } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, colour, weight = 'bold', align = 'left') {
  ctx.fillStyle = colour;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function steam(ctx, x, y, t) {
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i += 1) {
    const sx = x - 8 + i * 16;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.quadraticCurveTo(sx + 4, y - 8, sx - 2 + Math.sin(t * 3 + i) * 3, y - 16);
    ctx.stroke();
  }
}

/** Draw one ingredient at (x, y) with radius r. State changes its look. */
export function drawIngredient(ctx, kind, state, x, y, r, t = 0) {
  const ing = INGREDIENTS[kind];
  const base = state === 'raw' ? ing.rawColour : ing.colour;
  ctx.save();
  if (state === 'raw') {
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = 'rgba(43,26,16,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (kind === 'tomato') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4da24a';
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x - 5, y - r - 5);
    ctx.lineTo(x + 5, y - r - 5);
    ctx.closePath();
    ctx.fill();
    if (state === 'chopped') {
      ctx.strokeStyle = '#8a2f1d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x + r, y);
      ctx.stroke();
    }
  } else if (kind === 'onion') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,40,110,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'mushroom') {
    ctx.fillStyle = state === 'raw' ? '#a97a4e' : '#7a4a22';
    ctx.beginPath();
    ctx.arc(x, y - r * 0.25, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2e3c9';
    ctx.fillRect(x - r * 0.3, y - r * 0.3, r * 0.6, r * 0.9);
    if (state === 'chopped') {
      ctx.strokeStyle = '#5a3410';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x, y + r * 0.6);
      ctx.stroke();
    }
  } else if (kind === 'bread') {
    ctx.fillStyle = base;
    rr(ctx, x - r, y - r * 0.7, r * 2, r * 1.4, r * 0.6);
    ctx.fill();
    ctx.fillStyle = 'rgba(122,74,34,0.5)';
    rr(ctx, x - r, y - r * 0.7, r * 2, r * 0.45, r * 0.4);
    ctx.fill();
  } else if (kind === 'cheese') {
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(x - r, y + r * 0.7);
    ctx.lineTo(x + r, y + r * 0.7);
    ctx.lineTo(x, y - r);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(180,120,20,0.8)';
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y + r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.arc(x + r * 0.3, y + r * 0.35, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'herb') {
    ctx.strokeStyle = base;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.7);
      ctx.quadraticCurveTo(x + i * r * 0.7, y, x + i * r * 0.9, y - r * 0.8);
      ctx.stroke();
    }
  }
  if (state === 'cooked' && r >= 12) steam(ctx, x, y - r, t);
  ctx.restore();
}

function progressRing(ctx, x, y, r, frac, colour) {
  ctx.strokeStyle = 'rgba(43,26,16,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
}

function drawStation(ctx, name, rect, state, t, highlight) {
  const colours = {
    pantry: '#6b4a8a', board: '#a9713f', stove: '#3d3d46',
    garden: '#4d7a3a', counter: '#8a5a33', window: '#2e6f5e',
  };
  ctx.fillStyle = colours[name];
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = highlight ? COLOURS.gold : 'rgba(255,243,214,0.5)';
  ctx.lineWidth = highlight ? 4 : 2;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.stroke();
  text(ctx, rect.label, rect.x + rect.w / 2, rect.y + 15, 13, '#fff3d6', 'bold', 'center');
  text(ctx, rect.hint, rect.x + rect.w / 2, rect.y + rect.h - 10, 10, 'rgba(255,243,214,0.75)', 'normal', 'center');

  if (name === 'pantry') {
    INGREDIENT_KEYS.forEach((kind, i) => {
      drawIngredient(ctx, kind, 'raw', rect.x + 26 + i * 34, rect.y + 46, 11, t);
    });
  }
  if (name === 'board') {
    if (state.board.item) {
      drawIngredient(ctx, state.board.item.kind, state.board.item.state, rect.x + rect.w / 2, rect.y + 44, 13, t);
      if (state.board.progress < 2.2) progressRing(ctx, rect.x + rect.w / 2, rect.y + 44, 20, state.board.progress / 2.2, '#ffc93c');
      else text(ctx, 'READY', rect.x + rect.w / 2, rect.y + 70, 11, '#ffc93c', 'bold', 'center');
    } else {
      ctx.fillStyle = '#e8c98f';
      rr(ctx, rect.x + 30, rect.y + 34, 110, 26, 6);
      ctx.fill();
      text(ctx, 'empty board', rect.x + rect.w / 2, rect.y + 47, 11, '#7a5a30', 'normal', 'center');
    }
  }
  if (name === 'stove') {
    state.stove.forEach((burner, i) => {
      const bx = rect.x + 48 + i * 74;
      const by = rect.y + 46;
      ctx.fillStyle = '#22222a';
      ctx.beginPath();
      ctx.arc(bx, by, 19, 0, Math.PI * 2);
      ctx.fill();
      if (burner.item) {
        ctx.fillStyle = '#c94f2e';
        ctx.beginPath();
        ctx.arc(bx, by + 14, 6 + Math.sin(t * 8 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
        drawIngredient(ctx, burner.item.kind, 'cooked', bx, by - 4, 12, t);
        if (burner.progress < 3.5) progressRing(ctx, bx, by, 25, burner.progress / 3.5, '#ff9a3c');
        else if (burner.progress < 6) text(ctx, '✓', bx, by - 30, 14, '#ffc93c', 'bold', 'center');
        else text(ctx, '!', bx, by - 30, 14, '#ff5a3c', 'bold', 'center');
      }
    });
  }
  if (name === 'garden') {
    for (let i = 0; i < 5; i += 1) {
      drawIngredient(ctx, 'herb', 'raw', rect.x + 30 + i * 38, rect.y + 48, 12, t);
    }
  }
  if (name === 'counter') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + 48, 52, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = state.plate.length > 0 && recipeForPlate(state.plate) ? COLOURS.gold : '#c9a582';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + 48, 52, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    state.plate.forEach((item, i) => {
      drawIngredient(ctx, item.kind, item.state, rect.x + rect.w / 2 - 28 + i * 28, rect.y + 46, 11, t);
    });
    if (state.plate.length === 0) text(ctx, 'empty plate', rect.x + rect.w / 2, rect.y + 48, 11, '#7a5a30', 'normal', 'center');
  }
  if (name === 'window') {
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.arc(rect.x + rect.w / 2, rect.y + 40, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(rect.x + rect.w / 2 - 2, rect.y + 48, 4, 8);
    text(ctx, 'ring the bell!', rect.x + rect.w / 2, rect.y + 64, 11, '#fff3d6', 'normal', 'center');
  }
}

function drawOrderTicket(ctx, order, x, y, w, h, t) {
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.patience / order.maxPatience);
  ctx.fillStyle = '#fff8e6';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = frac < 0.3 ? '#ff5a3c' : '#c9a582';
  ctx.lineWidth = frac < 0.3 ? 3 : 2;
  rr(ctx, x, y, w, h, 8);
  ctx.stroke();
  text(ctx, `#${order.id}  ${recipe.name}`, x + 12, y + 20, 16, COLOURS.ink);
  text(ctx, `$${recipe.price} + tip`, x + w - 12, y + 20, 13, '#7a5a30', 'bold', 'right');
  recipe.needs.forEach((need, i) => {
    drawIngredient(ctx, need.kind, need.state, x + 30 + i * 44, y + 52, 14, t);
    text(ctx, need.state, x + 30 + i * 44, y + 76, 9, '#7a5a30', 'normal', 'center');
  });
  // Patience bar.
  ctx.fillStyle = '#e8dcc8';
  rr(ctx, x + 12, y + h - 18, w - 24, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5da24a' : frac > 0.25 ? '#ffc93c' : '#ff5a3c';
  if (frac > 0) {
    rr(ctx, x + 12, y + h - 18, (w - 24) * frac, 10, 5);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 12, y + h - 32, 11, '#7a5a30', 'bold', 'right');
}

export function createRenderer(canvas) {
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  const ctx = canvas.getContext('2d');

  function drawFloor(t) {
    ctx.fillStyle = COLOURS.wall;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = COLOURS.wallTop;
    ctx.fillRect(0, 0, VIEW.width, 64);
    // Chequered bistro floor.
    const tile = 40;
    for (let y = 64; y < VIEW.height; y += tile) {
      for (let x = 0; x < VIEW.width; x += tile) {
        ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? COLOURS.floor : COLOURS.floorAlt;
        ctx.fillRect(x, y, tile, tile);
      }
    }
    // Wall trim and hanging lamps.
    ctx.fillStyle = '#5a3410';
    ctx.fillRect(0, 64, VIEW.width, 6);
    for (let i = 0; i < 5; i += 1) {
      const lx = 360 + i * 160;
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath();
      ctx.arc(lx, 96, 10 + Math.sin(t * 2 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,201,60,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lx, 96, 20, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawChef(state, t) {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    // Shadow.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body (apron) and head.
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.arc(0, 6, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d94f3d';
    ctx.fillRect(-14, 2, 28, 6);
    ctx.fillStyle = '#f2c9a0';
    ctx.beginPath();
    ctx.arc(0, -12, 11, 0, Math.PI * 2);
    ctx.fill();
    // Chef hat.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -22, 7, 0, Math.PI * 2);
    ctx.arc(6, -22, 7, 0, Math.PI * 2);
    ctx.arc(0, -25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-11, -22, 22, 5);
    // Held ingredient floats above the hat.
    if (state.held) {
      ctx.fillStyle = 'rgba(255,243,214,0.95)';
      ctx.beginPath();
      ctx.arc(0, -44, 17, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, state.held.kind, state.held.state, 0, -44, 11, t);
    }
    ctx.restore();
  }

  function drawHud(state, screen) {
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    const timer = `${mins}:${String(secs).padStart(2, '0')}`;
    const urgent = state.timeLeft <= 30;
    text(ctx, 'EMBER & THYME', 20, 34, 24, '#fff3d6');
    text(ctx, 'a neighbourhood bistro', 250, 36, 13, 'rgba(255,243,214,0.7)', 'normal');
    text(ctx, `🪙 $${state.coins}`, 560, 34, 20, COLOURS.gold);
    text(ctx, `Served ${state.served} · Walked out ${state.failed}`, 700, 34, 15, '#fff3d6', 'normal');
    ctx.fillStyle = urgent && Math.floor(performance.now() / 300) % 2 === 0 ? '#ff5a3c' : '#fff3d6';
    ctx.font = `bold ${urgent ? 34 : 28}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⏱ ${timer}`, 1165, 34);
    ctx.textAlign = 'left';
    if (state.rush) {
      ctx.fillStyle = '#ff9a3c';
      rr(ctx, 945, 12, 105, 40, 8);
      ctx.fill();
      text(ctx, 'DINNER RUSH', 997, 32, 13, '#2b1a10', 'bold', 'center');
    }
    // Shift progress bar.
    ctx.fillStyle = 'rgba(255,243,214,0.3)';
    ctx.fillRect(560, 52, 400, 6);
    ctx.fillStyle = COLOURS.gold;
    ctx.fillRect(560, 52, 400 * (1 - state.timeLeft / 180), 6);
  }

  function drawOrderBoard(state, t) {
    ctx.fillStyle = 'rgba(43,26,16,0.85)';
    rr(ctx, 12, 76, 292, 470, 12);
    ctx.fill();
    text(ctx, 'ORDER BOARD', 158, 100, 18, '#ffc93c', 'bold', 'center');
    if (state.orders.length === 0) {
      text(ctx, 'No orders yet —', 158, 200, 14, '#fff3d6', 'normal', 'center');
      text(ctx, 'the lunch crowd is coming.', 158, 224, 14, '#fff3d6', 'normal', 'center');
    }
    state.orders.forEach((order, i) => {
      drawOrderTicket(ctx, order, 26, 122 + i * 118, 264, 104, t);
    });
    // Queue preview: what is coming next.
    text(ctx, 'COMING UP NEXT', 158, 490, 13, '#ffc93c', 'bold', 'center');
    if (state.queue.length === 0) {
      text(ctx, '—', 158, 518, 14, '#fff3d6', 'normal', 'center');
    }
    state.queue.slice(0, 2).forEach((recipeId, i) => {
      const recipe = recipeById(recipeId);
      text(ctx, `${i + 1}. ${recipe.name}  ($${recipe.price})`, 40, 518 + i * 22, 13, '#fff3d6', 'normal');
    });
  }

  function drawSidePanel(state, t) {
    ctx.fillStyle = 'rgba(43,26,16,0.85)';
    rr(ctx, 1012, 76, 256, 470, 12);
    ctx.fill();
    text(ctx, 'YOUR PLATE', 1140, 100, 18, '#ffc93c', 'bold', 'center');
    const recipe = recipeForPlate(state.plate);
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(1140, 170, 86, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    if (recipe) {
      ctx.save();
      ctx.shadowColor = COLOURS.gold;
      ctx.shadowBlur = 24;
      ctx.strokeStyle = COLOURS.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(1140, 170, 86, 34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      text(ctx, `✓ ${recipe.name} — READY!`, 1140, 226, 16, '#ffc93c', 'bold', 'center');
    } else if (state.plate.length > 0) {
      text(ctx, 'mid-assembly…', 1140, 226, 14, '#fff3d6', 'normal', 'center');
    } else {
      text(ctx, 'empty — add food at the counter', 1140, 226, 12, 'rgba(255,243,214,0.7)', 'normal', 'center');
    }
    state.plate.forEach((item, i) => {
      drawIngredient(ctx, item.kind, item.state, 1080 + i * 60, 168, 18, t);
    });
    text(ctx, `In hand: ${state.held ? ingredientLabel(state.held) : 'nothing'}`, 1032, 258, 14, '#fff3d6', 'normal');
    text(ctx, 'RECIPE BOOK', 1140, 296, 15, '#ffc93c', 'bold', 'center');
    RECIPES.forEach((r, i) => {
      const y = 322 + i * 42;
      text(ctx, `${r.name} — $${r.price}`, 1032, y, 13, '#fff3d6', 'normal');
      r.needs.forEach((need, j) => {
        drawIngredient(ctx, need.kind, need.state, 1244 - (r.needs.length - 1 - j) * 22, y, 8, t);
      });
      text(ctx, r.blurb, 1032, y + 16, 10, 'rgba(255,243,214,0.65)', 'normal');
    });
  }

  function drawBottomBar(state) {
    ctx.fillStyle = 'rgba(43,26,16,0.9)';
    rr(ctx, 12, 656, 1256, 132, 12);
    ctx.fill();
    // Pantry picker chips.
    text(ctx, 'PANTRY — press 1-6 or click:', 30, 684, 13, '#ffc93c', 'bold');
    INGREDIENT_KEYS.forEach((kind, i) => {
      const x = 30 + i * 108;
      const selected = state.pantryPick === i;
      ctx.fillStyle = selected ? COLOURS.gold : '#5a3a22';
      rr(ctx, x, 696, 98, 40, 8);
      ctx.fill();
      drawIngredient(ctx, kind, 'raw', x + 18, 716, 10);
      text(ctx, `${i + 1} ${INGREDIENTS[kind].name}`, x + 32, 716, 12, selected ? '#2b1a10' : '#fff3d6', 'bold');
    });
    text(ctx, 'WASD / arrows move · click a station to walk there · E interact · F flash fry · Q clear plate · P pause', 30, 758, 13, '#fff3d6', 'normal');
    if (state.message) {
      text(ctx, state.message, 1240, 716, 14, '#ffc93c', 'bold', 'right');
    }
    // Flash fry explainer.
    text(ctx, 'FLASH FRY (F at stove): cooks instantly, but the tip shrinks 15%. Herb garden: free thyme, no chopping.', 30, 776, 11, 'rgba(255,243,214,0.65)', 'normal');
  }

  function drawPopups(state) {
    for (const popup of state.popups) {
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = popup.colour;
      ctx.fillText(popup.text, popup.x, popup.y);
    }
    ctx.textAlign = 'left';
  }

  function drawOverlay(title, lines, footer) {
    ctx.fillStyle = 'rgba(20,10,5,0.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = '#fff8e6';
    rr(ctx, 340, 180, 600, 420, 16);
    ctx.fill();
    text(ctx, title, 640, 240, 40, COLOURS.ink, 'bold', 'center');
    lines.forEach((line, i) => {
      text(ctx, line, 640, 310 + i * 34, 17, '#5a3a22', 'normal', 'center');
    });
    text(ctx, footer, 640, 540, 16, '#8a5a2b', 'bold', 'center');
  }

  return {
    draw(state, screen, best, nearest) {
      const t = performance.now() / 1000;
      drawFloor(t);
      if (screen === SCREEN_TITLE) {
        drawHud(state, screen);
        drawOrderBoard(state, t);
        for (const [name, rect] of Object.entries(STATIONS)) drawStation(ctx, name, rect, state, t, false);
        drawChef(state, t);
        drawSidePanel(state, t);
        drawBottomBar(state);
        drawOverlay('EMBER & THYME', [
          'A cosy neighbourhood bistro. Orders are coming in —',
          'chop, cook, plate and serve before patience runs out.',
          'Flash-fry at the stove when the rush hits,',
          'but a rushed dish earns a smaller tip.',
          'Shift: 3 minutes. Serve well, earn well.',
        ], 'Press SPACE or click to start  ·  WASD / arrows to move  ·  E to interact');
        return;
      }
      drawHud(state, screen);
      drawOrderBoard(state, t);
      for (const [name, rect] of Object.entries(STATIONS)) {
        drawStation(ctx, name, rect, state, t, nearest === name);
      }
      drawChef(state, t);
      drawSidePanel(state, t);
      drawBottomBar(state);
      drawPopups(state);
      if (screen === SCREEN_PAUSED) {
        drawOverlay('PAUSED', ['Take a breath. The orders will wait —', 'barely.'], 'Press P or SPACE to keep cooking');
      }
      if (screen === SCREEN_OVER) {
        const bestLine = state.coins > best ? 'New best shift!' : `Best shift: $${best}`;
        drawOverlay('SHIFT OVER', [
          `You earned $${state.coins} and served ${state.served} dishes.`,
          `${state.failed} order${state.failed === 1 ? '' : 's'} walked out. ${state.burnt} dish${state.burnt === 1 ? '' : 'es'} burnt.`,
          bestLine,
          'The bistro closes — but tomorrow the lunch crowd returns.',
        ], 'Press SPACE or click to cook another shift');
      }
    },
  };
}
