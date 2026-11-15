import {
  BlossomColorPicker,
  ChromePicker,
  type BlossomColorPickerColor,
} from '@dayflow/blossom-color-picker-vue';
import { h } from 'vue';

type PickerProps = InstanceType<typeof BlossomColorPicker>['$props'];
type ChromeProps = InstanceType<typeof ChromePicker>['$props'];

export const props: PickerProps = {
  coreSize: 32,
  defaultValue: { hue: 330, saturation: 70, alpha: 100, layer: 'outer' },
  onChange: (color: BlossomColorPickerColor) => color.hex,
  onHover: color => color?.hex,
};
// @ts-expect-error coreSize must be a number.
export const invalidProps: PickerProps = { coreSize: '32' };
// @ts-expect-error change listeners receive a color object.
export const invalidListener: PickerProps = {
  onChange: (color: string) => color,
};

export const chromeProps: ChromeProps = { darkMode: true };
// @ts-expect-error darkMode must be a boolean.
export const invalidChromeProps: ChromeProps = { darkMode: 'true' };

export const vnode = h(BlossomColorPicker, { coreSize: 32 });
