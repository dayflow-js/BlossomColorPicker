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

export interface BlossomColorPickerProps {
  value?: BlossomColorPickerValue;
  defaultValue?: BlossomColorPickerValue;
  /**
   * Unified color list. If provided, colors will be automatically sorted (dark to light)
   * and distributed into layers.
   */
  colors?: { h: number; s: number; l: number }[];
  /** @deprecated Use `colors` for automatic layering */
  innerColors?: { h: number; s: number; l: number }[];
  /** @deprecated Use `colors` for automatic layering */
  outerColors?: { h: number; s: number; l: number }[];
  onChange?: (color: BlossomColorPickerColor) => void;
  onCollapse?: (color: BlossomColorPickerColor) => void;
  disabled?: boolean;
  openOnHover?: boolean;
  initialExpanded?: boolean;
  animationDuration?: number;
  showAlphaSlider?: boolean;
  coreSize?: number;
  petalSize?: number;
  className?: string;
}
