import { BlossomColorPickerColor, ColorInput } from './types';

// Convert lightness to slider value (0-100)
// Slider: 0=white/bright (l=100), 100=dark (l~20)
export function lightnessToSliderValue(l: number): number {
  const minLightness = 20;
  const maxLightness = 100;
  const clampedL = Math.max(minLightness, Math.min(maxLightness, l));
  return ((maxLightness - clampedL) / (maxLightness - minLightness)) * 100;
}

// Convert slider value to lightness
// Slider 0 = bright (l=100), Slider 100 = dark (l=20)
export function sliderValueToLightness(sliderValue: number): number {
  const minLightness = 20;
  const maxLightness = 100;
  return maxLightness - (sliderValue / 100) * (maxLightness - minLightness);
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s_val = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h_val = 0;
  switch (max) {
    case r: h_val = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h_val = ((b - r) / d + 2) / 6; break;
    case b: h_val = ((r - g) / d + 4) / 6; break;
  }

  return { h: Math.round(h_val * 360), s: Math.round(s_val * 100), l: Math.round(l * 100) };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s_val = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h_val = 0;
  switch (max) {
    case r: h_val = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h_val = ((b - r) / d + 2) / 6; break;
    case b: h_val = ((r - g) / d + 4) / 6; break;
  }
  return { h: Math.round(h_val * 360), s: Math.round(s_val * 100), l: Math.round(l * 100) };
}

export function parseColor(input: ColorInput): { h: number; s: number; l: number } {
  if (typeof input === 'object') return input;

  const str = input.trim().toLowerCase();

  // Hex (#RGB, #RRGGBB)
  if (str.startsWith('#')) return hexToHsl(str);

  // hsl(h, s%, l%) / hsla(h, s%, l%, a) — comma or space separated
  const hslMatch = str.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/);
  if (hslMatch) {
    return {
      h: Math.round(parseFloat(hslMatch[1])),
      s: Math.round(parseFloat(hslMatch[2])),
      l: Math.round(parseFloat(hslMatch[3])),
    };
  }

  // rgb(r, g, b) / rgba(r, g, b, a) — comma or space separated
  const rgbMatch = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgbMatch) {
    return rgbToHsl(
      parseFloat(rgbMatch[1]),
      parseFloat(rgbMatch[2]),
      parseFloat(rgbMatch[3]),
    );
  }

  return { h: 0, s: 0, l: 50 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Compute visual saturation: desaturate only when slider value is near white (< 10)
export function getVisualSaturation(sliderValue: number, baseSaturation: number): number {
  return sliderValue < 10 ? (sliderValue / 10) * baseSaturation : baseSaturation;
}

export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function hslaToString(h: number, s: number, l: number, a: number): string {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${(a / 100).toFixed(2)})`;
}

export function createColorOutput(
  hue: number,
  sliderValue: number,
  visualSaturation: number,
  lightness: number,
  alpha: number,
  layer: 'inner' | 'outer'
): BlossomColorPickerColor {
  return {
    hue,
    saturation: sliderValue, // State value (0-100)
    originalSaturation: visualSaturation,
    lightness,
    alpha,
    layer,
    hex: hslToHex(hue, visualSaturation, lightness),
    hsl: hslToString(hue, visualSaturation, lightness),
    hsla: hslaToString(hue, visualSaturation, lightness, alpha),
  };
}

/**
 * Automatically distributes a flat list of colors into concentric layers.
 * Sorting logic:
 * 1. Global sort: Lightness descending (Light -> Dark).
 *    Light colors go to inner layers, Dark colors go to outer layers.
 * 2. Layering: Proportional Distribution Algorithm (1:2:3...)
 *    This ensures outer layers always have significantly more petals than inner layers,
 *    mimicking a natural bloom pattern (e.g. 6-12-18).
 * 3. Local sort: Sort each layer by Hue for a rainbow effect.
 */
export function organizeColorsIntoLayers(
  colors: { h: number; s: number; l: number }[]
): { h: number; s: number; l: number }[][] {
  if (!colors || colors.length === 0) return [];

  // 1. Sort by Lightness Descending (Lightest first -> Inner)
  const sortedByLightness = [...colors].sort((a, b) => b.l - a.l);
  const total = sortedByLightness.length;

  // 2. Determine Number of Layers (N)
  // Heuristic: We aim for the innermost layer to have around 6 petals.
  // Capacity of N layers ≈ Sum(k=1..N) of 6*k = 3*N*(N+1)
  // If Total <= 18 -> 2 layers (6, 12)
  // If Total <= 40 -> 3 layers (approx 6, 12, 18 = 36)
  // If Total > 40  -> 4+ layers
  let numLayers = 2;
  if (total > 42) numLayers = 4;
  else if (total > 18) numLayers = 3;

  // 3. Distribute counts per layer using 1:2:3... ratio
  // Denominator = Sum(1..numLayers) = N(N+1)/2
  const denominator = (numLayers * (numLayers + 1)) / 2;
  
  const layerCounts = new Array(numLayers).fill(0);
  let assignedCount = 0;

  for (let i = 0; i < numLayers; i++) {
    // Basic share: Total * (i+1) / Denominator
    // We strictly floor it to avoid overshooting
    const share = Math.floor(total * ((i + 1) / denominator));
    layerCounts[i] = share;
    assignedCount += share;
  }

  // 4. Distribute remainder to outer layers first
  // This makes the outer ring look even fuller
  let remainder = total - assignedCount;
  let layerIdx = numLayers - 1;
  while (remainder > 0) {
    layerCounts[layerIdx]++;
    remainder--;
    layerIdx--;
    if (layerIdx < 0) layerIdx = numLayers - 1; // loop back to outer if needed
  }

  // 5. Fill layers
  const layers: { h: number; s: number; l: number }[][] = [];
  let currentIndex = 0;

  for (let i = 0; i < numLayers; i++) {
    const count = layerCounts[i];
    const itemsForThisLayer = sortedByLightness.slice(currentIndex, currentIndex + count);
    
    // Sort by Hue for rainbow effect
    itemsForThisLayer.sort((a, b) => a.h - b.h);
    
    if (itemsForThisLayer.length > 0) {
      layers.push(itemsForThisLayer);
    }
    currentIndex += count;
  }

  return layers;
}
