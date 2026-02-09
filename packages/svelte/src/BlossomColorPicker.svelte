<script lang="ts">
  import {
    BlossomColorPicker as CorePicker,
    type BlossomColorPickerOptions,
    type BlossomColorPickerValue,
    type ColorInput,
    type SliderPosition,
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
    coreSize?: number;
    petalSize?: number;
    showCoreColor?: boolean;
    sliderPosition?: SliderPosition;
    adaptivePositioning?: boolean;
    class?: string;
    onchange?: (color: BlossomColorPickerColor) => void;
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
    coreSize = 32,
    petalSize = 32,
    showCoreColor = true,
    sliderPosition = undefined,
    adaptivePositioning = true,
    class: className = '',
    onchange = undefined,
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
      coreSize,
      petalSize,
      showCoreColor,
      sliderPosition,
      adaptivePositioning,
      onChange: onchange,
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
