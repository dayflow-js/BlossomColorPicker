import {
  BlossomColorPicker as CorePicker,
  type BlossomColorPickerOptions,
} from '@dayflow/blossom-color-picker';
import '@dayflow/blossom-color-picker/styles.css';
import {
  useRef,
  useEffect,
  forwardRef,
  createElement,
  type ForwardedRef,
} from 'react';

// Re-export types from core
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
} from '@dayflow/blossom-color-picker';

export type { BlossomColorPickerOptions } from '@dayflow/blossom-color-picker';

// Re-export utilities
export {
  DEFAULT_COLORS,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  parseColor,
  lightnessToSliderValue,
} from '@dayflow/blossom-color-picker';

export interface BlossomColorPickerProps extends BlossomColorPickerOptions {
  className?: string;
}

function propsToOptions(props: BlossomColorPickerProps): Partial<BlossomColorPickerOptions> {
  const opts: Partial<BlossomColorPickerOptions> = {};

  if (props.value !== undefined) opts.value = props.value;
  if (props.defaultValue !== undefined) opts.defaultValue = props.defaultValue;
  if (props.colors !== undefined) opts.colors = props.colors;
  if (props.onChange !== undefined) opts.onChange = props.onChange;
  if (props.onCollapse !== undefined) opts.onCollapse = props.onCollapse;
  if (props.disabled !== undefined) opts.disabled = props.disabled;
  if (props.openOnHover !== undefined) opts.openOnHover = props.openOnHover;
  if (props.initialExpanded !== undefined) opts.initialExpanded = props.initialExpanded;
  if (props.animationDuration !== undefined) opts.animationDuration = props.animationDuration;
  if (props.showAlphaSlider !== undefined) opts.showAlphaSlider = props.showAlphaSlider;
  if (props.coreSize !== undefined) opts.coreSize = props.coreSize;
  if (props.petalSize !== undefined) opts.petalSize = props.petalSize;
  if (props.showCoreColor !== undefined) opts.showCoreColor = props.showCoreColor;
  if (props.sliderPosition !== undefined) opts.sliderPosition = props.sliderPosition;
  if (props.adaptivePositioning !== undefined) opts.adaptivePositioning = props.adaptivePositioning;

  return opts;
}

export const BlossomColorPicker = forwardRef(function BlossomColorPicker(
  props: BlossomColorPickerProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<CorePicker | null>(null);

  // Mount core instance
  useEffect(() => {
    if (!containerRef.current) return;
    pickerRef.current = new CorePicker(containerRef.current, propsToOptions(props));
    return () => {
      pickerRef.current?.destroy();
      pickerRef.current = null;
    };
  }, []);

  useEffect(() => {
    pickerRef.current?.setOptions({
      value: props.value,
      onChange: props.onChange,
      onCollapse: props.onCollapse,
    });
  }, [props.value, props.onChange, props.onCollapse]);

  useEffect(() => {
    pickerRef.current?.setOptions(propsToOptions(props));
  }, [
    props.colors, props.disabled, props.openOnHover,
    props.initialExpanded, props.animationDuration,
    props.showAlphaSlider, props.coreSize, props.petalSize,
    props.showCoreColor, props.sliderPosition, props.adaptivePositioning,
  ]);

  // Forward ref
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(containerRef.current);
    } else {
      ref.current = containerRef.current;
    }
  }, [ref]);

  return createElement('div', {
    ref: containerRef,
    className: props.className,
  });
});

export default BlossomColorPicker;
