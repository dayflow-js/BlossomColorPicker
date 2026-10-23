import type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
  PetalShape,
  PetalStyle,
  SliderPosition,
} from './types';

function colorsEqual(a: ColorInput[], b: ColorInput[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function clockwiseHueOrder(hue: number): number {
  return (50 - hue + 360) % 360;
}

import { computeAdaptivePosition } from './adaptive';
import {
  DEFAULT_COLORS,
  DEFAULT_ANIMATION_DURATION,
  BLOOM_OPEN_EASING,
  BLOOM_CLOSE_EASING,
  BLOOM_COLLAPSED_SCALE,
  BLOOM_SCALE_DELAY,
  BLOOM_SCALE_DURATION,
  COLLAPSE_DELAY,
  COLLAPSE_DURATION,
  TRIGGER_FADE_DURATION,
  TRIGGER_COLLAPSED_SCALE,
  TRIGGER_POP_DELAY,
  TRIGGER_POP_DURATION,
  TRIGGER_POP_EASING,
  PETAL_SWEEP,
  PETAL_SWEEP_EASE,
  PETAL_OVERSHOOT_FIRST,
  PETAL_OVERSHOOT_LAST,
  petalSpringEasing,
  HOVER_DELAY,
  bloomTime,
  BAR_GAP,
  BAR_WIDTH,
  SLIDER_OFFSET,
} from './constants';
import { createElement, setStyles } from './dom-helpers';
import {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout';
import { ArcSliderRenderer } from './renderers/ArcSliderRenderer';
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { ColorBarRenderer } from './renderers/ColorBarRenderer';
import { CoreButtonRenderer } from './renderers/CoreButtonRenderer';
import { PetalRenderer } from './renderers/PetalRenderer';
import {
  lightnessToSliderValue,
  sliderValueToLightness,
  hslaToString,
  createColorOutput,
  organizeColorsIntoLayers,
  getVisualSaturation,
  parseColor,
} from './utils';

export interface BlossomColorPickerOptions {
  value?: BlossomColorPickerValue;
  defaultValue?: BlossomColorPickerValue;
  colors?: ColorInput[];
  onChange?: (color: BlossomColorPickerColor) => void;
  onChangeComplete?: (color: BlossomColorPickerColor) => void;
  onCollapse?: (color: BlossomColorPickerColor) => void;
  /**
   * Called when a petal is hovered or receives keyboard focus, with the color
   * it would select, and with `null` when the preview ends.
   */
  onHover?: (color: BlossomColorPickerColor | null) => void;
  /** Show the hovered or focused petal's color on the ring and core before it is picked. */
  hoverPreview?: boolean;
  petalShape?: PetalShape;
  /** Surface detail on shaped petals. Ignored for `circle`. */
  petalStyle?: PetalStyle;
  disabled?: boolean;
  openOnHover?: boolean;
  initialExpanded?: boolean;
  animationDuration?: number;
  /** @deprecated Use showShadeSlider. This controls shade, not opacity. */
  showAlphaSlider?: boolean;
  showShadeSlider?: boolean;
  coreSize?: number;
  petalSize?: number;
  showCoreColor?: boolean;
  sliderPosition?: SliderPosition;
  adaptivePositioning?: boolean;
  circularBarWidth?: number;
  sliderWidth?: number;
  sliderOffset?: number;
  collapsible?: boolean;
}

const DEFAULT_VALUE: BlossomColorPickerValue = {
  hue: 330,
  saturation: 70,
  alpha: 100,
  layer: 'outer',
};

export class BlossomColorPicker {
  private container: HTMLElement;
  private rootEl!: HTMLDivElement;
  private containerEl!: HTMLDivElement;
  private mousePos: { x: number; y: number } | null = null;
  private rafId: number | null = null;

  private triggerBtn: HTMLButtonElement | null = null;
  private isFirstRender = true;

  // Options
  private opts: Required<
    Omit<
      BlossomColorPickerOptions,
      'value' | 'defaultValue' | 'sliderPosition' | 'showAlphaSlider'
    >
  > & {
    sliderPosition?: SliderPosition;
  };

  // State
  private internalValue: BlossomColorPickerValue;
  private controlledValue?: BlossomColorPickerValue;
  private isExpanded = false;
  private isHovering = false;
  private hoveredPetal: { layer: number; index: number } | null = null;
  private previewValue: BlossomColorPickerValue | null = null;
  private prevExpanded = false;
  private shiftOffset = { x: 0, y: 0 };
  private effectivePosition: SliderPosition = 'right';
  /** Set when slider placement options change, so an open bloom re-places its arc. */
  private placementChanged = false;

  // Computed
  private normalizedColors: { h: number; s: number; l: number }[] = [];
  private layers: { h: number; s: number; l: number }[][] = [];
  private allColors: { h: number; s: number; l: number }[] = [];
  private layerPrefixCounts: number[] = [];
  private layerRadii: number[] = [];
  private layerRotations: number[] = [];
  private barRadius = 0;
  private containerSize = 0;

  // Renderers
  private focusedColorIndex?: number;
  private petalButtons: HTMLButtonElement[][] = [];
  private pendingSliderColor: BlossomColorPickerColor | null = null;
  private petalRenderers: PetalRenderer[] = [];
  private colorBarRenderer!: ColorBarRenderer;
  private arcSliderRenderer: ArcSliderRenderer | null = null;
  private coreButtonRenderer!: CoreButtonRenderer;
  private backgroundRenderer!: BackgroundRenderer;

  // Timeouts
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Bound handlers
  private boundClickOutside: (e: PointerEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;

  constructor(
    container: HTMLElement,
    options?: Partial<BlossomColorPickerOptions>
  ) {
    this.container = container;

    const defaultValue = options?.defaultValue ?? DEFAULT_VALUE;

    this.opts = {
      colors: options?.colors ?? [],
      onChange: options?.onChange ?? (() => {}),
      onChangeComplete: options?.onChangeComplete ?? (() => {}),
      onCollapse: options?.onCollapse ?? (() => {}),
      onHover: options?.onHover ?? (() => {}),
      hoverPreview: options?.hoverPreview ?? false,
      petalShape: options?.petalShape ?? 'circle',
      petalStyle: options?.petalStyle ?? 'flat',
      disabled: options?.disabled ?? false,
      openOnHover: options?.openOnHover ?? false,
      initialExpanded: options?.initialExpanded ?? false,
      animationDuration:
        options?.animationDuration ?? DEFAULT_ANIMATION_DURATION,
      showShadeSlider:
        options?.showShadeSlider ?? options?.showAlphaSlider ?? true,
      coreSize: options?.coreSize ?? 32,
      petalSize: options?.petalSize ?? 32,
      showCoreColor: options?.showCoreColor ?? false,
      sliderPosition: options?.sliderPosition,
      adaptivePositioning: options?.adaptivePositioning ?? true,
      circularBarWidth: options?.circularBarWidth ?? BAR_WIDTH,
      sliderWidth: options?.sliderWidth ?? BAR_WIDTH,
      sliderOffset: options?.sliderOffset ?? SLIDER_OFFSET,
      collapsible: options?.collapsible ?? true,
    };

    this.controlledValue = options?.value;
    this.internalValue = options?.value ?? defaultValue;
    this.isExpanded = !this.opts.collapsible || this.opts.initialExpanded;
    this.prevExpanded = this.isExpanded;
    this.effectivePosition = this.opts.sliderPosition || 'right';

    this.boundClickOutside = this.handleClickOutside.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);

    this.computeLayout();
    this.render();
    this.update();
    this.bindEvents();
    if (this.isExpanded && this.opts.collapsible) {
      document.addEventListener('pointerdown', this.boundClickOutside);
    }
  }

  // --- Public API ---

  setValue(value: BlossomColorPickerValue): void {
    this.controlledValue = value;
    this.internalValue = value;
    this.update();
  }

  getValue(): BlossomColorPickerColor {
    return this.colorOutput(this.currentValue);
  }

  private colorOutput(val: BlossomColorPickerValue): BlossomColorPickerColor {
    const shade = val.saturation;
    const base = this.getBaseSaturation(val);
    return {
      ...createColorOutput(
        val.hue,
        shade,
        getVisualSaturation(shade, base),
        base,
        val.lightness ?? sliderValueToLightness(shade),
        val.alpha,
        val.layer
      ),
      colorIndex: val.colorIndex,
    };
  }

  expand(): void {
    this.setExpanded(true);
  }

  collapse(): void {
    this.setExpanded(false);
  }

  toggle(): void {
    this.setExpanded(!this.isExpanded);
  }

  setOptions(options: Partial<BlossomColorPickerOptions>): void {
    let needsRerender = false;

    if ('value' in options) {
      this.internalValue = options.value ?? this.currentValue;
      this.controlledValue = options.value;
    }

    if ('onChange' in options)
      this.opts.onChange = options.onChange ?? (() => {});
    if ('onChangeComplete' in options)
      this.opts.onChangeComplete = options.onChangeComplete ?? (() => {});
    if (options.onCollapse !== undefined)
      this.opts.onCollapse = options.onCollapse;
    if ('onHover' in options) this.opts.onHover = options.onHover ?? (() => {});
    if (options.hoverPreview !== undefined)
      this.opts.hoverPreview = options.hoverPreview;
    if (
      options.petalShape !== undefined &&
      options.petalShape !== this.opts.petalShape
    ) {
      this.opts.petalShape = options.petalShape;
      needsRerender = true;
    }
    if (
      options.petalStyle !== undefined &&
      options.petalStyle !== this.opts.petalStyle
    ) {
      this.opts.petalStyle = options.petalStyle;
      needsRerender = true;
    }
    if (options.disabled !== undefined) this.opts.disabled = options.disabled;
    if (options.openOnHover !== undefined)
      this.opts.openOnHover = options.openOnHover;
    if (
      options.animationDuration !== undefined &&
      options.animationDuration !== this.opts.animationDuration
    ) {
      this.opts.animationDuration = options.animationDuration;
      needsRerender = true;
    }
    if (options.showCoreColor !== undefined)
      this.opts.showCoreColor = options.showCoreColor;
    if (
      options.sliderPosition !== undefined &&
      options.sliderPosition !== this.opts.sliderPosition
    ) {
      this.opts.sliderPosition = options.sliderPosition;
      this.placementChanged = true;
    }
    if (
      options.adaptivePositioning !== undefined &&
      options.adaptivePositioning !== this.opts.adaptivePositioning
    ) {
      this.opts.adaptivePositioning = options.adaptivePositioning;
      this.placementChanged = true;
    }

    if (options.initialExpanded !== undefined) {
      this.opts.initialExpanded = options.initialExpanded;
      // Note: initialExpanded is a construction-time option only.
      // We don't call setExpanded() here — the expanded state is
      // managed by user interaction after mount.
    }

    // These require re-render (DOM structure changes) — only if value actually changed
    if (
      options.colors !== undefined &&
      !colorsEqual(options.colors, this.opts.colors)
    ) {
      this.opts.colors = options.colors;
      needsRerender = true;
    }
    if (
      options.coreSize !== undefined &&
      options.coreSize !== this.opts.coreSize
    ) {
      this.opts.coreSize = options.coreSize;
      needsRerender = true;
    }
    if (
      options.petalSize !== undefined &&
      options.petalSize !== this.opts.petalSize
    ) {
      this.opts.petalSize = options.petalSize;
      needsRerender = true;
    }
    if (
      options.circularBarWidth !== undefined &&
      options.circularBarWidth !== this.opts.circularBarWidth
    ) {
      this.opts.circularBarWidth = options.circularBarWidth;
      needsRerender = true;
    }
    if (
      options.sliderWidth !== undefined &&
      options.sliderWidth !== this.opts.sliderWidth
    ) {
      this.opts.sliderWidth = options.sliderWidth;
      needsRerender = true;
    }
    if (
      options.sliderOffset !== undefined &&
      options.sliderOffset !== this.opts.sliderOffset
    ) {
      this.opts.sliderOffset = options.sliderOffset;
      needsRerender = true;
    }
    const showShade = options.showShadeSlider ?? options.showAlphaSlider;
    if (showShade !== undefined && showShade !== this.opts.showShadeSlider) {
      this.opts.showShadeSlider = showShade;
      needsRerender = true;
    }
    if (
      options.collapsible !== undefined &&
      options.collapsible !== this.opts.collapsible
    ) {
      this.opts.collapsible = options.collapsible;
      this.isExpanded = !this.opts.collapsible || this.opts.initialExpanded;
      needsRerender = true;
    }

    if (needsRerender) {
      this.destroyInner();
      this.computeLayout();
      this.render();
    }

    this.update();
    if (this.isExpanded && this.opts.collapsible) {
      document.addEventListener('pointerdown', this.boundClickOutside);
    } else {
      document.removeEventListener('pointerdown', this.boundClickOutside);
    }
  }

  destroy(): void {
    this.unbindEvents();
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
    this.destroyInner();
    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.remove();
    }
  }

  // --- Internal ---

  private get currentValue(): BlossomColorPickerValue {
    return this.controlledValue ?? this.internalValue;
  }

  private get baseSaturation(): number {
    return this.getBaseSaturation(this.currentValue);
  }

  private getBaseSaturation(val: BlossomColorPickerValue): number {
    if (val.originalSaturation !== undefined) return val.originalSaturation;
    if (val.colorIndex !== undefined)
      return this.normalizedColors[val.colorIndex]?.s ?? 70;
    // Legacy values have no identity: match all supplied channels before hue fallback.
    const matches = this.allColors.filter(c => c.h === val.hue);
    const lightness = val.lightness ?? sliderValueToLightness(val.saturation);
    return (
      matches.toSorted(
        (a, b) => Math.abs(a.l - lightness) - Math.abs(b.l - lightness)
      )[0]?.s ?? 70
    );
  }

  private get selectedColor(): string {
    const val = this.currentValue;
    return this.colorOutput(val).hsla;
  }

  /** The value the ring, core and disc show: a hover preview, else the selection. */
  private get displayValue(): BlossomColorPickerValue {
    return (this.opts.hoverPreview && this.previewValue) || this.currentValue;
  }

  private get coreColor(): string {
    return this.opts.showCoreColor
      ? this.colorOutput(this.displayValue).hsla
      : 'var(--bcp-core-bg, #FFFFFF)';
  }

  private computeLayout(): void {
    const colors = this.opts.colors;
    const isDefaultPalette = colors.length === 0;
    this.normalizedColors = isDefaultPalette
      ? DEFAULT_COLORS
      : colors.map(color => ({ ...parseColor(color) }));

    this.focusedColorIndex = undefined;
    this.layers = organizeColorsIntoLayers(this.normalizedColors);
    if (isDefaultPalette) {
      // Match the reference bloom: yellow at 12 o'clock, then warm to cool
      // colors clockwise. Preserve the existing layout for custom palettes.
      this.layers = this.layers.map(layer =>
        layer.toSorted(
          (a, b) => clockwiseHueOrder(a.h) - clockwiseHueOrder(b.h)
        )
      );
    }
    this.allColors = this.layers.flat();

    this.layerPrefixCounts = [0];
    for (let i = 1; i < this.layers.length; i++) {
      this.layerPrefixCounts.push(
        this.layerPrefixCounts[i - 1] + this.layers[i - 1].length
      );
    }

    this.layerRadii = calculateLayerRadii(
      this.layers,
      this.opts.coreSize,
      this.opts.petalSize
    );
    this.layerRotations = isDefaultPalette
      ? this.layers.map(() => 0)
      : calculateLayerRotations(this.layers);
    this.barRadius = calculateBarRadius(
      this.layerRadii,
      this.opts.petalSize,
      this.opts.coreSize,
      BAR_GAP
    );
    this.containerSize = calculateContainerSize(
      this.barRadius,
      this.opts.circularBarWidth,
      this.opts.showShadeSlider,
      this.opts.sliderOffset,
      this.opts.sliderWidth
    );
  }

  private render(): void {
    this.petalButtons = this.layers.map(() => []);
    // Create root if not yet created
    if (!this.rootEl) {
      this.rootEl = createElement('div');
      this.rootEl.className = 'bcp-root';
      this.rootEl.setAttribute('role', 'group');
      this.rootEl.setAttribute('aria-label', 'Color picker');
      setStyles(this.rootEl, {
        width: `${this.opts.coreSize}px`,
        height: `${this.opts.coreSize}px`,
      });

      this.containerEl = createElement('div');
      this.containerEl.className = 'bcp-container';
      setStyles(this.containerEl, {
        left: '50%',
        top: '50%',
        width: `${this.containerSize}px`,
        height: `${this.containerSize}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      });

      this.rootEl.appendChild(this.containerEl);
      this.container.appendChild(this.rootEl);
    }

    setStyles(this.rootEl, {
      width: `${this.opts.coreSize}px`,
      height: `${this.opts.coreSize}px`,
    });

    // Trigger button for collapsible mode
    if (this.opts.collapsible && !this.triggerBtn) {
      this.triggerBtn = createElement('button', undefined, {
        type: 'button',
        'aria-label': 'Open color picker',
        'aria-expanded': String(this.isExpanded),
        tabIndex: '0',
      });
      this.triggerBtn.className = 'bcp-core bcp-trigger-btn';
      setStyles(this.triggerBtn, {
        width: `${this.opts.coreSize}px`,
        height: `${this.opts.coreSize}px`,
        backgroundColor: this.selectedColor,
      });
      this.triggerBtn.addEventListener('click', () => {
        if (this.opts.disabled) return;
        this.toggle();
      });
      this.rootEl.insertBefore(this.triggerBtn, this.containerEl);
    }

    // Background
    this.backgroundRenderer = new BackgroundRenderer(
      this.barRadius + this.opts.circularBarWidth / 2,
      this.opts.animationDuration
    );
    this.containerEl.appendChild(this.backgroundRenderer.el);

    // Color bar
    this.colorBarRenderer = new ColorBarRenderer(
      this.barRadius,
      this.opts.circularBarWidth,
      this.opts.animationDuration
    );
    this.containerEl.appendChild(this.colorBarRenderer.el);

    // Petals
    this.petalRenderers = [];
    for (let layerIdx = 0; layerIdx < this.layers.length; layerIdx++) {
      const layerColors = this.layers[layerIdx];
      const radius = this.layerRadii[layerIdx];
      const rotation = this.layerRotations[layerIdx];
      const totalPetals = layerColors.length;
      const totalLayers = this.layers.length;
      const baseZ = (totalLayers - layerIdx) * 100;

      // Find the petal index closest to 90 degrees (6 o'clock)
      // Visual Angle = (index / total) * 360 - 90 + layerRotation
      let bottomIndex = 0;
      let minDiff = Infinity;
      for (let i = 0; i < totalPetals; i++) {
        const angle = (i / totalPetals) * 360 - 90 + rotation;
        // Normalize angle to [0, 360)
        const normalizedAngle = ((angle % 360) + 360) % 360;
        // Circular difference to 90 degrees
        const diff = Math.min(
          Math.abs(normalizedAngle - 90),
          360 - Math.abs(normalizedAngle - 90)
        );
        if (diff < minDiff) {
          minDiff = diff;
          bottomIndex = i;
        }
      }

      for (let index = 0; index < layerColors.length; index++) {
        const color = layerColors[index];
        // Every layer fans open over the same window. The outermost layer
        // sweeps clockwise and each layer inside it alternates direction, so
        // the fans meet again where they started.
        const sweepsClockwise = (totalLayers - 1 - layerIdx) % 2 === 0;
        const sweepOrder = sweepsClockwise ? index : totalPetals - 1 - index;
        // The sweep starts brisk and slows towards its last petals.
        const sweepProgress = sweepOrder / Math.max(1, totalPetals - 1);
        const staggerDelay = bloomTime(
          sweepProgress ** PETAL_SWEEP_EASE * PETAL_SWEEP,
          this.opts.animationDuration
        );
        const openEasing = petalSpringEasing(
          PETAL_OVERSHOOT_FIRST +
            (PETAL_OVERSHOOT_LAST - PETAL_OVERSHOOT_FIRST) * sweepProgress
        );

        if (index === bottomIndex) {
          // Bottom petal split trick:
          // 1. Underlay (Base): Full petal, no ring, lowest Z. Fills the seam gap.
          // 2. Left Petal: Left half, has ring.
          // 3. Right Petal: Right half, has ring.
          // 4. Interaction Petal: Invisible, handles events.

          const underlayPetal = new PetalRenderer({
            hue: color.h,
            saturation: color.s,
            lightness: color.l,
            index,
            totalPetals,
            petalSize: this.opts.petalSize,
            radius,
            animationDuration: this.opts.animationDuration,
            staggerDelay,
            openEasing,
            zIndex: baseZ - 1, // Lowest
            rotationOffset: rotation,
            alpha: 1,
            pointerEvents: 'none',
            hasShadow: false,
            shape: this.opts.petalShape,
            style: this.opts.petalStyle,
            noRing: true, // Crucial: No ring to avoid double-rendering artifacts
          });
          this.petalRenderers.push(underlayPetal);
          this.containerEl.appendChild(underlayPetal.el);

          const leftPetal = new PetalRenderer({
            hue: color.h,
            saturation: color.s,
            lightness: color.l,
            index,
            totalPetals,
            petalSize: this.opts.petalSize,
            radius,
            animationDuration: this.opts.animationDuration,
            staggerDelay,
            openEasing,
            zIndex: getPetalZIndex(
              index,
              bottomIndex,
              totalPetals,
              layerIdx,
              totalLayers,
              true,
              false
            ),
            rotationOffset: rotation,
            alpha: 1,
            clip: 'left',
            pointerEvents: 'none',
            hasShadow: false,
            shape: this.opts.petalShape,
            style: this.opts.petalStyle,
          });
          this.petalRenderers.push(leftPetal);
          this.containerEl.appendChild(leftPetal.el);

          const rightPetal = new PetalRenderer({
            hue: color.h,
            saturation: color.s,
            lightness: color.l,
            index,
            totalPetals,
            petalSize: this.opts.petalSize,
            radius,
            animationDuration: this.opts.animationDuration,
            staggerDelay,
            openEasing,
            zIndex: getPetalZIndex(
              index,
              bottomIndex,
              totalPetals,
              layerIdx,
              totalLayers,
              false,
              true
            ),
            rotationOffset: rotation,
            alpha: 1,
            clip: 'right',
            pointerEvents: 'none',
            hasShadow: false,
            shape: this.opts.petalShape,
            style: this.opts.petalStyle,
          });
          this.petalRenderers.push(rightPetal);
          this.containerEl.appendChild(rightPetal.el);

          // Invisible interaction petal
          const interactionPetal = new PetalRenderer(
            {
              hue: color.h,
              saturation: color.s,
              lightness: color.l,
              index,
              totalPetals,
              petalSize: this.opts.petalSize,
              radius,
              animationDuration: this.opts.animationDuration,
              staggerDelay,
              openEasing,
              zIndex: baseZ + totalPetals + 20,
              rotationOffset: rotation,
              alpha: 0,
              pointerEvents: 'auto',
              hasShadow: false,
              shape: this.opts.petalShape,
              style: this.opts.petalStyle,
            },
            () => this.handlePetalClick(color, layerIdx),
            () => {
              this.hoveredPetal = { layer: layerIdx, index };
              // Update all visual layers
              underlayPetal.update(this.isExpanded, true, this.mousePos);
              leftPetal.update(this.isExpanded, true, this.mousePos);
              rightPetal.update(this.isExpanded, true, this.mousePos);
            },
            () => {
              this.hoveredPetal = null;
              underlayPetal.update(this.isExpanded, false, this.mousePos);
              leftPetal.update(this.isExpanded, false, this.mousePos);
              rightPetal.update(this.isExpanded, false, this.mousePos);
            }
          );
          this.registerPetal(interactionPetal, layerIdx, index);
          this.petalRenderers.push(interactionPetal);
          this.containerEl.appendChild(interactionPetal.el);
        } else {
          // Normal petal
          const petal = new PetalRenderer(
            {
              hue: color.h,
              saturation: color.s,
              lightness: color.l,
              index,
              totalPetals,
              petalSize: this.opts.petalSize,
              radius,
              animationDuration: this.opts.animationDuration,
              staggerDelay,
              openEasing,
              zIndex: getPetalZIndex(
                index,
                bottomIndex,
                totalPetals,
                layerIdx,
                totalLayers
              ),
              rotationOffset: rotation,
              alpha: 1,
              pointerEvents: 'auto',
              hasShadow: false,
              shape: this.opts.petalShape,
              style: this.opts.petalStyle,
            },
            () => this.handlePetalClick(color, layerIdx),
            () => {
              this.hoveredPetal = { layer: layerIdx, index };
            },
            () => {
              this.hoveredPetal = null;
            }
          );
          this.registerPetal(petal, layerIdx, index);
          this.petalRenderers.push(petal);
          this.containerEl.appendChild(petal.el);
        }
      }
    }

    // Arc slider
    if (this.opts.showShadeSlider) {
      this.arcSliderRenderer = new ArcSliderRenderer(
        this.barRadius,
        this.opts.sliderWidth,
        this.opts.sliderOffset,
        this.opts.animationDuration,
        value => this.handleSliderChange(value),
        this.effectivePosition,
        () => this.completeSliderChange()
      );
      this.containerEl.appendChild(this.arcSliderRenderer.el);
    }

    // Core button
    this.coreButtonRenderer = new CoreButtonRenderer(
      this.opts.coreSize,
      this.opts.animationDuration,
      () => this.handleCoreClick()
    );
    this.containerEl.appendChild(this.coreButtonRenderer.el);
  }

  private update(): void {
    const val = this.currentValue;
    const t = (ms: number) => bloomTime(ms, this.opts.animationDuration);

    // Adaptive positioning — compute on the expand transition (or when the
    // placement options change), not during every update. An always-open
    // bloom never expands again, so it relies on the second case.
    // Using rootEl (stable, small) instead of containerEl (animating, shifting) prevents jitter.
    const placementChanged = this.placementChanged;
    this.placementChanged = false;
    if (
      this.isExpanded &&
      (!this.prevExpanded || placementChanged) &&
      this.rootEl
    ) {
      const rootRect = this.rootEl.getBoundingClientRect();
      const result = computeAdaptivePosition({
        elementRect: rootRect,
        containerSize: this.containerSize,
        currentShiftOffset: { x: 0, y: 0 },
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        sliderPosition: this.opts.sliderPosition,
        adaptivePositioning: this.opts.adaptivePositioning,
        circularBarWidth: this.opts.circularBarWidth,
        sliderOffset: this.opts.sliderOffset,
      });
      this.shiftOffset = result.shiftOffset;
      this.effectivePosition = result.effectivePosition;
    } else if (!this.isExpanded) {
      this.shiftOffset = { x: 0, y: 0 };
      this.effectivePosition = this.opts.sliderPosition || 'right';
    }

    // The floating layer stays mounted so each part can follow its own timing.
    // As a unit it only swells open / folds shut (individual `scale`, anchored
    // on the trigger) and slides to its adaptive position (`transform`).
    const showsBloom = this.isExpanded || !this.opts.collapsible;
    const transitionStr = this.isFirstRender
      ? 'none'
      : this.isExpanded
        ? `scale ${t(BLOOM_SCALE_DURATION)}ms ${BLOOM_OPEN_EASING} ${t(BLOOM_SCALE_DELAY)}ms, transform ${t(BLOOM_SCALE_DELAY + BLOOM_SCALE_DURATION)}ms ${BLOOM_OPEN_EASING}`
        : `scale ${t(COLLAPSE_DURATION)}ms ${BLOOM_CLOSE_EASING} ${t(COLLAPSE_DELAY)}ms, transform ${t(COLLAPSE_DURATION)}ms ${BLOOM_CLOSE_EASING} ${t(COLLAPSE_DELAY)}ms`;

    setStyles(this.containerEl, {
      width: `${this.containerSize}px`,
      height: `${this.containerSize}px`,
      transformOrigin: '0 0',
      transform: `translate(calc(-50% + ${this.shiftOffset.x}px), calc(-50% + ${this.shiftOffset.y}px))`,
      scale: showsBloom ? '1' : String(BLOOM_COLLAPSED_SCALE),
      opacity: '1',
      // The square layer is mostly empty; the disc, petals, core and slider
      // each take the pointer themselves.
      pointerEvents: 'none',
      transition: transitionStr,
      zIndex: '50',
    });

    // Keeps the stylesheet's hover / press transitions alive next to the inline ones.
    const triggerHover =
      'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease';

    if (this.opts.collapsible) {
      this.containerEl.inert = !this.isExpanded || this.opts.disabled;
      this.containerEl.setAttribute('aria-hidden', String(!this.isExpanded));

      if (this.triggerBtn) {
        this.triggerBtn.disabled = this.opts.disabled;
        this.triggerBtn.tabIndex = this.isExpanded ? -1 : 0;
        this.triggerBtn.setAttribute('aria-expanded', String(this.isExpanded));
        this.triggerBtn.setAttribute('aria-hidden', String(this.isExpanded));
        setStyles(this.triggerBtn, {
          backgroundColor: this.selectedColor,
          opacity: this.isExpanded ? '0' : '1',
          // Shrinks only once it is hidden, then pops back in on close.
          scale: this.isExpanded ? String(TRIGGER_COLLAPSED_SCALE) : '1',
          pointerEvents: this.isExpanded ? 'none' : 'auto',
          transition: `${triggerHover}, ${
            this.isFirstRender
              ? 'opacity 0ms, scale 0ms'
              : this.isExpanded
                ? `opacity ${t(TRIGGER_FADE_DURATION)}ms ease, scale 0ms linear ${t(TRIGGER_FADE_DURATION)}ms`
                : `opacity ${t(TRIGGER_FADE_DURATION)}ms ease ${t(TRIGGER_POP_DELAY)}ms, scale ${t(TRIGGER_POP_DURATION)}ms ${TRIGGER_POP_EASING} ${t(TRIGGER_POP_DELAY)}ms`
          }`,
        });
      }
    } else {
      this.containerEl.inert = this.opts.disabled;
      this.containerEl.removeAttribute('aria-hidden');
    }

    this.isFirstRender = false;

    this.updateColorDisplay();

    // Petals
    for (const petal of this.petalRenderers) {
      petal.update(this.isExpanded, undefined, this.mousePos);
    }

    const tabIndex =
      this.focusedColorIndex ??
      val.colorIndex ??
      this.normalizedColors.indexOf(this.allColors[0]);
    for (const buttons of this.petalButtons) {
      for (const button of buttons) {
        button.tabIndex =
          this.isExpanded &&
          !this.opts.disabled &&
          Number(button.dataset.colorIndex) === tabIndex
            ? 0
            : -1;
        button.disabled = this.opts.disabled;
        button.setAttribute(
          'aria-pressed',
          String(Number(button.dataset.colorIndex) === val.colorIndex)
        );
      }
    }

    // Arc slider
    if (this.arcSliderRenderer) {
      this.arcSliderRenderer.update(
        val.saturation,
        val.hue,
        this.baseSaturation,
        this.isExpanded,
        this.effectivePosition
      );
    }

    // Handle collapse callback
    if (this.prevExpanded && !this.isExpanded) {
      this.fireOnCollapse();
    }
    this.prevExpanded = this.isExpanded;
  }

  /** Repaints only the parts that show the selected (or previewed) color. */
  private updateColorDisplay(): void {
    const shown = this.displayValue;
    const lightness =
      shown.lightness ?? sliderValueToLightness(shown.saturation);

    this.backgroundRenderer.update(
      shown.hue,
      shown.saturation,
      lightness,
      this.isExpanded
    );
    this.colorBarRenderer.update(
      shown.hue,
      getVisualSaturation(shown.saturation, this.getBaseSaturation(shown)),
      lightness,
      shown.alpha,
      this.isExpanded
    );
    this.coreButtonRenderer.update(
      this.coreColor,
      this.isExpanded,
      this.isHovering,
      this.opts.disabled
    );
  }

  private setPreview(
    petal: { color: { h: number; s: number; l: number }; layer: number } | null
  ): void {
    const next = petal ? this.petalValue(petal.color, petal.layer) : null;
    if (next?.colorIndex === this.previewValue?.colorIndex) return;
    this.previewValue = next;
    this.opts.onHover(next ? this.colorOutput(next) : null);
    this.updateColorDisplay();
  }

  private registerPetal(
    petal: PetalRenderer,
    layer: number,
    index: number
  ): void {
    const button = petal.el;
    const color = this.layers[layer][index];
    button.dataset.colorIndex = String(this.normalizedColors.indexOf(color));
    button.setAttribute(
      'aria-label',
      `Select color ${hslaToString(color.h, color.s, color.l, 100)}`
    );
    this.petalButtons[layer][index] = button;
    button.addEventListener('mouseenter', () =>
      this.setPreview({ color, layer })
    );
    // A petal only ends its own preview. Clicking a hovered petal moves focus
    // off the previously focused one, and that blur must not wipe the preview
    // of the petal under the pointer.
    const endPreview = () => {
      if (this.previewValue?.colorIndex === Number(button.dataset.colorIndex))
        this.setPreview(null);
    };
    button.addEventListener('mouseleave', endPreview);
    button.addEventListener('blur', endPreview);
    button.addEventListener('focus', () => {
      // Only keyboard focus previews; a click already selects the petal.
      if (button.matches(':focus-visible')) this.setPreview({ color, layer });
      this.focusedColorIndex = Number(button.dataset.colorIndex);
      for (const buttons of this.petalButtons) {
        for (const petal of buttons) petal.tabIndex = petal === button ? 0 : -1;
      }
    });
    button.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return;
      e.preventDefault();
      if (this.opts.disabled) return;
      let targetLayer = layer;
      let targetIndex = index;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const count = this.layers[layer].length;
        targetIndex =
          (index + (e.key === 'ArrowRight' ? 1 : -1) + count) % count;
      } else {
        targetLayer = Math.max(
          0,
          Math.min(
            this.layers.length - 1,
            layer + (e.key === 'ArrowDown' ? 1 : -1)
          )
        );
        const angle =
          (index / this.layers[layer].length) * 360 +
          this.layerRotations[layer];
        const count = this.layers[targetLayer].length;
        targetIndex =
          ((Math.round(
            ((angle - this.layerRotations[targetLayer]) / 360) * count
          ) %
            count) +
            count) %
          count;
      }
      this.petalButtons[targetLayer][targetIndex].focus();
    });
  }

  private bindEvents(): void {
    this.rootEl.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isExpanded && this.opts.collapsible) {
        e.preventDefault();
        e.stopPropagation();
        this.setExpanded(false);
      }
    });
    this.rootEl.addEventListener('mouseenter', () => {
      this.handleMouseEnter();
    });
    this.rootEl.addEventListener('mouseleave', () => {
      this.handleMouseLeave();
    });
    this.containerEl.addEventListener('mousemove', this.boundMouseMove);
  }

  private unbindEvents(): void {
    document.removeEventListener('pointerdown', this.boundClickOutside);
    this.containerEl.removeEventListener('mousemove', this.boundMouseMove);
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.containerEl.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    };

    if (this.isExpanded && !this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.updateInteractive();
        this.rafId = null;
      });
    }
  }

  private updateInteractive(): void {
    const val = this.currentValue;
    // Only update things that respond to mouse position
    for (const petal of this.petalRenderers) {
      petal.update(this.isExpanded, undefined, this.mousePos);
    }

    // Sync other renderers just in case they were updated during the interactive frame
    this.updateColorDisplay();

    if (this.arcSliderRenderer) {
      this.arcSliderRenderer.update(
        val.saturation,
        val.hue,
        this.baseSaturation,
        this.isExpanded,
        this.effectivePosition
      );
    }

    if (this.triggerBtn) {
      this.triggerBtn.disabled = this.opts.disabled;
      this.triggerBtn.setAttribute('aria-expanded', String(this.isExpanded));
      setStyles(this.triggerBtn, {
        backgroundColor: this.selectedColor,
      });
    }
  }

  private destroyInner(): void {
    this.pendingSliderColor = null;
    this.previewValue = null;
    for (const petal of this.petalRenderers) {
      petal.destroy();
    }
    this.petalRenderers = [];

    this.colorBarRenderer?.destroy();
    this.arcSliderRenderer?.destroy();
    this.arcSliderRenderer = null;
    this.coreButtonRenderer?.destroy();
    this.backgroundRenderer?.destroy();

    if (this.triggerBtn) {
      this.triggerBtn.remove();
      this.triggerBtn = null;
    }
  }

  private setExpanded(expanded: boolean): void {
    if (expanded && this.opts.disabled) return;
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
    const focusWasOnTrigger = document.activeElement === this.triggerBtn;
    const focusWasInPicker = this.containerEl.contains(document.activeElement);

    if (!this.opts.collapsible) {
      this.isExpanded = true;
    } else {
      this.isExpanded = expanded;
    }

    if (this.isExpanded) {
      document.addEventListener('pointerdown', this.boundClickOutside);
    } else {
      document.removeEventListener('pointerdown', this.boundClickOutside);
      this.setPreview(null);
    }

    this.update();

    if (this.isExpanded && focusWasOnTrigger) {
      (
        this.containerEl.querySelector<HTMLButtonElement>(
          '.bcp-petal[tabindex="0"]'
        ) ?? this.coreButtonRenderer.el
      ).focus();
    } else if (!this.isExpanded && focusWasInPicker) {
      this.triggerBtn?.focus();
    }
  }

  private handleClickOutside(e: PointerEvent): void {
    if (!this.opts.collapsible) return;
    const target = e.target as Node;
    if (this.triggerBtn && this.triggerBtn.contains(target)) {
      return;
    }
    if (this.containerEl && !this.containerEl.contains(target)) {
      this.setExpanded(false);
    }
  }

  private handleMouseEnter(): void {
    if (this.opts.disabled || !this.opts.openOnHover || !this.opts.collapsible)
      return;

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    this.isHovering = true;
    this.hoverTimeout = setTimeout(() => {
      this.setExpanded(true);
    }, HOVER_DELAY);
  }

  private handleMouseLeave(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    this.isHovering = false;

    // Stay open for keyboard users working inside the picker. A mouse click
    // also leaves focus on a petal or the slider, so only keyboard focus counts.
    const focused = document.activeElement;
    const keyboardFocusInside =
      !!focused &&
      this.rootEl.contains(focused) &&
      focused.matches(':focus-visible');
    if (
      this.opts.openOnHover &&
      this.opts.collapsible &&
      !keyboardFocusInside
    ) {
      this.closeTimeout = setTimeout(() => {
        this.setExpanded(false);
      }, 200);
    }
  }

  private handleCoreClick(): void {
    if (this.opts.disabled || !this.opts.collapsible) return;
    this.setExpanded(!this.isExpanded);
  }

  private handlePetalClick(
    color: { h: number; s: number; l: number },
    layerIdx: number
  ): void {
    if (this.opts.disabled) return;
    const newValue = this.petalValue(color, layerIdx);
    if (this.controlledValue === undefined) this.internalValue = newValue;
    const output = this.colorOutput(newValue);
    this.opts.onChange(output);
    this.opts.onChangeComplete(output);
    this.update();
  }

  private petalValue(
    color: { h: number; s: number; l: number },
    layerIdx: number
  ): BlossomColorPickerValue {
    return {
      hue: color.h,
      saturation: lightnessToSliderValue(color.l),
      colorIndex: this.normalizedColors.indexOf(color),
      lightness: color.l,
      originalSaturation: color.s,
      layer: layerIdx === 0 ? 'inner' : 'outer',
      alpha: this.currentValue.alpha,
    };
  }

  private handleSliderChange(sliderValue: number): void {
    if (this.opts.disabled) return;
    const newValue: BlossomColorPickerValue = {
      ...this.currentValue,
      saturation: sliderValue,
      lightness: sliderValueToLightness(sliderValue),
      originalSaturation: this.baseSaturation,
    };
    if (this.controlledValue === undefined) this.internalValue = newValue;
    const output = this.colorOutput(newValue);
    this.pendingSliderColor = output;
    this.opts.onChange(output);
    this.update();
  }

  private completeSliderChange(): void {
    const color = this.pendingSliderColor;
    this.pendingSliderColor = null;
    if (color) this.opts.onChangeComplete(color);
  }

  private fireOnCollapse(): void {
    this.opts.onCollapse(this.getValue());
  }
}
