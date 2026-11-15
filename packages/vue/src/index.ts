import '@dayflow/blossom-color-picker/styles.css';
import {
  BlossomColorPicker as CorePicker,
  ChromePicker as CoreChromePicker,
  type BlossomColorPickerValue,
  type BlossomColorPickerColor,
  type ColorInput,
  type SliderPosition,
  type PetalShape,
  type PetalStyle,
  type ChromePickerThemeColors,
} from '@dayflow/blossom-color-picker';
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  type ComponentOptionsMixin,
  type DefineComponent,
  type ExtractPropTypes,
  type PublicProps,
  type PropType,
} from 'vue';

// Re-export types
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
  PetalShape,
  PetalStyle,
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

const commonProps = {
  /**
   * Controlled value. When set, the picker always shows this value; update it
   * from the change event to reflect user picks.
   */
  value: {
    type: Object as PropType<BlossomColorPickerValue>,
    default: undefined,
  },
  /**
   * Initial value when the picker is uncontrolled (no `value`).
   * @default { hue: 330, saturation: 70, alpha: 100, layer: 'outer' }
   */
  defaultValue: {
    type: Object as PropType<BlossomColorPickerValue>,
    default: undefined,
  },
  /**
   * Petal colors as hex, `rgb()`/`rgba()`, `hsl()`/`hsla()` strings or
   * `{ h, s, l }` objects, sorted into inner and outer layers automatically.
   * @default DEFAULT_COLORS
   */
  colors: {
    type: Array as PropType<ColorInput[]>,
    default: undefined,
  },
  /**
   * Disable all user interaction.
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * Expand the picker when the pointer hovers over it.
   * @default false
   */
  openOnHover: {
    type: Boolean,
    default: false,
  },
  /**
   * Start with the picker expanded.
   * @default false
   */
  initialExpanded: {
    type: Boolean,
    default: false,
  },
  /**
   * Base timing of the bloom animation in milliseconds. Every phase scales
   * with it, so the full open takes about twice this value.
   * @default 300
   */
  animationDuration: {
    type: Number,
    default: 300,
  },
  /**
   * Show the shade (brightness) arc slider around the petals.
   * @default true
   */
  showShadeSlider: {
    type: Boolean,
    default: undefined,
  },
  /**
   * @deprecated Use `showShadeSlider`. This controls shade, not opacity.
   * `showShadeSlider` wins when both are set.
   * @default true
   */
  showAlphaSlider: {
    type: Boolean,
    default: true,
  },
  /**
   * Diameter of the center core button in pixels.
   * @default 32
   */
  coreSize: {
    type: Number,
    default: 32,
  },
  /**
   * Diameter of each petal in pixels.
   * @default 32
   */
  petalSize: {
    type: Number,
    default: 32,
  },
  /**
   * Show the selected color in the expanded core. When `false`, the expanded
   * core is white.
   * @default true
   */
  showCoreColor: {
    type: Boolean,
    default: true,
  },
  /**
   * Fixed side for the arc slider. When omitted, the slider starts on the
   * right and may move to stay inside the viewport.
   * @default undefined
   */
  sliderPosition: {
    type: String as PropType<SliderPosition>,
    default: undefined,
  },
  /**
   * Petal outline. Every shape except `circle` points its tip away from the core.
   * @default 'circle'
   */
  petalShape: {
    type: String as PropType<PetalShape>,
    default: undefined,
  },
  /**
   * Surface detail on shaped petals. Ignored for `circle`.
   * @default 'flat'
   */
  petalStyle: {
    type: String as PropType<PetalStyle>,
    default: undefined,
  },
  /**
   * Show the hovered or focused petal's color on the ring, background and core
   * before it is picked.
   * @default false
   */
  hoverPreview: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Shift the expanded picker and arc slider so they stay inside the viewport.
   * @default true
   */
  adaptivePositioning: {
    type: Boolean,
    default: true,
  },
  /**
   * Width of the circular hue bar in pixels.
   * @default 12
   */
  circularBarWidth: {
    type: Number,
    default: undefined,
  },
  /**
   * Width of the arc slider track and handle in pixels.
   * @default 12
   */
  sliderWidth: {
    type: Number,
    default: undefined,
  },
  /**
   * Gap between the petals and the arc slider in pixels.
   * @default 30
   */
  sliderOffset: {
    type: Number,
    default: undefined,
  },
  /**
   * Allow the picker to collapse back to the core button. When `false`, it
   * stays expanded.
   * @default true
   */
  collapsible: {
    type: Boolean,
    default: true,
  },
};

