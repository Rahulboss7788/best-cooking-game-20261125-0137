// Ember & Thyme — ingredients and recipes.
// An ingredient has a state: raw -> chopped -> cooked. A recipe is an exact
// multiset of prepared ingredients; the plate matches only when it holds
// exactly those, nothing more, nothing less.

export const INGREDIENTS = {
  tomato: { name: 'Tomato', key: '1', colour: '#e4572e', rawColour: '#f2a18d', chop: true, cook: true },
  onion: { name: 'Onion', key: '2', colour: '#b678c9', rawColour: '#d9b8e6', chop: true, cook: false },
  mushroom: { name: 'Mushroom', key: '3', colour: '#8a5a2b', rawColour: '#c9a582', chop: true, cook: true },
  bread: { name: 'Bread', key: '4', colour: '#d9a441', rawColour: '#e8c98f', chop: false, cook: true },
  cheese: { name: 'Cheese', key: '5', colour: '#f2c230', rawColour: '#f7dc7d', chop: false, cook: true },
  herb: { name: 'Herb', key: '6', colour: '#4da24a', rawColour: '#8fce7d', chop: false, cook: false },
};
export const INGREDIENT_KEYS = ['tomato', 'onion', 'mushroom', 'bread', 'cheese', 'herb'];

/** A prepared ingredient: { kind, state } where state is 'raw' | 'chopped' | 'cooked'. */
export function makeIngredient(kind, state = 'raw') {
  return { kind, state };
}

export function ingredientLabel(item) {
  if (!item) return '';
  const base = INGREDIENTS[item.kind].name;
  if (item.state === 'chopped') return `Chopped ${base}`;
  if (item.state === 'cooked') return `Cooked ${base}`;
  return base;
}

export const RECIPES = [
  {
    id: 'soup',
    name: 'Tomato Soup',
    price: 18,
    needs: [
      { kind: 'tomato', state: 'cooked' },
      { kind: 'herb', state: 'raw' },
    ],
    blurb: 'Slow-simmered tomato, fresh thyme.',
  },
  {
    id: 'toast',
    name: 'Mushroom Toast',
    price: 16,
    needs: [
      { kind: 'bread', state: 'raw' },
      { kind: 'mushroom', state: 'cooked' },
    ],
    blurb: 'Crusty bread, pan-fried mushrooms.',
  },
  {
    id: 'salad',
    name: 'Garden Salad',
    price: 14,
    needs: [
      { kind: 'tomato', state: 'chopped' },
      { kind: 'onion', state: 'chopped' },
      { kind: 'herb', state: 'raw' },
    ],
    blurb: 'No stove, all crunch. Fast money.',
  },
  {
    id: 'melt',
    name: 'Cheese Melt',
    price: 20,
    needs: [
      { kind: 'bread', state: 'cooked' },
      { kind: 'cheese', state: 'cooked' },
    ],
    blurb: 'Golden bread, bubbling cheese.',
  },
  {
    id: 'skillet',
    name: 'Ember Skillet',
    price: 24,
    needs: [
      { kind: 'mushroom', state: 'cooked' },
      { kind: 'cheese', state: 'cooked' },
    ],
    blurb: 'The house special. Two pans, one plate.',
  },
];

/** True when the plate's items are exactly the recipe's needs (order-free). */
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.needs.length) return false;
  const remaining = recipe.needs.map((n) => `${n.kind}:${n.state}`);
  for (const item of plate) {
    const key = `${item.kind}:${item.state}`;
    const at = remaining.indexOf(key);
    if (at === -1) return false;
    remaining.splice(at, 1);
  }
  return remaining.length === 0;
}

/** The recipe a plate completes, or null. */
export function recipeForPlate(plate) {
  for (const recipe of RECIPES) {
    if (plateMatchesRecipe(plate, recipe)) return recipe;
  }
  return null;
}

/** The recipe an order asks for, by id. */
export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}
