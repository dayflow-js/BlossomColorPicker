import './styles.css';

// Main class
export { BlossomColorPicker } from './BlossomColorPicker.js';
export type { BlossomColorPickerOptions } from './BlossomColorPicker.js';

export { ChromePicker } from './ChromePicker.js';
export type {
  ChromePickerOptions,
  ChromePickerThemeColors,
} from './ChromePicker.js';

// Types
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
  PetalShape,
  PetalStyle,
} from './types.js';

// Utilities (for advanced users)
export {
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,
  rgbaToString,
  parseColor,
  lightnessToSliderValue,
  sliderValueToLightness,
  hslToString,
  hslaToString,
  createColorOutput,
  getVisualSaturation,
  organizeColorsIntoLayers,
} from './utils.js';

export { DEFAULT_COLORS, OUTER_COLORS, INNER_COLORS } from './constants.js';

export {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout.js';
