import { BlossomColorPicker as CorePicker } from '@dayflow/blossom-color-picker';
import {
  BlossomColorPicker,
  ChromePicker,
} from '@dayflow/blossom-color-picker-react';

declare const container: HTMLElement;

export const corePicker = new CorePicker(container, { coreSize: 32 });
// @ts-expect-error coreSize must be a number.
export const invalidCorePicker = new CorePicker(container, { coreSize: '32' });

export const pickers = (
  <>
    <BlossomColorPicker
      defaultValue={{ hue: 330, saturation: 70, alpha: 100, layer: 'outer' }}
    />
    <ChromePicker coreSize={32} darkMode />
  </>
);

// @ts-expect-error darkMode must be a boolean.
export const invalidChromePicker = <ChromePicker darkMode='true' />;