function getCommonOptions(
  props: any,
  onChange: any,
  onCollapse: any,
  onChangeComplete: any,
  onHover: any
) {
  return {
    value: props.value,
    defaultValue: props.defaultValue,
    colors: props.colors,
    disabled: props.disabled,
    openOnHover: props.openOnHover,
    initialExpanded: props.initialExpanded,
    animationDuration: props.animationDuration,
    showAlphaSlider: props.showAlphaSlider,
    showShadeSlider: props.showShadeSlider,
    coreSize: props.coreSize,
    petalSize: props.petalSize,
    showCoreColor: props.showCoreColor,
    sliderPosition: props.sliderPosition,
    adaptivePositioning: props.adaptivePositioning,
    circularBarWidth: props.circularBarWidth,
    sliderWidth: props.sliderWidth,
    sliderOffset: props.sliderOffset,
    collapsible: props.collapsible,
    petalShape: props.petalShape,
    petalStyle: props.petalStyle,
    hoverPreview: props.hoverPreview,
    onChange,
    onChangeComplete,
    onCollapse,
    onHover,
  };
}

function getChromeOptions(
  props: any,
  onChange: any,
  onCollapse: any,
  onChangeComplete: any,
  onHover: any
) {
  return {
    ...getCommonOptions(props, onChange, onCollapse, onChangeComplete, onHover),
    darkMode: props.darkMode,
    darkModeColors: props.darkModeColors,
  };
}

// Object form so each event carries JSDoc and a typed payload. The
// validators only document the payload; they always pass.
const pickerEmits = {
  /** Emitted whenever the selected color changes, including during a shade drag. */
  change: (color: BlossomColorPickerColor) => color !== undefined,
  /**
   * Emitted once when a petal is picked or a shade drag or key press ends.
   * Use it for saving or undo history.
   */
  changeComplete: (color: BlossomColorPickerColor) => color !== undefined,
  /** Emitted with the current color when the picker collapses. */
  collapse: (color: BlossomColorPickerColor) => color !== undefined,
  /**
   * Emitted with the color a hovered or keyboard-focused petal would select,
   * and with `null` when the preview ends.
   */
  hover: (color: BlossomColorPickerColor | null) => color !== undefined,
};

// Vue derives `onChange` etc. from `emits` but drops their JSDoc, so the
// listener props are declared here (types only) in place of the derived ones
// to keep the event docs on hover.
interface PickerListenerProps {
  /** Emitted whenever the selected color changes, including during a shade drag. */
  onChange?: (color: BlossomColorPickerColor) => any;
  /**
   * Emitted once when a petal is picked or a shade drag or key press ends.
   * Use it for saving or undo history.
   */
  onChangeComplete?: (color: BlossomColorPickerColor) => any;
  /** Emitted with the current color when the picker collapses. */
  onCollapse?: (color: BlossomColorPickerColor) => any;
  /**
   * Emitted with the color a hovered or keyboard-focused petal would select,
   * and with `null` when the preview ends.
   */
  onHover?: (color: BlossomColorPickerColor | null) => any;
}

type PickerComponent<Props> = DefineComponent<
  Props,
  {},
  {},
  {},
  {},
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  typeof pickerEmits,
  keyof typeof pickerEmits,
  PublicProps,
  Readonly<ExtractPropTypes<Props>> & Readonly<PickerListenerProps>
>;

const blossomProps = {
  ...commonProps,
  /**
   * Base timing of the bloom animation in milliseconds. Every phase scales
   * with it, so the full open takes about twice this value.
   * @default 280
   */
  animationDuration: { type: Number, default: 280 },
  /**
   * Show the selected color in the expanded core. When `false`, the expanded
   * core is white.
   * @default false
   */
  showCoreColor: { type: Boolean, default: false },
};

