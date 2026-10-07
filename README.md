<!-- AI: Customize this README from the repository's actual files, configuration, and user instructions. Preserve the section order, heading styles, and concise format unless asked to change them. Replace placeholders only with verified information; do not invent features, commands, URLs, contributors, or deployment behavior. Keep these instructions hidden as HTML comments. -->
<!-- AI: Preserve the creator banner unless a replacement is requested. Update its relative path if assets move and verify the file exists with matching filename capitalization. -->
![Samuel Asher Rivello](stealth-steel/documentation/images/samuel-asher-rivello-banner.png)

# Stealth and Steel

<!-- AI: Use the requested project display name and keep the introduction to one short sentence describing the implemented project and its audience. -->
This is a proof-of-concept (POC) demonstrating Blockchain use cases for gaming.

The Stealth and Steel game uses the Blockchain Integration Service (BIS); a Blockchain enabled ui and service layer to your games for Signet and Mutinynet networks for Bitcoin.

### BIS Benefits

- Accounts
- Payments
  - Deposits and withdrawals
  - Pay-to-play mechanics
- Assets
  - Marketplace
  - In-game items
  - Achievements and trophies
- Contracts, including limited-time player reward offers

## Images

<!-- AI: Use existing project screenshots with relative paths, matching link href and image src, and a 400-pixel preview width. Preserve image order and use descriptive alt text. -->
### Gameplay

<a href="stealth-steel/documentation/images/stealth-and-steel-gameplay.png"><img src="stealth-steel/documentation/images/stealth-and-steel-gameplay.png" width="400" alt="Stealth and Steel gameplay with the updated HUD and virtual controller" /></a>

### BIS HUD

<a href="stealth-steel/documentation/images/stealth-and-steel-bis-hud.png"><img src="stealth-steel/documentation/images/stealth-and-steel-bis-hud.png" width="400" alt="Stealth and Steel BIS account HUD" /></a>

## Live Demo

