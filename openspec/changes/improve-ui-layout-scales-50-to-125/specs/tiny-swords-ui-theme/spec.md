# Spec Delta

## MODIFIED Requirements

### Requirement: Responsive and accessible themed controls

The UI SHALL remain legible and usable inside the visible game area at desktop and narrow portrait sizes, after viewport changes, browser zoom, and fullscreen transitions. Panel edges and icons SHALL remain undistorted. Interactive hit areas SHALL be at least 44 CSS pixels in each dimension. Text labels, accessible names, keyboard operation, and visible focus SHALL remain available independently of decorative images. Available hover, pressed, checked, and disabled states SHALL be visually distinguishable without relying on hover for touch operation. At supported desktop browser zoom factors from 50% through 125%, the Start Menu SHALL preserve the approved 110% composition relative to the visible game frame and keep all visible actions fully enclosed by its parchment.

#### Scenario: Narrow portrait interaction

- **WHEN** the game is viewed at a 320 CSS pixel wide portrait viewport
- **THEN** the HUD and controls remain inside the visible game area without overlapping interactive targets
- **AND** menu content remains readable and reachable, scrolling where necessary

#### Scenario: Keyboard and fullscreen use

- **WHEN** the user navigates controls by keyboard and enters or exits fullscreen
- **THEN** focus remains visible, controls retain accessible labels, and the layout stays usable

#### Scenario: Start Menu at supported browser zoom

- **WHEN** the desktop Start Menu is shown at 50%, 75%, 80%, 90%, 110%, or 125% browser zoom
- **THEN** its logo, ribbon, parchment, body copy, Start action, and visible Items action remain inside the game frame with the approved 110% visual proportions
- **AND** the parchment lower edge remains below the final visible action without clipping its artwork or label
