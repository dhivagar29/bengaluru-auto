# Bengaluru Auto

Live: _pending_

A desktop-first, first-person auto-rickshaw joyride through a compact, stylized Bengaluru. Warm afternoon light, coffee shops, leafy streets, a little traffic, and no hurry.

## Run

```sh
npm i && npm run dev
```

Open the URL printed by Vite. Click **Let’s take a ride** to start audio and capture the mouse. No account, API keys, backend, or downloaded game assets required.

```sh
npm run build     # TypeScript check + production bundle in dist/
npm run preview   # Serve production bundle
npm test          # Driving and collision tests (Node 20.19+ or 22.12+)
```

## Controls

| Control | Action |
| --- | --- |
| WASD / Arrow keys | Accelerate, reverse, steer |
| Space / Shift | Brake |
| Mouse | Look around while captured |
| Esc | Release mouse and pause |
| H | Horn |
| M / music button | Mute / unmute |
| R | Reset auto to the starting road |

Steering needs movement. Slow down for corners. Esc pauses the ride; click Resume to continue. If mouse capture is unavailable, keyboard driving still works. The question-mark button shows controls. Losing window focus stops input and pauses.

## In this version

- One continuous miniature district: dense Koramangala shops connect to leafy Indiranagar / 100 Feet Road.
- Procedural low-poly buildings, café signs, canopy, zebra crossings, streetlights, parked traffic, green/yellow/black autos, and a metro hint.
- First-person cockpit, working speedometer, neighborhood map, odometer, synthesized engine ambience, and horn.
- Two repeatable pickup → drop-off fares. Stop below 7.2 km/h inside the gold marker to collect a passenger; stop at the mint marker to earn ₹85 or ₹95. Or ignore fares and explore.
- Arcade acceleration, reversing and braking; road corridor collisions and world bounds prevent leaving the map. Reset keeps trip progress.
- All visuals and audio generated locally. Session-only earnings; reload starts a new day.

## Stack

Vite + TypeScript + React + React Three Fiber + @react-three/drei + three. Browser only; hardware-accelerated WebGL required. No backend. No GitHub/Vercel remotes or deployment configured.

## Scope

Fictional, compact geography inspired by Bengaluru, not a geographic reconstruction. Parked traffic is decorative; collisions clamp to road boundaries rather than simulating vehicle impacts. Mirror is decorative. Desktop keyboard/mouse only. No OSM, multiplayer, complex NPC AI, monetization, photorealism, mobile driving controls, or saved progress.

## Verification

Physics tests passed using locally available transpilation tooling. Dependency installation is blocked by this workspace’s restricted network, so the production build and browser checks are pending. See [VERIFICATION.md](VERIFICATION.md) for evidence and the smoke-test checklist.
