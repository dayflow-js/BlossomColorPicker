import './styles.css';

console.log('BlossomColorPicker Entry Loaded');

// Main class
export { BlossomColorPicker } from './BlossomColorPicker';
export type { BlossomColorPickerOptions } from './BlossomColorPicker';

export { ChromePicker } from './ChromePicker';
export type {
  ChromePickerOptions,
  ChromePickerThemeColors,
} from './ChromePicker';

// Types
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
} from './types';

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
} from './utils';

export { DEFAULT_COLORS, OUTER_COLORS, INNER_COLORS } from './constants';

export {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout';
