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
    /**
     * Controlled value. When set, the picker always shows this value; update it
     * from the change event to reflect user picks.
     */
    value?: BlossomColorPickerValue;
    /**
     * Initial value when the picker is uncontrolled (no `value`).
     * @default { hue: 330, saturation: 70, alpha: 100, layer: 'outer' }
     */
    defaultValue?: BlossomColorPickerValue;
    /**
     * Petal colors as hex, `rgb()`/`rgba()`, `hsl()`/`hsla()` strings or
     * `{ h, s, l }` objects, sorted into inner and outer layers automatically.
     * @default DEFAULT_COLORS
     */
    colors?: ColorInput[];
    /**
     * Disable all user interaction.
     * @default false
     */
    disabled?: boolean;
    /**
     * Expand the picker when the pointer hovers over it.
     * @default false
     */
    openOnHover?: boolean;
    /**
     * Start with the picker expanded.
     * @default false
     */
    initialExpanded?: boolean;
    /**
     * Base timing of the bloom animation in milliseconds. Every phase scales
     * with it, so the full open takes about twice this value.
     * @default 280
     */
    animationDuration?: number;
    /**
     * @deprecated Use `showShadeSlider`. This controls shade, not opacity.
     * `showShadeSlider` wins when both are set.
     * @default true
     */
    showAlphaSlider?: boolean;
    /**
     * Show the shade (brightness) arc slider around the petals.
     * @default true
     */
    showShadeSlider?: boolean;
    /**
     * Petal outline. Every shape except `circle` points its tip away from the core.
     * @default 'circle'
     */
    petalShape?: PetalShape;
    /**
     * Surface detail on shaped petals. Ignored for `circle`.
     * @default 'flat'
     */
    petalStyle?: PetalStyle;
    /**
     * Show the hovered or focused petal's color on the ring, background and core
     * before it is picked.
     * @default false
     */
    hoverPreview?: boolean;
    /**
     * Diameter of the center core button in pixels.
     * @default 32
     */
    coreSize?: number;
    /**
     * Diameter of each petal in pixels.
     * @default 32
     */
    petalSize?: number;
    /**
     * Show the selected color in the expanded core. When `false`, the expanded
     * core is white.
     * @default false
     */
    showCoreColor?: boolean;
    /**
     * Fixed side for the arc slider. When omitted, the slider starts on the
     * right and may move to stay inside the viewport.
     * @default undefined
     */
    sliderPosition?: SliderPosition;
    /**
     * Shift the expanded picker and arc slider so they stay inside the viewport.
     * @default true
     */
    adaptivePositioning?: boolean;
    /**
     * Width of the circular hue bar in pixels.
     * @default 12
     */
    circularBarWidth?: number;
    /**
     * Width of the arc slider track and handle in pixels.
     * @default 12
     */
    sliderWidth?: number;
    /**
     * Gap between the petals and the arc slider in pixels.
     * @default 30
     */
    sliderOffset?: number;
    /**
     * Allow the picker to collapse back to the core button. When `false`, it
     * stays expanded.
     * @default true
     */
    collapsible?: boolean;
    /** Extra CSS class for the root element. */
    class?: string;
    /** Called whenever the selected color changes, including during a shade drag. */
    onchange?: (color: BlossomColorPickerColor) => void;
    /**
     * Called once when a petal is picked or a shade drag or key press ends.
     * Use it for saving or undo history.
     */
    onchangecomplete?: (color: BlossomColorPickerColor) => void;
    /**
     * Called with the color a hovered or keyboard-focused petal would select,
     * and with `null` when the preview ends.
     */
    onhover?: (color: BlossomColorPickerColor | null) => void;
    /** Called with the current color when the picker collapses. */
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
