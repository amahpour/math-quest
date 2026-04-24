# Agent brief — math-quest

One-page brief for AI coding agents working on this repo. Read this first.

## What this is

A static site with two games served from `app/`. No build step: React + Babel Standalone + KaTeX all loaded from CDN in `app/index.html`. JSX files are transpiled in the browser.

- **Hub** → picks between Jeopardy and Gem Quest
- **Jeopardy** → 5×5 board, teams, buzz-in, Daily Doubles, Final. Lives in `game-core.jsx` + `game-views.jsx`.
- **Gem Quest** → first-person raycast adventure. Lives in `gemquest-*.jsx` files (5 of them).

## Run & preview

```sh
cd app
python3 -m http.server 8765
# open http://localhost:8765
```

Live deploy (auto on push to `main`): https://amahpour.github.io/math-quest

## Verification loop

Agents without a browser tool should use Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

Tests live in `tests/` and hit the golden paths (hub renders, both games open, KaTeX renders fractions).

Any PR that touches gameplay should keep `npm test` green.

## Where to change things

| Task | File |
|---|---|
| Add / edit a Jeopardy clue | `app/questions.js` |
| Add / edit a Gem Quest multiple-choice question | `app/mc-questions.js` |
| Tweak Jeopardy visuals (Classic vs Chalkboard) | `app/themes.js` |
| Sound effects | `app/sounds.js` |
| Jeopardy state / phase transitions | `app/game-core.jsx` |
| Jeopardy screens (board, clue, final, etc.) | `app/game-views.jsx` |
| Gem Quest map, gem spawning, tile types | `app/gemquest-world.jsx` |
| Gem Quest input / HUD / mode transitions | `app/gemquest-main.jsx` |
| Gem Quest 3D rendering (raycaster) | `app/gemquest-1p.jsx` |
| Gem Quest modals (quiz, shop, wager, game over) | `app/gemquest-modals.jsx` |
| Home / menu screen | `app/hub.jsx` |
| Math formatting (KaTeX) | `app/tex.jsx` — use `<window.MQMath src="..." />`; wrap math in `$...$` |

## Conventions

- **LaTeX in questions**: Strings passed to `<window.MQMath>` render math segments between `$...$`. Use `\\frac{a}{b}` for block fractions, `\\tfrac{a}{b}` for inline (e.g., next to a whole number: `3\\tfrac{1}{8}`).
- **Globals via `window`**: Files don't use ES module imports. Each file attaches its exports to `window` at the bottom (`Object.assign(window, { ... })`) and siblings read them as `window.X`.
- **No build step**: Don't introduce bundlers, TypeScript, or `package.json` runtime deps for the app. Keep `app/` CDN-only. `package.json` at the repo root is *only* for Playwright tests.
- **Static-friendly paths**: All asset paths in `index.html` are relative. Don't hardcode absolute URLs; GitHub Pages serves from `/math-quest/`.

## Game rules reference

- **Portal** unlocks at 50 gems (Gem Quest HUD threshold).
- **Banana** costs 100 gems in the shop; 10 bananas → win.
- **Energy**: starts at 800; drains only while the player is moving.
- **Bonus quiz**: auto-triggers every 10 gems (no wager; wrong answer re-rolls until correct).
- **Wager quiz (J)**: requires ≥ 500 energy; correct → +wager energy, wrong → new question until correct.
- **Questions**: drawn from a 4th-grade fractions chapter test (items 4–31 only; items 1–3 were visual diagrams and are excluded).

## Things NOT to do

- Don't reintroduce `design-canvas.jsx` or the multi-artboard `DesignCanvas` layout — it was removed intentionally (design-time only).
- Don't add a passive energy drain timer — the user specifically removed that.
- Don't change the quiz flow so wrong answers close the modal — the rule is "100% required, new question on wrong."
