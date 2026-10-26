# Shared development server

portRange: 5176-5176
preferredPort: 5176

Stealth & Steel owns 5176. BIS owns 5174 and its faucet API owns 5190.
Use `npm run dev`; reuse the healthy, ownership-verified server. Never fall
through to another port, stop an existing preview, or migrate wallet storage.

All starts share `output/run-state/startup.lock`. The installed run helper
hands its lock token to the root launcher. Report stale locks for explicit
recovery rather than stealing them. Isolated tests require `--isolated --port
<test-port>` and separate run-state directories. AI-created game URLs always
include `?muteMusic=true&muteSFX=true`.
