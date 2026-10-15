import { GridSpot } from "../environment/grid-spot.js";
import { GRID } from "../environment/grid-contract.js";
import { collidersOverlap } from "../../gameplay/game-logic.js";

export function createGoal({ host, position, screenWidth, screenHeight, artworkUrl = "", documentRef = globalThis.document }) {
  const marker = documentRef.createElement("div");
  marker.className = "runtime-goal-marker";
  marker.setAttribute("aria-label", "Goal");
  if (artworkUrl) {
    const artwork = documentRef.createElement("img");
    artwork.src = artworkUrl;
    artwork.alt = "";
    marker.append(artwork);
  }
  marker.style.left = `${(position.x / screenWidth) * 100}%`;
  marker.style.top = `${(1 - position.y / screenHeight) * 100}%`;
  host.append(marker);
  const gridSpot = new GridSpot(position, GRID);
  const colliderSize = 10;
  return {
    position,
    movementCollider: { x: position.x - colliderSize / 2, y: position.y - colliderSize / 2, width: colliderSize, height: colliderSize },
    isReachedBy(actor) {
      const collider = actor?.getMovementCollider();
      return Boolean(collider && collidersOverlap(collider, this.movementCollider));
    },
    getGridSpot() { return gridSpot; },
    updateView(camera) {
      const point = camera.worldToScreen(position);
      marker.style.left = `${point.x / screenWidth * 100}%`;
      marker.style.top = `${point.y / screenHeight * 100}%`;
      marker.hidden = point.x < -64 || point.x > screenWidth + 64 || point.y < -64 || point.y > screenHeight + 64;
    },
    dispose() { marker.remove(); },
  };
}
