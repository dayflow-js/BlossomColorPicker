// CommonJS consumers resolve the `require` condition and its .d.cts types.
import { BlossomColorPicker as CorePicker } from '@dayflow/blossom-color-picker';
import type {
  BlossomColorPickerProps,
  ChromePickerProps,
} from '@dayflow/blossom-color-picker-react';

declare const container: HTMLElement;

export const corePicker = new CorePicker(container, { coreSize: 32 });
// @ts-expect-error coreSize must be a number.
export const invalidCorePicker = new CorePicker(container, { coreSize: '32' });

export const props: BlossomColorPickerProps = {
  defaultValue: { hue: 330, saturation: 70, alpha: 100, layer: 'outer' },
};
// @ts-expect-error darkMode must be a boolean.
export const invalidChromeProps: ChromePickerProps = { darkMode: 'true' };
