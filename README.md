[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Rahulboss7788/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Rahulboss7788/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Ember & Thyme

An entry for make.fun's **best-cooking-game-20261125-0137** — a cosy neighbourhood
bistro cooking game that runs in a desktop browser from static files, with no
network requests.

You are the chef of Ember & Thyme. Orders land on the board with a patience
timer: walk the kitchen, pick ingredients from the pantry (or fresh thyme from
the herb garden), chop them on the board, cook them on the stove, assemble the
dish on the plate, and serve it at the window before the customer walks out.
Five recipes combine the same six ingredients in different ways, so every
order pushes you to plan a different route through the kitchen. The last 45
seconds of the 3-minute shift are the dinner rush — orders arrive faster.

Signature move: **Flash Fry** (F at the stove) cooks a pan instantly, but the
rushed dish earns a 15% smaller tip. The herb garden is the shortcut: free
thyme, no chopping, no stove.

## Run it

Open `game/index.html` in desktop Chrome, or serve it locally:

```sh
node serve.ts
# then open http://localhost:8080
```

Build the hand-in bundle (writes `out/dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How to play

- **WASD / arrows** — move the chef. **Click** a station to walk there.
- **1–6** or click — pick an ingredient from the pantry.
- **E** — interact: take, chop, cook, plate, serve.
- **F** — flash fry at the stove (instant cook, smaller tip).
- **Q** — clear the plate / toss what you hold.
- **P** — pause. **Space** — start / restart.

Watch the order board: the patience bar and the "coming up next" preview tell
you what to cook before it is even ordered. A finished plate glows gold —
serve it at the window.

<sub>Entered on [make.fun](https://make.fun/?ref=xt0p49wj&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
