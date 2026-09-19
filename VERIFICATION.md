# Verification — Bengaluru Auto

## Local (ship host)

| Check | Result |
| --- | --- |
| `npm install` | Green (React pinned 19.2.8 for R3F peer range) |
| `npm test` | 3/3 physics tests pass |
| `npm run build` | `tsc -b` + Vite production bundle green (`dist/`) |

Early Codex sandbox run could not reach the registry (`tsc` missing). That is obsolete — deps and build were completed before push to `main` (`76dd785`+) and Vercel Import.

## Production

| Check | Result |
| --- | --- |
| Live URL | https://bengaluru-fp-auto.vercel.app |
| Vercel project | `bengaluru-fp-auto` (connector name `bengaluru-auto` was ghosted) |
| Cold load | HTTP 200 (Doug); Mafee acceptance in progress |

## Smoke checklist (browser)

1. Click **Let’s take a ride** — pointer lock / look works
2. WASD drive; Space/Shift brake; Esc pause
3. Koramangala denser shops → Indiranagar leafy strip readable
4. Optional fare pickup/drop toast
5. Collision clamp — no void yeet