<!-- AI: Verify the public demo URL against deployment configuration or the deployed site before changing it. -->
<!-- AI: Do not mention release version numbers anywhere in this README,
including current-release announcements or example release tags, unless the
user explicitly requests it. Do not restore query-parameter advice,
preloader-to-Start-menu explanation, or build-argument/GitHub Actions build
commentary in this Demo section unless the user explicitly requests it. -->
- [https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/](https://samuelasherrivello.github.io/blockchain-stealth-and-steel-game/)

WebGPU not working? See [Troubleshooting](#troubleshooting).

## Table of Contents

<!-- AI: Keep this list synchronized with the top-level sections below it. Exclude the title, Images, Demo, and Table of Contents; do not add subsection entries unless requested. -->
1. [Getting Started](#getting-started)
2. [Project Overview](#project-overview)
3. [Project Details](#project-details)
4. [Deep Dive](#deep-dive)
5. [Resources](#resources)
6. [Credits](#credits)

## Getting Started

<!-- AI: Verify prerequisites and commands against repository configuration. Keep setup in the subsections below and do not add a separate commands section. -->
Use Node.js 22 (the version used by GitHub Actions), npm, and a browser with
WebGPU support. Clone or download this repository and run commands from its root.

### 🛠 Build Project

<!-- AI: Specify the working directory and dependency installation when necessary. Verify build commands against package.json. -->
1. Run `npm install` to install the project dependencies.
2. Run `npm run build` to create the production bundle.

### 🛠 Run Project

<!-- AI: Use the actual local launch command and refer to the printed URL when the port can vary. Avoid repeating completed setup steps. -->
1. Run `npm run dev` to launch the local development server with hot reload.
2. Open the URL printed by Vite.

Use `npm run preview` to serve the production bundle locally after building it.
Run `npm test` for the automated tests and `npm run test:publish` for the Pages
links, screenshot, relative-path, and release-metadata checks.

### 🛠 Release Version

<!-- AI: Describe the checked-in release workflow accurately. Distinguish builds, tags, releases, and deployment; documentation edits do not authorize publishing or changing Git history. -->
1. Run `npm ci`, `npm test`, `npm run test:publish`, and `npm run build`.
   Both the full test suite and focused publishing checks must pass before deployment.
2. Commit and push to `main` in
   [`SamuelAsherRivello/stealth-and-steel-game`](https://github.com/SamuelAsherRivello/stealth-and-steel-game).
   The `Deploy live demo` workflow runs all tests, validates publishing contracts,
   builds `dist`, and deploys it using GitHub Actions. No release tag is needed to publish.
3. Wait for the [deployment workflow](https://github.com/SamuelAsherRivello/blockchain-stealth-and-steel-game/actions/workflows/deploy-pages.yml)
   to succeed, then verify the [live game](https://samuelasherrivello.github.io/stealth-and-steel-game/).

<!-- AI: Keep this release section brief; do not add detailed versioning, Pages,
rename, or recovery guidance here. -->

## Project Overview

<!-- AI: Describe the current purpose and capabilities; label planned behavior explicitly and keep detailed tooling under Project Details. -->
This repo demonstrates browser-based game development with Babylon.js Lite,
JavaScript, Vite, and WebGPU in a portrait-oriented sprite game.

A Babylon-branded startup preloader appears before the first game graphics,
covers asset loading, and closes after the first rendered frame. Loading errors
show a Retry button. This lightweight screen is local to the project because
Babylon Lite does not ship the full engine's default loading UI.

### 📝 Documentation

<!-- AI: Link to documentation that exists in this repository using relative Markdown links and a short purpose for each. -->
- [README.md](README.md): Primary documentation for this repo.
- [Tile Map Editing](stealth-steel/documentation/tile-map.md): Tiled map editing workflow.
- [Grid and UI Contract](stealth-steel/documentation/grid-and-ui-contract.md): Logical grid and UI placement contract.
- [Render Depth Order](stealth-steel/documentation/render-depth-order.md): Babylon Lite sprite and DOM overlay depth bands.

### 📝 Structure

<!-- AI: List only the paths needed to understand this repository. Verify paths and capitalization; omit generated output and dependency folders. -->
```text
./
|-- .agents/
|-- .codex/
|-- .github/
|-- openspec/
|   |-- changes/
|   |-- specs/
|   |-- cli.mjs
|   `-- config.yaml
|-- .gitignore
|-- LICENSE
|-- README.md
|-- package.json
|-- package-lock.json
|-- vite.config.js
`-- stealth-steel/
    |-- documentation/
    |-- plugins/
    |-- public/
    |   |-- assets/
    |   |   |-- audio/
    |   |   |-- images/
    |   |   |   |-- enemies/       # Includes archer
    |   |   |   |-- goals/
    |   |   |   |-- npc/
    |   |   |   |-- particles/
    |   |   |   |-- player/
    |   |   |   |-- terrain/
    |   |   |   `-- ui/            # Includes Tiled spawner icons
    |   |   `-- levels/
    |   `-- environment.json
    |-- src/
    |   |-- runtime/
    |   `-- test/                  # Includes runner and browser checks
    |-- vendor/
    `-- index.html
```

<!-- AI: Keep this structure section brief; do not add lengthy runtime, build,
or asset-location details here. -->

## Project Details

<!-- AI: Verify implementation details against repository files and avoid repeating the overview or claiming unverified package versions. -->
Babylon.js Lite powers the graphics and gameplay systems, WebGPU renders the
game in supported browsers, and Tiled authors the terrain map and layers.

### 📦 AI

<!-- AI: List AI tools and specification workflows configured or documented here. Keep official links and concise descriptions; do not copy unverified template claims. -->
- [Codex](https://openai.com/codex/): Agent-assisted development with repository-local skills in `.agents/skills/`.
- [OpenSpec](https://openspec.dev/): Specification-driven development that keeps feature intent, implementation, and current specifications aligned.

### 📦 Packages

<!-- AI: List key packages actually used, based on manifests and configuration. Use official documentation links and explain each role briefly. -->
<!-- AI: The user removed the Mermaid, react-markdown, and @scure/bip39
package entries. Do not reintroduce those entries or their documentation-viewer
and recovery-phrase descriptions anywhere in this README unless the user
explicitly requests it, even if those dependencies appear in the codebase. -->
- [Babylon.js Lite](https://doc.babylonjs.com/lite/01-getting-started) (`@babylonjs/lite`): Lightweight rendering and game APIs.
- [Vite](https://vite.dev/): JavaScript bundling and local development server.
- [Node.js test runner](https://nodejs.org/api/test.html): Built-in automated JavaScript testing.

### 📦 Editor Tooling

- Visual Studio Code: Source code editor.
- Tiled: Tile map and level editor.
- Babylon.js Inspector: Runtime scene inspection.

#### Tile Map

Levels are authored with Tiled. The AI prepares the Tiled project, map,
tilesets, grid, origin marker, layers, properties, and runtime integration; the
human edits content only on the existing layers.

See [Tile Map Editing](stealth-steel/documentation/tile-map.md) for the open, edit, save,
close, and play workflow.

<!-- AI: Keep this tile-map section brief; do not add lengthy completion, progress,
or trophy behavior details here. -->

### Troubleshooting

#### WebGPU not working?

First, open the [official WebGPU Samples hello-triangle
test](https://webgpu.github.io/webgpu-samples/?sample=helloTriangle). If it does
not render, the browser or device cannot currently run this project's WebGPU
path.

For Chrome-specific troubleshooting, see the official [WebGPU
documentation](https://developer.chrome.com/docs/web-platform/webgpu/). It
covers browser requirements, secure origins, graphics acceleration,
`chrome://gpu`, and the `enable-unsafe-webgpu` development flag.

Third-party references:

- [WebGPU Report](https://webgpureport.org/) shows the detected adapter, limits,
  and features.
- [WebGPU Fundamentals](https://webgpufundamentals.org/) explains compatibility
  mode and its experimental Chrome flag.
- [WebGPU Check](https://webgpucheck.com/) provides browser-specific enablement
  guidance and diagnostics.
- [Can I use: WebGPU](https://caniuse.com/webgpu) tracks current browser support.

## Deep Dive

<a href="https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/bis-concept-diagram-1.png"><img src="https://raw.githubusercontent.com/SamuelAsherRivello/blockchain-integration-service/main/BIS/documentation/bis-concept-diagram-1.png" width="400" alt="BIS concept diagram" /></a>

Deep Dive takes a closer look at a few representative files and the cross-repository contract that connects them. 

Start with the [Stealth and Steel Deep Dive](stealth-steel/documentation/deep-dive.md).

## Resources

<!-- AI: Keep relevant external learning links and short descriptions. Preserve Best Practices unless asked to replace it; avoid duplicating local documentation links. -->
- [Best Practices](https://www.SamuelAsherRivello.com/best-practices/) - Procedures prescribed as the most effective.
- [Babylon.js Lite getting started](https://doc.babylonjs.com/lite/01-getting-started) - Introduction to the lightweight engine.
- [Babylon.js Documentation](https://doc.babylonjs.com/) - Engine guides and reference.
- [Babylon.js Playground](https://playground.babylonjs.com/) - Browser-based experiments and examples.
- [Babylon.js Inspector](https://doc.babylonjs.com/toolsAndResources/inspector) - Runtime inspection tools.
- [Vite Documentation](https://vite.dev/guide/) - Development and build tooling.

## Credits

<!-- AI: Preserve established attribution and ownership. Use only confirmed contributor, contact, and license information. -->
### 💡 Contributors

<!-- AI: Preserve contributor credit; do not automatically advance experience counts or their reference year. -->
- Samuel Asher Rivello - Over 25 years of game development XP (2026)

### 💡 Contact

<!-- AI: Preserve confirmed contact destinations and this order. Use readable display URLs without a protocol or trailing slash while keeping the real link targets intact. -->
- [LinkedIn.com/in/SamuelAsherRivello](https://Linkedin.com/in/SamuelAsherRivello) ⭐
- [GitHub.com/SamuelAsherRivello](https://github.com/SamuelAsherRivello/)
- [Twitter.com/srivello](https://twitter.com/srivello/)
- Resume / Portfolio: [SamuelAsherRivello.com](http://www.SamuelAsherRivello.com)

### 💡 License

<!-- AI: Keep the license name linked to the actual relative license file and verify that its terms match this statement. Keep the copyright holder and year consistent with that file. Do not change license terms, ownership, or dates without an explicit request. -->
- Provided as-is under the [MIT License](LICENSE).

- Copyright © 2026 Rivello Multimedia Consulting, LLC.
