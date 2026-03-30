import '@dayflow/blossom-color-picker/styles.css';
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  type PropType,
} from 'vue';
import {
  BlossomColorPicker as CorePicker,
  ChromePicker as CoreChromePicker,
  type BlossomColorPickerValue,
  type BlossomColorPickerColor,
  type ColorInput,
  type SliderPosition,
} from '@dayflow/blossom-color-picker';

// Re-export types
export type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  SliderPosition,
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

function getCommonOptions(props: any, onChange: any, onCollapse: any) {
  return {
    value: props.value,
    defaultValue: props.defaultValue,
    colors: props.colors,
    disabled: props.disabled,
    openOnHover: props.openOnHover,
    initialExpanded: props.initialExpanded,
    animationDuration: props.animationDuration,
    showAlphaSlider: props.showAlphaSlider,
    coreSize: props.coreSize,
    petalSize: props.petalSize,
    showCoreColor: props.showCoreColor,
    sliderPosition: props.sliderPosition,
    adaptivePositioning: props.adaptivePositioning,
    circularBarWidth: props.circularBarWidth,
    sliderWidth: props.sliderWidth,
    sliderOffset: props.sliderOffset,
    collapsible: props.collapsible,
    onChange,
    onCollapse,
  };
}

export const BlossomColorPicker = defineComponent({
  name: 'BlossomColorPicker',
  props: commonProps,
  emits: ['change', 'collapse'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let picker: CorePicker | null = null;

    const onChange = (color: BlossomColorPickerColor) => emit('change', color);
    const onCollapse = (color: BlossomColorPickerColor) => emit('collapse', color);

    onMounted(() => {
      if (!containerRef.value) return;
      picker = new CorePicker(containerRef.value, getCommonOptions(props, onChange, onCollapse));
    });

    watch(() => props.value, (val) => {
      picker?.setOptions({ value: val, onChange, onCollapse });
    }, { deep: true });

    watch(
      () => [
        props.colors, props.disabled, props.openOnHover,
        props.initialExpanded, props.animationDuration,
        props.showAlphaSlider, props.coreSize, props.petalSize,
        props.showCoreColor, props.sliderPosition, props.adaptivePositioning,
        props.circularBarWidth, props.sliderWidth, props.sliderOffset,
        props.collapsible,
      ],
      () => {
        picker?.setOptions(getCommonOptions(props, onChange, onCollapse));
      },
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
    collapsible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'collapse'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let picker: CoreChromePicker | null = null;

    const onChange = (color: BlossomColorPickerColor) => emit('change', color);
    const onCollapse = (color: BlossomColorPickerColor) => emit('collapse', color);

    onMounted(() => {
      if (!containerRef.value) return;
      picker = new CoreChromePicker(containerRef.value, getCommonOptions(props, onChange, onCollapse));
    });

    watch(() => props.value, (val) => {
      picker?.setOptions({ value: val, onChange, onCollapse });
    }, { deep: true });

    watch(
      () => [
        props.colors, props.disabled, props.openOnHover,
        props.initialExpanded, props.animationDuration,
        props.showAlphaSlider, props.coreSize, props.petalSize,
        props.showCoreColor, props.sliderPosition, props.adaptivePositioning,
        props.circularBarWidth, props.sliderWidth, props.sliderOffset,
        props.collapsible,
      ],
      () => {
        picker?.setOptions(getCommonOptions(props, onChange, onCollapse));
      },
    );

    onBeforeUnmount(() => {
      picker?.destroy();
      picker = null;
    });

    return () => h('div', { ref: containerRef });
  },
});

export default BlossomColorPicker;
