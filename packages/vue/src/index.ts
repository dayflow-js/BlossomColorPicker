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
  value: {
    type: Object as PropType<BlossomColorPickerValue>,
    default: undefined,
  },
  defaultValue: {
    type: Object as PropType<BlossomColorPickerValue>,
    default: undefined,
  },
  colors: {
    type: Array as PropType<ColorInput[]>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  openOnHover: {
    type: Boolean,
    default: false,
  },
  initialExpanded: {
    type: Boolean,
    default: false,
  },
  animationDuration: {
    type: Number,
    default: 300,
  },
  showShadeSlider: {
    type: Boolean,
    default: undefined,
  },
  showAlphaSlider: {
    type: Boolean,
    default: true,
  },
  coreSize: {
    type: Number,
    default: 32,
  },
  petalSize: {
    type: Number,
    default: 32,
  },
  showCoreColor: {
    type: Boolean,
    default: true,
  },
  sliderPosition: {
    type: String as PropType<SliderPosition>,
    default: undefined,
  },
  petalShape: {
    type: String as PropType<PetalShape>,
    default: undefined,
  },
  petalStyle: {
    type: String as PropType<PetalStyle>,
    default: undefined,
  },
  hoverPreview: {
    type: Boolean,
    default: undefined,
  },
  adaptivePositioning: {
    type: Boolean,
    default: true,
  },
  circularBarWidth: {
    type: Number,
    default: undefined,
  },
  sliderWidth: {
    type: Number,
    default: undefined,
  },
  sliderOffset: {
    type: Number,
    default: undefined,
  },
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

export const BlossomColorPicker = defineComponent({
  name: 'BlossomColorPicker',
  props: {
    ...commonProps,
    animationDuration: { type: Number, default: 280 },
    showCoreColor: { type: Boolean, default: false },
  },
  emits: ['change', 'changeComplete', 'collapse', 'hover'],
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
});

export const ChromePicker = defineComponent({
  name: 'ChromePicker',
  props: {
    ...commonProps,
    darkMode: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
    darkModeColors: {
      type: Object as PropType<Partial<ChromePickerThemeColors>>,
      default: undefined,
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'changeComplete', 'collapse', 'hover'],
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
});

export default BlossomColorPicker;
