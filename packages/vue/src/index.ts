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

export const BlossomColorPicker = defineComponent({
  name: 'BlossomColorPicker',
  props: {
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
  },
  emits: ['change', 'collapse'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let picker: CorePicker | null = null;

    // Stable callback refs — avoid creating new functions on every watch trigger
    const onChange = (color: BlossomColorPickerColor) => emit('change', color);
    const onCollapse = (color: BlossomColorPickerColor) => emit('collapse', color);

    function getOptions() {
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
        onChange,
        onCollapse,
      };
    }

    onMounted(() => {
      if (!containerRef.value) return;
      picker = new CorePicker(containerRef.value, getOptions());
    });

    // Watch value separately 
    watch(() => props.value, (val) => {
      picker?.setOptions({ value: val, onChange, onCollapse });
    }, { deep: true });

    // Watch structural props 
    watch(
      () => [
        props.colors, props.disabled, props.openOnHover,
        props.initialExpanded, props.animationDuration,
        props.showAlphaSlider, props.coreSize, props.petalSize,
        props.showCoreColor, props.sliderPosition, props.adaptivePositioning,
      ],
      () => {
        picker?.setOptions(getOptions());
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
