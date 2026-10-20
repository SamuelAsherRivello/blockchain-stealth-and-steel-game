// Artwork-only offsets in pixels. Positive y moves the PNG upward on screen.
// These values do not move the character's logical position or colliders.
export const CHARACTER_ART_OFFSETS = Object.freeze({
  player: Object.freeze({ x: 0, y: 15 }),
  goblin: Object.freeze({ x: 0, y: 10 }),
  warrior: Object.freeze({ x: 0, y: 10 }),
  lancer: Object.freeze({ x: 0, y: 20}),
  archer: Object.freeze({ x: 0, y: 10 }),
  monk: Object.freeze({ x: 0, y: 15}),
  sheep: Object.freeze({ x: 0, y: 10 }),
});

const ZERO_OFFSET = Object.freeze({ x: 0, y: 0 });

export function getCharacterArtOffset(id) {
  return CHARACTER_ART_OFFSETS[id] ?? ZERO_OFFSET;
}

// Sprite position is the pivot position. Moving the image right therefore
// requires moving its pivot left, while moving it up requires moving its pivot
// down in texture coordinates.
export function getRenderedArtPivot(id, pivot, frame) {
  const offset = getCharacterArtOffset(id);
  return {
    x: pivot.x - offset.x / frame.width,
    y: pivot.y + offset.y / frame.height,
  };
}
