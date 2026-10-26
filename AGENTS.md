# Repository Agent Instructions

## Shared development server

- The fixed Stealth & Steel frontend port is `5176`. BIS owns `5174` and its faucet API owns `5190`.
- Use `npm run dev` from the root. Reuse the healthy ownership-verified server. Do not silently select another port, terminate a preview, or migrate wallet storage.
- The launcher and installed run helper share `output/run-state/startup.lock`. Report stale locks for explicit recovery; never steal them. An unhealthy or occupied port requires inspection and explicit restart approval.
- Explicit isolated tests use `npm run dev -- --isolated --port <test-port>` and separate run-state directories. Do not replace the shared record or stop the shared preview. The audio requirements below still apply.

## Commit quality

- Make only purposeful commits. Each commit must be atomic: include one coherent, well-designed change and every file required for it.
- Write a concise commit message that accurately describes the change's purpose and outcome.

## GitHub access

- For GitHub repository inspection and mutations—including remote state, branches, tags, releases, Actions workflows, Pages deployments, issues, and pull requests—use the connected GitHub app: [$github](app://connector_76869538009648d5b282a4bb21c3d157).
- Do not rely on local `gh` CLI authentication when the connected GitHub app is available. If the app is unavailable or lacks the required permission, stop and report the specific access gap before changing repository or GitHub state.

## Release and Pages publication

- When releasing the game, use the repository's checked-in GitHub Actions workflow to publish the release to GitHub Pages. Do not claim a release is complete from a successful build alone.
- After dispatching or triggering the configured release/Pages workflow, monitor it through the connected GitHub app until it completes successfully. Verify the deployed commit, application version metadata, and the exact Pages deployment URL.
- Only after the Pages deployment succeeds, update the README's Live Demo/release documentation with the verified deployment URL. Keep the README consistent with the configured workflow and do not invent or infer a URL.
- Verify the updated README on the authoritative `main` branch and report the README URL together with the Pages deployment URL. If the workflow or deployment URL is unavailable, stop and report the blocker instead of updating the README with an unverified link.

## UI Adjustments

- Prefer hardcoded UI values for sizing and spacing. Use CSS `calc()` only when the user explicitly requests it.

## Browser validation

- Use the `playwright-cli` skill and its managed built-in browser for browser validation. Do not attach to or rely on an external or in-app browser session when a managed Playwright browser can perform the check.

## Lockstep release versions

- The game and `@bis/integration` are released separately, but their complete
  version numbers must match for a coordinated game release. For example, game
  `v0.0.16` uses BIS `0.0.16`. Do not match only the patch number.
- Verify the vendored BIS version and the game's checked-in version, release
  tag, and Pages metadata before saying that the versions match online. A BIS
  import or ordinary Pages deployment does not itself create a game release.

## Audio for spawned game windows

- The normal game URL intentionally defaults to the player's stored Music and
  SFX levels when no mute query parameters are present.
- Every AI-spawned, AI-tested, preview, or diagnostic game window MUST include
  both query parameters in its URL:
  `?muteMusic=true&muteSFX=true`
- Do not omit either parameter for an AI-created window. If the URL already has
  query parameters, append `&muteMusic=true&muteSFX=true`.
- A human-facing run may omit the parameters and use the normal audio
  experience.
