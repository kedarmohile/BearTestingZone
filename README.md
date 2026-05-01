# Mohile Family Bears: Honeywood Saga

React/Vite SPA game prototype for the Mohile Family Bears universe.

## Current Game

Honeywood Saga is pivoting from a custom toy prototype toward a sourced RPG foundation. The current playable route mounts a Phaser-based Honeywood slice where Bruno Bear collects Brave Honey, uses Storm Paw, avoids/stuns a ranger, and completes the Picnic Basket rescue quest.

## Foundation Direction

Standing rule: search hard before creating. Use mature open-source foundations first, then modify for Mohile Family Bears.

Chosen direction:

- Reldens as the main RPG/MMO systems reference
- Phaser for browser gameplay runtime
- Colyseus for future online multiplayer
- React/Vite for landing, story, menus, character select, inventory, and settings

## Current Systems

- Phaser gameplay surface
- Bruno Bear playable prototype
- Brave Honey Basket Rescue quest
- Character/equipment/power data manifests
- Offline bot planning data
- GitHub Pages deployment workflow

## Tech

- React + Vite
- Phaser
- Colyseus client dependencies for later online play
- Reldens items/skills/modifiers packages for RPG-system direction
- Three.js remains only for legacy/story prototype surfaces

## Run

```bash
npm install
npm run dev
```

Local development opens at:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

## Public URL

The GitHub Pages deployment is configured for:

```text
https://kedarmohile.github.io/BearTestingZone/
```

If the URL is not live yet, enable GitHub Pages for this repository with source set to GitHub Actions, then rerun the Deploy to GitHub Pages workflow.
