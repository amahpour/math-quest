# Math Quest

A 4th-grade math game suite built as a single-page static site. Two games share a menu:

- **Jeopardy!** — classic 5×5 board with two visual themes (Classic Arena and Chalkboard), 2–4 teams, Daily Doubles, Final Jeopardy, buzz-in via keys `1`–`4`, teacher-judged scoring.
- **Gem Quest** — first-person raycast adventure. Walk the map collecting gems, unlock the portal at 50 gems, trade 100 gems for a banana, reach 10 bananas to win. Press `J` any time to wager energy on a math question. A bonus quiz pops up every 10 gems.

All questions are drawn from a 4th-grade **fractions chapter test** (items 4–31), rendered as proper LaTeX via [KaTeX](https://katex.org/).

## Run locally

No build step — serve the `app/` directory with any static server.

```sh
cd app
python3 -m http.server 8765
# then open http://localhost:8765
```

## Structure

```
app/
├── index.html              # entry point; loads React + Babel + KaTeX via CDN
├── tex.jsx                 # <MQMath> helper that renders $...$ segments via KaTeX
├── questions.js            # Jeopardy board (5 categories × 5 clues + Final)
├── mc-questions.js         # Gem Quest multiple-choice bank
├── themes.js               # visual themes for Jeopardy (Classic, Chalkboard)
├── sounds.js               # synthesized Web Audio SFX
├── hub.jsx                 # main menu (game picker)
├── game-core.jsx           # Jeopardy state machine
├── game-views.jsx          # Jeopardy board / clue / scoreboard / final views
├── gemquest-main.jsx       # Gem Quest state + input + HUD
├── gemquest-world.jsx      # tile map, gem spawning, sprite helpers
├── gemquest-1p.jsx         # first-person raycasting renderer
└── gemquest-modals.jsx     # quiz / wager / shop / game-over modals
```

## Controls

### Jeopardy
- Click a tile to select a clue
- `1`–`4` — team buzz-in (matches team color)
- Teacher clicks ✓ / ✗ to judge

### Gem Quest
- `W` `A` `S` `D` — move / strafe
- `←` `→` — turn
- `J` — open a Jeopardy wager (needs ≥ 500 energy)

## Quiz rules

- Every multiple-choice question must be answered correctly. Wrong answer → a new question appears until you get one right. The wager (or the bonus) only resolves on a correct answer.

## Credits

- Designs mocked up in [Claude Design](https://claude.ai/design) and exported as a handoff bundle.
- Implementation by Claude Code working from the design bundle.

## License

MIT — see [LICENSE](LICENSE).
