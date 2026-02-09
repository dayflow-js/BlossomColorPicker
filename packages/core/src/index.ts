import './styles.css';

// Main class
export { BlossomColorPicker } from './BlossomColorPicker';
export type { BlossomColorPickerOptions } from './BlossomColorPicker';

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
  parseColor,
  lightnessToSliderValue,
  sliderValueToLightness,
  hslToString,
  hslaToString,
  createColorOutput,
  getVisualSaturation,
  organizeColorsIntoLayers,
} from './utils';

export {
  DEFAULT_COLORS,
  OUTER_COLORS,
  INNER_COLORS,
} from './constants';

export {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout';
