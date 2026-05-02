# Mohile Family Bears: Honeywood Tycoon

React/Vite SPA game prototype for the Mohile Family Bears universe.

## Current Game

Honeywood Saga is now being rebuilt from a sourced open-source RPG foundation instead of the earlier chess-like prototype. The playable scene uses Reldens-derived Phaser RPG map, sprite, item, and audio assets as the visual/runtime foundation, adapted into a Mohile Family Bears quest world.

New combat and skill layers are kid-friendly:

- Mythic bear powers inspired by Ragnarok-scale fantasy, but with cartoon knockbacks, shields, roots, light, and thunder instead of blood or gore.
- Honey Drone stage where players scan, shield, and stun ranger signal towers from the sky.
- Ranger Magnus is defeated by courage, festival progress, and family teamwork.

Current playable loop:

- Move through a sourced RPG town map with WASD, arrow keys, or click-to-move.
- Choose Bruno, Memi, Mumma, Papa, or Cubby as the active bear hero.
- Gather family favors at world stations.
- Use SPACE for the selected bear power.
- Use E to launch the Honey Drone against Magnus signal pressure.
- Restore the Great Picnic after Ranger Magnus retreats safely.

## Game Direction

The project is pivoting from a custom prototype toward an engine-backed isometric RPG/MMO foundation. The standing rule is to evaluate open-source foundations first, then modify and extend the best fit for Mohile Family Bears.

Planning docs:

- [Engine Decision](docs/ENGINE_DECISION.md)
- [Foundation Scan](docs/FOUNDATION_SCAN.md)
- [Character And Equipment System](docs/CHARACTER_AND_EQUIPMENT_SYSTEM.md)
- [Visual Asset Pipeline](docs/VISUAL_ASSET_PIPELINE.md)
- [Audio Pipeline](docs/AUDIO_PIPELINE.md)
- [Commercial Game Roadmap](docs/COMMERCIAL_GAME_ROADMAP.md)

## Tech

- React + Vite
- Three.js via `@react-three/fiber`
- `@react-three/drei` for scene helpers
- Framer Motion for page transitions
- Phaser for the sourced RPG world scene
- Reldens open-source assets as the current foundation source

## Run

```bash
npm install
npm run dev
```

Local development opens at:

```text
http://localhost:5173/
```

For GitHub Pages base-path testing in Vite, use:

```text
http://localhost:5173/BearTestingZone/
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

## Open Source Attribution

The current world scene uses selected assets from Reldens by Damian Alberto Pastorini, used under the MIT License. During local development, a copy of the license is included at:

```text
public/assets/reldens/LICENSE
```
