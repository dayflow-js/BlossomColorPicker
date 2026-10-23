<script lang="ts">
  import {
    ChromePicker as CorePicker,
    type ChromePickerOptions,
    type BlossomColorPickerValue,
    type ColorInput,
    type SliderPosition,
    type PetalShape,
    type PetalStyle,
    type BlossomColorPickerColor,
    type ChromePickerThemeColors
  } from '@dayflow/blossom-color-picker';
  import { onMount } from 'svelte';

  interface Props {
    value?: BlossomColorPickerValue;
    defaultValue?: BlossomColorPickerValue;
    colors?: ColorInput[];
    disabled?: boolean;
    openOnHover?: boolean;
    initialExpanded?: boolean;
    animationDuration?: number;
    showAlphaSlider?: boolean;
    showShadeSlider?: boolean;
    petalShape?: PetalShape;
    petalStyle?: PetalStyle;
    hoverPreview?: boolean;
    coreSize?: number;
    petalSize?: number;
    showCoreColor?: boolean;
    sliderPosition?: SliderPosition;
    adaptivePositioning?: boolean;
    circularBarWidth?: number;
    sliderWidth?: number;
    sliderOffset?: number;
    collapsible?: boolean;
    darkMode?: boolean;
    darkModeColors?: Partial<ChromePickerThemeColors>;
    class?: string;
    onchange?: (color: BlossomColorPickerColor) => void;
    onchangecomplete?: (color: BlossomColorPickerColor) => void;
    onhover?: (color: BlossomColorPickerColor | null) => void;
    oncollapse?: (color: BlossomColorPickerColor) => void;
  }

  let {
    value = undefined,
    defaultValue = undefined,
    colors = undefined,
    disabled = false,
    openOnHover = false,
    initialExpanded = false,
    animationDuration = 300,
    showAlphaSlider = true,
    showShadeSlider = undefined,
    petalShape = undefined,
    petalStyle = undefined,
    hoverPreview = undefined,
    coreSize = 32,
    petalSize = 32,
    showCoreColor = true,
    sliderPosition = undefined,
    adaptivePositioning = true,
    circularBarWidth = undefined,
    sliderWidth = undefined,
    sliderOffset = undefined,
    collapsible = false,
    darkMode = undefined,
    darkModeColors = undefined,
    class: className = '',
    onchange = undefined,
    onchangecomplete = undefined,
    onhover = undefined,
    oncollapse = undefined,
  }: Props = $props();

  let container: HTMLDivElement;
  let picker: CorePicker | null = null;

  function getOptions(): ChromePickerOptions {
    return {
      value,
      defaultValue,
      colors,
      disabled,
      openOnHover,
      initialExpanded,
      animationDuration,
      showAlphaSlider,
      showShadeSlider,
      petalShape,
      petalStyle,
      hoverPreview,
      coreSize,
      petalSize,
      showCoreColor,
      sliderPosition,
      adaptivePositioning,
      circularBarWidth,
      sliderWidth,
      sliderOffset,
      collapsible,
      darkMode,
      darkModeColors,
      onChange: onchange,
      onChangeComplete: onchangecomplete,
      onHover: onhover,
      onCollapse: oncollapse,
    };
  }

  onMount(() => {
    picker = new CorePicker(container, getOptions());
    return () => {
      picker?.destroy();
      picker = null;
    };
  });

  $effect(() => {
    if (picker) {
      picker.setOptions(getOptions());
    }
  });
</script>

<div bind:this={container} class={className}></div>
