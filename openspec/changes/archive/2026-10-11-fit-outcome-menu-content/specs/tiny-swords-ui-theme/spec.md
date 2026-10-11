# Spec Delta

## ADDED Requirements

### Requirement: Outcome menus contain their complete readable action composition

Loss and completion menus SHALL provide enough parchment space for their body text, every visible action, visible spacing between adjacent actions, and a lower breathing margin after the final action. The action stack SHALL remain fully inside the visible paper background at the supported fullscreen 100% composition.

#### Scenario: Level completion with multiple actions

- **WHEN** a level completion menu displays its body copy and two or more visible actions
- **THEN** the paper extends below the final visible action
- **AND** adjacent action buttons have visible separation
- **AND** the body copy is not overlapped or visually merged with the first action

#### Scenario: Loss menu with two actions

- **WHEN** the loss menu displays its message and Pay/Restart actions
- **THEN** both visible actions are fully contained by the paper
- **AND** the final action has visible lower breathing room

#### Scenario: Single-action Start Menu remains unchanged

- **WHEN** the Start Menu displays its body copy and Start action
- **THEN** it retains its approved paper, ribbon, logo, and action composition without inheriting outcome-menu-only spacing changes
