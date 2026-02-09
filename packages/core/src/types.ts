export interface BlossomColorPickerValue {
  hue: number;
  saturation: number; // Slider position (0-100)
  lightness?: number;
  originalSaturation?: number; // Actual saturation from selected petal
  alpha: number;
  layer: 'inner' | 'outer';
}

export interface BlossomColorPickerColor extends BlossomColorPickerValue {
  hex: string;
  hsl: string;
  hsla: string;
}

/** Accepts HSL object, hex string, rgb()/rgba() string, or hsl()/hsla() string. */
export type ColorInput = string | { h: number; s: number; l: number };

export type SliderPosition = 'top' | 'bottom' | 'left' | 'right';
