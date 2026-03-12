# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
A single-page static website for a live event prize draw. Displays a 49-seat bus map; clicking "Draw" runs a rolling highlight animation and lands on a random winner (gold pulsing seat). No repeats — each seat wins only once. Reset clears all state.

## Running Locally
Open `index.html` directly in a browser — no build step, no server needed.

## Tech Stack
Pure HTML5 + CSS3 + Vanilla JavaScript. Three files: `index.html`, `style.css`, `script.js`.

## Bus Layout
- Rows 1–11: 4 seats/row → 2 left | aisle | 2 right (seats 1–44)
- Row 12 (last): 5 seats → 2 left | aisle | 3 right (seats 45–49)
- Grid built dynamically in `script.js` → `buildGrid()`

## Key JS Patterns
- `available[]` tracks undrawn seat IDs; `winners[]` tracks drawn ones
- Winner is decided upfront via `Math.random()` before animation starts
- `ROLL_STEPS` in `script.js` controls the animation speed schedule (fast → slow)
- Seat CSS classes: `.seat` (default) · `.rolling` (animation flash) · `.winner` (gold pulse) · `.picked` (already drawn)

## Hosting (GitHub Pages)
1. Push repo to GitHub (public or private)
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Live URL: `https://<username>.github.io/randomizer`
4. **Cost: $0**
