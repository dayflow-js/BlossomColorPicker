/**
 * Pure layout computation functions for BlossomColorPicker.
 * These are stateless geometry helpers extracted from the component.
 */

/**
 * Calculate individual layer radii using Geometric Nesting with aggressive packing.
 */
export function calculateLayerRadii(
  layers: { h: number; s: number; l: number }[][],
  coreSize: number,
  petalSize: number
): number[] {
  const radii: number[] = [];
  const W = petalSize;
  const Rc = coreSize / 2;
  const Rp = petalSize / 2;

  for (let i = 0; i < layers.length; i++) {
    const N = layers[i].length;

    // Dynamic overlap factor:
    // For small/medium counts (like 4-8 per layer), we can afford MORE overlap (smaller factor)
    // to keep the ring tight. For large counts (>12), we need less overlap to avoid crushing.
    const overlapFactor = N <= 8 ? 0.45 : N <= 12 ? 0.5 : 0.55;

    // Calculate radius required for petals to overlap each other laterally
    const lateralGaplessR = (N * W * overlapFactor) / (2 * Math.PI);

    let r;

    if (i === 0) {
      // First layer vs Core
      // Overlap core by 25-30%
      // For very small N (like 5), we need to pull even tighter because the angle is wide
      const coreOverlap = N <= 5 ? W * 0.35 : W * 0.25;
      const idealCoreR = Rc + Rp - coreOverlap;
      r = Math.max(idealCoreR, lateralGaplessR);
    } else {
      // Subsequent layers
      const prevR = radii[i - 1];
      const prevN = layers[i - 1].length;

      // Calculate crowding.
      // For 11-17 total colors, the inner layer usually has 4-6 petals.
      // This is "sparse", creating deep valleys. We MUST pull the outer layer in.
      // We simply check if the previous layer allows deep nesting.
      // If prevN is small relative to circumference (sparse), we pull in.
      const circumference = 2 * Math.PI * prevR;
      const coverage = prevN * W;
      const sparsity = coverage / circumference; // < 1 means gaps exist

      // If sparsity is low (e.g. 0.6-0.8), we have huge gaps.
      // Step can be very small, or even negative relative to "touching".
      let adaptiveStep = W * 0.35; // Default tight step

      if (sparsity < 0.85) {
        // Very sparse (e.g. 4-5 inner petals). Deep valleys.
        // Pull in drastically.
        adaptiveStep = W * 0.15;
      } else if (sparsity > 1.1) {
        // Very crowded. Push out.
        adaptiveStep = W * 0.45;
      }

      const idealNestleR = prevR + adaptiveStep;

      // Relax the lateral constraint slightly for the outer layer in this specific count range
      // to prioritize nesting over lateral spacing (let them overlap more laterally if needed)
      r = Math.max(idealNestleR, lateralGaplessR);

      // Ensure absolute minimum spacing
      r = Math.max(r, prevR + W * 0.1);
    }

    radii.push(r);
  }

  return radii;
}

/**
 * Calculate rotation offsets to stagger layers so petals sit in the valleys of the previous ring.
 */
export function calculateLayerRotations(
  layers: { h: number; s: number; l: number }[][]
): number[] {
  const rotations: number[] = [0]; // First layer is always aligned

  for (let i = 1; i < layers.length; i++) {
    // Rotate this layer by half the angle of a petal in the PREVIOUS layer
    // This positions the new petals in the "valleys" of the previous ring
    const prevCount = layers[i - 1].length;
    const offset = 360 / prevCount / 2;
    rotations.push(offset);
  }

  return rotations;
}

/**
 * Calculate the bar radius (drawn outside the last petal layer).
 */
export function calculateBarRadius(
  layerRadii: number[],
  petalSize: number,
  coreSize: number,
  barGap: number
): number {
  return layerRadii.length > 0
    ? layerRadii[layerRadii.length - 1] + petalSize / 2 + barGap
    : coreSize / 2 + barGap;
}

/**
 * Calculate overall container dimensions.
 */
export function calculateContainerSize(
  barRadius: number,
  barWidth: number,
  showAlphaSlider: boolean,
  sliderOffset: number
): number {
  return showAlphaSlider
    ? (barRadius + sliderOffset + barWidth / 2) * 2 + 12
    : (barRadius + barWidth / 2) * 2 + 12;
}

/**
 * Get z-index for the "fan loop" trick that creates continuous petal overlap.
 * Sequence: BottomRight(Top) -> Next -> ... -> BottomLeft(Bottom)
 */
export function getPetalZIndex(
  index: number,
  bottomIndex: number,
  totalPetals: number,
  layerIdx: number,
  totalLayers: number,
  isBottomLeft: boolean = false,
  isBottomRight: boolean = false
): number {
  const baseZ = (totalLayers - layerIdx) * 100;
  const maxLocalZ = totalPetals + 10;

  if (index === bottomIndex) {
    if (isBottomRight) return baseZ + maxLocalZ; // Top of stack (6 o'clock Right)
    if (isBottomLeft) return baseZ; // Bottom of stack (6 o'clock Left)
    return baseZ;
  }

  // Steps from Bottom (clockwise)
  // 6->0, 7->1, ..., 0->6, 1->7, ..., 5->11
  // By using +steps, Z increases clockwise, creating counter-clockwise overlap (1 > 0 > 11)
  const steps = (index - bottomIndex + totalPetals) % totalPetals;

  return baseZ + steps;
}
