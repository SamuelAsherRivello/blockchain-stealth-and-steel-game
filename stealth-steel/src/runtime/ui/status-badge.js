// Loading the optional decoration must never prevent the game from starting.
export function loadStatusBadgeArt(ImageRef = globalThis.Image) {
  if (!ImageRef) return null;
  const image = new ImageRef();
  image.src = `${import.meta.env?.BASE_URL ?? "/"}ui/tiny-swords/SmallBlueRoundButton_Regular.png`;
  return image;
}

export function drawStatusBadge(context, image, { x, y, icon, flash }) {
  context.save();
  context.imageSmoothingEnabled = false;
  if (image?.complete && image.naturalWidth > 0) {
    // The source has transparent margins; the visible circle remains 36px.
    context.drawImage(image, x - 25, y - 25, 50, 50);
  } else {
    context.fillStyle = "#3f91a0";
    context.strokeStyle = "#eae0c2";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x, y, 18, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  context.font = "700 22.4px Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = flash === "red" ? "#ff6b6b"
    : flash === "yellow" ? "#ffe066" : "#fff5d9";
  context.fillText(icon, x, y + 1);
  context.restore();
}
