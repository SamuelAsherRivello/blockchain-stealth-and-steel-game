# Tiled Babylon Lite

Dependency-free helpers for validating, normalizing, and loading finite orthogonal Tiled JSON maps with external JSON tilesets in Babylon Lite projects.

## Library audit

The current ecosystem review found no maintained package that directly connects Tiled TMJ/TSJ maps to Babylon Lite's data-oriented sprite API. Babylon Lite's official loaders cover formats such as glTF and `.babylon`; Babylon.js mapping packages found during the audit target unrelated geographic 3D Tiles or depend on the full `@babylonjs/core` API. This plugin therefore implements the deliberately narrow project contract locally without a production dependency.

## Public API

- `validateTiledMap(map, externalTilesets?)` returns structural and supported
  object-contract errors.
- `normalizeTiledMap(map, externalTilesets)` returns ordered tile placements,
  tile objects, class/property metadata, reactive-decoration descriptors,
  origin-relative game coordinates, normalized spawner records, and normalized
  sensor geometry. Spawner objects carry one uppercase `type` value; exactly one
  `PLAYER` is required per level.
- `loadTiledMap(url, fetchImpl)` loads a TMJ and its referenced TSJ files in a browser.

## Tiled layer drawing order

Each level controls its own tile-layer stack. Layers higher in Tiled's Layers panel
cover lower layers; names and tileset types never override that order. Tiled stores
this stack bottom-to-top in the map file, which is also the drawing order.

Each tile layer reserves 1,000 integer render depths, including empty layers.
Bands end below gameplay depth zero: for four layers, their base depths are
-4000, -3000, -2000, and -1000. Static tiles use the band's base and animated tiles
use base + 1, leaving base + 2 through base + 999 available within each layer.
Animation remains behind every tile on a higher layer. Reordering layers in Tiled
reassigns the bands automatically on load; no code or fixed layer names are required.

## Level camera

In Tiled's Map Properties, add the string property `cameraMode` with value
`follow-player` to enable scrolling. Omit it or use `fixed` to retain the existing
fixed view. Level 1 uses `follow-player` and is the scrolling example.

Scrolling accepts any positive map dimensions with the project's 64-pixel tiles.
The camera shows a 9-by-16-cell window and scrolls each axis independently;
axes that fit inside the viewport stay locked. A one-tile border is excluded
on an axis only when that axis can fit the viewport plus both border tiles
(11 columns or 18 rows). A 32-by-16 map scrolls horizontally with a fixed vertical view.
World coordinates use an automatic lower-left interior origin; no World Origin
object or layer is required. Legacy origin markers remain supported for older maps.

Add a point object named `Camera Focus` (class `CameraFocus`) to `Level Markers`.
The camera starts centered on that point, constrained to the interior, then follows
the player from the first gameplay update. Without a focus it starts on the player. Its shared
dead zone is **3 columns wide by 4 rows tall**, centered on the screen. Following
eases toward the nearest dead-zone edge using a 0.15-second damping time constant,
without recentering or revealing border tiles. It freezes while gameplay is paused
or ended. These camera dimensions and damping are hardcoded for the first version.

With the local Vite server running, open `/` to play the authored Level 1. Its
13-by-18 map has an 11-by-16 playable interior, allowing two columns of horizontal
scrolling while the vertical axis stays locked. There is no demo-map override.
Independent-axis scrolling, small maps, and fixed-mode compatibility are covered by
automated camera and map-validation tests.
