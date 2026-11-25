// Ember & Thyme — keyboard and mouse input.
// WASD / arrows move, E interacts, F flash-fries, Q clears the plate,
// 1-6 pick from the pantry, Space/Enter confirms on menus, P pauses.
// Clicking a station walks the chef toward it and interacts on arrival;
// clicking a pantry ingredient picks it up when in range.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_INTERACT = 4;
export const ACTION_FLASH = 8;
export const ACTION_CLEAR = 16;

const MOVE_KEYS = {
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
};

export function createInput(canvas, onCanvasClick) {
  const held = new Set();
  let actions = 0;
  let numberQueue = [];
  let mouse = { x: 0, y: 0 };

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const code = event.code;
    held.add(code);
    if (code === 'Space' || code === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    }
    if (code === 'KeyP' || code === 'Escape') actions |= ACTION_PAUSE;
    if (code === 'KeyE') actions |= ACTION_INTERACT;
    if (code === 'KeyF') actions |= ACTION_FLASH;
    if (code === 'KeyQ') actions |= ACTION_CLEAR;
    if (/^Digit[1-6]$/.test(code)) numberQueue.push(Number(code.slice(5)));
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse = {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
    if (onCanvasClick) onCanvasClick(mouse.x, mouse.y);
  });

  return {
    /** Normalised movement vector from held keys. */
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const dir = MOVE_KEYS[code];
        if (dir) {
          x += dir[0];
          y += dir[1];
        }
      }
      if (x === 0 && y === 0) return { x: 0, y: 0 };
      const len = Math.hypot(x, y);
      return { x: x / len, y: y / len };
    },
    /** One-shot actions since the last call. */
    takeActions() {
      const out = actions;
      actions = 0;
      return out;
    },
    /** The pantry number key (1-6) pressed since the last call, or null. */
    takeNumberKey() {
      if (numberQueue.length === 0) return null;
      const key = numberQueue.shift();
      numberQueue = [];
      return key;
    },
    mouse() {
      return mouse;
    },
  };
}
