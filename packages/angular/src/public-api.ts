export { BlossomColorPickerComponent } from './lib/blossom-color-picker.component';
export { ChromePickerComponent } from './lib/chrome-picker.component';

// Re-export types from core
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
  BlossomColorPickerOptions,
  ChromePickerThemeColors,
} from '@dayflow/blossom-color-picker';

// Re-export utilities
export {
  DEFAULT_COLORS,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  parseColor,
  lightnessToSliderValue,
} from '@dayflow/blossom-color-picker';
