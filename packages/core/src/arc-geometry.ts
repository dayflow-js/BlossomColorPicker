import type { SliderPosition } from './types';

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAng: number,
  endAng: number
): string {
  const start = polarToCartesian(cx, cy, r, startAng);
  const end = polarToCartesian(cx, cy, r, endAng);
  const largeArcFlag = Math.abs(endAng - startAng) > 180 ? '1' : '0';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function getCenterAngle(position: SliderPosition): number {
  switch (position) {
    case 'top':
      return -90;
    case 'bottom':
      return 90;
    case 'left':
      return 180;
    case 'right':
    default:
      return 0;
  }
}

export function calculateSliderValueFromPoint(
  dx: number,
  dy: number,
  centerAngle: number,
  halfSweep: number,
  position: SliderPosition
): number {
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);

  let normalizedAngle = angle - centerAngle;
  while (normalizedAngle > 180) normalizedAngle -= 360;
  while (normalizedAngle < -180) normalizedAngle += 360;

  normalizedAngle = Math.max(-halfSweep, Math.min(halfSweep, normalizedAngle));

  let newValue;
  if (position === 'left') {
    newValue = ((halfSweep - normalizedAngle) / (2 * halfSweep)) * 100;
  } else {
    newValue = ((normalizedAngle + halfSweep) / (2 * halfSweep)) * 100;
  }

  return Math.round(Math.max(0, Math.min(100, newValue)));
}

export function calculateArcGradientColors(
  hue: number,
  baseSaturation: number,
  steps: number,
  getVisualSaturation: (sliderValue: number, baseSaturation: number) => number,
  hslToString: (h: number, s: number, l: number) => string
): string[] {
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const saturation = getVisualSaturation(t * 100, baseSaturation);
    const lightness = 100 - t * 80;
    return hslToString(hue, saturation, lightness);
  });
}
