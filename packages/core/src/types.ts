export interface BlossomColorPickerValue {
  hue: number;
  /** Legacy shade position (0-100), not HSL saturation. */
  saturation: number;
  /** Index in the input palette, stable across layout sorting. */
  colorIndex?: number;
  lightness?: number;
  originalSaturation?: number; // Actual saturation from selected petal
  alpha: number;
  layer: 'inner' | 'outer';
}

export interface BlossomColorPickerColor extends BlossomColorPickerValue {
  hex: string;
  hsl: string;
  hsla: string;
  rgb: string;
  rgba: string;
  r: number;
  g: number;
  b: number;
}

/** Accepts HSL object, hex string, rgb()/rgba() string, or hsl()/hsla() string. */
export type ColorInput = string | { h: number; s: number; l: number };

export type SliderPosition = 'top' | 'bottom' | 'left' | 'right';

/** Petal outline. Every shape except `circle` points its tip away from the core. */
export type PetalShape = 'circle' | 'sakura' | 'lotus' | 'pinwheel';

/** Surface detail drawn on shaped petals; `circle` petals stay flat. */
export type PetalStyle = 'flat' | 'veined';
