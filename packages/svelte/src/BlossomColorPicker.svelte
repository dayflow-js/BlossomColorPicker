<script lang="ts">
  import {
    BlossomColorPicker as CorePicker,
    type BlossomColorPickerOptions,
    type BlossomColorPickerValue,
    type ColorInput,
    type SliderPosition,
    type PetalShape,
    type PetalStyle,
    type BlossomColorPickerColor
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
    animationDuration = 280,
    showAlphaSlider = true,
    showShadeSlider = undefined,
    petalShape = undefined,
    petalStyle = undefined,
    hoverPreview = undefined,
    coreSize = 32,
    petalSize = 32,
    showCoreColor = false,
    sliderPosition = undefined,
    adaptivePositioning = true,
    circularBarWidth = undefined,
    sliderWidth = undefined,
    sliderOffset = undefined,
    collapsible = true,
    class: className = '',
    onchange = undefined,
    onchangecomplete = undefined,
    onhover = undefined,
    oncollapse = undefined,
  }: Props = $props();

  let container: HTMLDivElement;
  let picker: CorePicker | null = null;

  function getOptions(): BlossomColorPickerOptions {
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
