export function measurePixels(rgba, whiteTolerance) {
  let filled = 0;
  let darkness = 0;
  const whiteThreshold = 255 - whiteTolerance;
  for (let offset = 0; offset < rgba.length; offset += 4) {
    const red = rgba[offset];
    const green = rgba[offset + 1];
    const blue = rgba[offset + 2];
    if (red >= whiteThreshold && green >= whiteThreshold && blue >= whiteThreshold) continue;
    filled++;
    // Pesos inteiros preservam a precisão nas fronteiras das categorias.
    darkness += 2126 * (255 - red) + 7152 * (255 - green) + 722 * (255 - blue);
  }

  const pixelCount = rgba.length / 4;
  const maxDarkness = 2550000;
  return {
    area: (100 * filled) / pixelCount,
    intensity: filled ? (100 * darkness) / (filled * maxDarkness) : null,
    visualIndex: (100 * darkness) / (pixelCount * maxDarkness),
  };
}
