## MODIFIED Requirements

### Requirement: World background covers the drawable viewport

The system SHALL extend the world background from the top edge to the bottom
edge of the drawable viewport without exposing page-background letterboxing.
On a wide, fine-pointer desktop viewport, the system SHALL permit a
decorative non-game presentation only in horizontal gutters outside the
centered game window; it SHALL not appear above or below the world, enter the
game window, or replace the mobile world background.

#### Scenario: Narrow mobile fullscreen viewport

- **WHEN** the game enters fullscreen on a narrow portrait mobile display
- **THEN** the world background reaches the drawable top and bottom edges with
  no black strip above or below it and no exterior presentation is visible

#### Scenario: Display cutout viewport

- **WHEN** the browser exposes drawable space around a display cutout
- **THEN** the world background extends into that space rather than reserving
  an opaque page-background band

#### Scenario: Wide desktop viewport

- **WHEN** a wide, fine-pointer desktop viewport exposes space to the left
  and right of the complete game window
- **THEN** any exterior presentation occupies only that horizontal space while
  the world continues to occupy the complete game window