// Asserted to DefineComponent<typeof props> so the published types keep each
// prop's JSDoc on hover; the inferred type inlines defaulted props without it.
export const BlossomColorPicker = defineComponent({
  name: 'BlossomColorPicker',
  props: blossomProps,
  emits: pickerEmits,
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let picker: CorePicker | null = null;

    const onChange = (color: BlossomColorPickerColor) => emit('change', color);
    const onChangeComplete = (color: BlossomColorPickerColor) =>
      emit('changeComplete', color);
    const onCollapse = (color: BlossomColorPickerColor) =>
      emit('collapse', color);
    const onHover = (color: BlossomColorPickerColor | null) =>
      emit('hover', color);

    onMounted(() => {
      if (!containerRef.value) return;
      picker = new CorePicker(
        containerRef.value,
        getCommonOptions(props, onChange, onCollapse, onChangeComplete, onHover)
      );
    });

    watch(
      () => props.value,
      val => {
        picker?.setOptions({
          value: val,
          onChange,
          onCollapse,
          onChangeComplete,
        });
      },
      { deep: true }
    );

    watch(
      () => [
        props.colors,
        props.disabled,
        props.openOnHover,
        props.initialExpanded,
        props.animationDuration,
        props.showAlphaSlider,
        props.showShadeSlider,
        props.petalShape,
        props.petalStyle,
        props.hoverPreview,
        props.coreSize,
        props.petalSize,
        props.showCoreColor,
        props.sliderPosition,
        props.adaptivePositioning,
        props.circularBarWidth,
        props.sliderWidth,
        props.sliderOffset,
        props.collapsible,
      ],
      () => {
        picker?.setOptions(
          getCommonOptions(
            props,
            onChange,
            onCollapse,
            onChangeComplete,
            onHover
          )
        );
      }
    );

    onBeforeUnmount(() => {
      picker?.destroy();
      picker = null;
    });

    return () => h('div', { ref: containerRef });
  },
}) as PickerComponent<typeof blossomProps>;

const chromeProps = {
  ...commonProps,
  /**
   * Force dark (`true`) or light (`false`) theme. When omitted, the picker
   * follows a `.dark` class on an ancestor or `<html>`, then the system
   * `prefers-color-scheme`.
   * @default undefined
   */
  darkMode: {
    type: null as unknown as PropType<boolean | undefined>,
    default: undefined,
  },
  /** Theme color overrides applied only while the dark theme is active. */
  darkModeColors: {
    type: Object as PropType<Partial<ChromePickerThemeColors>>,
    default: undefined,
  },
  /**
   * Allow the picker to collapse back to the core button. When `false`, it
   * stays expanded.
   * @default false
   */
  collapsible: {
    type: Boolean,
    default: false,
  },
};

// Asserted to DefineComponent<typeof props> so the published types keep each
// prop's JSDoc on hover; the inferred type inlines defaulted props without it.
export const ChromePicker = defineComponent({
  name: 'ChromePicker',
  props: chromeProps,
  emits: pickerEmits,
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let picker: CoreChromePicker | null = null;

    const onChange = (color: BlossomColorPickerColor) => emit('change', color);
    const onChangeComplete = (color: BlossomColorPickerColor) =>
      emit('changeComplete', color);
    const onCollapse = (color: BlossomColorPickerColor) =>
      emit('collapse', color);
    const onHover = (color: BlossomColorPickerColor | null) =>
      emit('hover', color);

    onMounted(() => {
      if (!containerRef.value) return;
      picker = new CoreChromePicker(
        containerRef.value,
        getChromeOptions(props, onChange, onCollapse, onChangeComplete, onHover)
      );
    });

    watch(
      () => props.value,
      val => {
        picker?.setOptions({
          value: val,
          onChange,
          onCollapse,
          onChangeComplete,
        });
      },
      { deep: true }
    );

    watch(
      () => [
        props.colors,
        props.disabled,
        props.openOnHover,
        props.initialExpanded,
        props.animationDuration,
        props.showAlphaSlider,
        props.showShadeSlider,
        props.petalShape,
        props.petalStyle,
        props.hoverPreview,
        props.coreSize,
        props.petalSize,
        props.showCoreColor,
        props.sliderPosition,
        props.adaptivePositioning,
        props.circularBarWidth,
        props.sliderWidth,
        props.sliderOffset,
        props.collapsible,
        props.darkMode,
        props.darkModeColors,
      ],
      () => {
        picker?.setOptions(
          getChromeOptions(
            props,
            onChange,
            onCollapse,
            onChangeComplete,
            onHover
          )
        );
      }
    );

    onBeforeUnmount(() => {
      picker?.destroy();
      picker = null;
    });

    return () => h('div', { ref: containerRef });
  },
}) as PickerComponent<typeof chromeProps>;

export default BlossomColorPicker;
