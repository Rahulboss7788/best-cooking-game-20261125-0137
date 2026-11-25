// Ember & Thyme — the screenshot scenes behind ?shot=cover|rush|tense|serve.
// Each scene sets the real game state (real orders, real plate, real timers)
// and returns the screen to draw, so every screenshot is a frame of the
// actual game, staged at a moment a real shift reaches.
import { SCREEN_PLAY } from './render.js';
import { makeIngredient } from './recipes.js';

function order(id, recipeId, patience, maxPatience) {
  return { id, recipeId, patience, maxPatience };
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * Any other name is the cover.
 */
export function stageShot(name, world) {
  world.reset();
  const st = world.state;
  st.coins = 34;
  st.served = 2;
  st.timeLeft = 134;
  st.spawnTimer = 14;
  st.queue = ['toast', 'skillet'];
  st.orders = [
    order(1, 'soup', 82, 95),
    order(2, 'salad', 54, 90),
    order(3, 'melt', 38, 100),
  ];
  st.player.x = 685;
  st.player.y = 260;

  if (name === 'rush') {
    st.timeLeft = 38;
    st.rush = true;
    st.coins = 58;
    st.served = 4;
    st.orders = [
      order(4, 'skillet', 12, 95),
      order(5, 'soup', 47, 90),
      order(6, 'toast', 71, 100),
    ];
    st.queue = ['salad', 'melt'];
    st.plate = [makeIngredient('bread', 'raw')];
    st.stove[0].item = makeIngredient('mushroom', 'cooked');
    st.stove[0].progress = 2.1;
    st.stove[1].item = makeIngredient('cheese', 'cooked');
    st.stove[1].progress = 1.2;
    st.board.item = makeIngredient('tomato', 'chopped');
    st.board.progress = 2.2;
    st.player.x = 895;
    st.player.y = 260;
    st.message = 'Dinner rush! Orders are coming faster.';
    st.messageTtl = 5;
  } else if (name === 'tense') {
    st.timeLeft = 12;
    st.rush = true;
    st.coins = 71;
    st.served = 5;
    st.orders = [
      order(7, 'melt', 6, 100),
      order(8, 'salad', 33, 90),
    ];
    st.queue = ['soup'];
    st.plate = [makeIngredient('bread', 'cooked')];
    st.board.item = makeIngredient('mushroom', 'chopped');
    st.board.progress = 2.2;
    st.stove[0].item = makeIngredient('cheese', 'cooked');
    st.stove[0].progress = 3.4;
    st.player.x = 685;
    st.player.y = 500;
    st.held = makeIngredient('cheese', 'cooked');
    st.message = 'Six seconds on that melt — plate it!';
    st.messageTtl = 5;
  } else if (name === 'serve') {
    st.timeLeft = 65;
    st.coins = 86;
    st.served = 6;
    st.orders = [order(9, 'skillet', 61, 95)];
    st.queue = ['toast', 'salad'];
    st.plate = [makeIngredient('mushroom', 'cooked'), makeIngredient('cheese', 'cooked')];
    st.player.x = 895;
    st.player.y = 500;
    st.message = 'Ember Skillet is ready — serve it at the window!';
    st.messageTtl = 5;
  } else {
    // Cover: the fullest frame — three orders, a finished plate glowing,
    // a dish mid-assembly on the board and stove, timer running.
    st.plate = [
      makeIngredient('tomato', 'chopped'),
      makeIngredient('onion', 'chopped'),
      makeIngredient('herb', 'raw'),
    ];
    st.board.item = makeIngredient('mushroom', 'raw');
    st.board.progress = 1.1;
    st.stove[0].item = makeIngredient('cheese', 'cooked');
    st.stove[0].progress = 2.4;
    st.held = makeIngredient('tomato', 'raw');
    st.message = 'Garden Salad is ready — serve it at the window!';
    st.messageTtl = 5;
  }
  return { screen: SCREEN_PLAY, best: 86 };
}
