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

export interface BlossomColorPickerProps {
  value?: BlossomColorPickerValue;
  defaultValue?: BlossomColorPickerValue;
  /**
   * Unified color list. If provided, colors will be automatically sorted (dark to light)
   * and distributed into layers.
   */
  colors?: ColorInput[];
  onChange?: (color: BlossomColorPickerColor) => void;
  onCollapse?: (color: BlossomColorPickerColor) => void;
  disabled?: boolean;
  openOnHover?: boolean;
  initialExpanded?: boolean;
  animationDuration?: number;
  showAlphaSlider?: boolean;
  coreSize?: number;
  petalSize?: number;
  /** When true, the core circle displays the selected color even while expanded. Defaults to true. */
  showCoreColor?: boolean;
  className?: string;
}
