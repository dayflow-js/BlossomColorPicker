import type {
  BlossomColorPickerValue,
  BlossomColorPickerColor,
  ColorInput,
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
import {
  DEFAULT_COLORS,
  BLOOM_EASING,
  HOVER_DELAY,
  PETAL_STAGGER,
  BAR_GAP,
  BAR_WIDTH,
  SLIDER_OFFSET,
} from './constants';
import {
  lightnessToSliderValue,
  sliderValueToLightness,
  hslToHex,
  hslaToString,
  createColorOutput,
  organizeColorsIntoLayers,
  getVisualSaturation,
  parseColor,
} from './utils';
import {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout';
import { computeAdaptivePosition } from './adaptive';
import { createElement, setStyles } from './dom-helpers';
import { PetalRenderer } from './renderers/PetalRenderer';
import { ColorBarRenderer } from './renderers/ColorBarRenderer';
import { ArcSliderRenderer } from './renderers/ArcSliderRenderer';
import { CoreButtonRenderer } from './renderers/CoreButtonRenderer';

export interface BlossomColorPickerOptions {
  value?: BlossomColorPickerValue;
  defaultValue?: BlossomColorPickerValue;
  colors?: ColorInput[];
  onChange?: (color: BlossomColorPickerColor) => void;
  onCollapse?: (color: BlossomColorPickerColor) => void;
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
}

const DEFAULT_VALUE: BlossomColorPickerValue = {
  hue: 330,
  saturation: 70,
  alpha: 50,
  layer: 'outer',
};

export class BlossomColorPicker {
  private container: HTMLElement;
  private rootEl!: HTMLDivElement;
  private containerEl!: HTMLDivElement;
  private bgEl!: HTMLDivElement;
  private bgTintEl!: HTMLDivElement;

  // Options
  private opts: Required<
    Omit<BlossomColorPickerOptions, 'value' | 'defaultValue' | 'sliderPosition'>
  > & {
    sliderPosition?: SliderPosition;
  };

  // State
  private internalValue: BlossomColorPickerValue;
  private controlledValue?: BlossomColorPickerValue;
  private isExpanded = false;
  private isHovering = false;
  private hoveredPetal: { layer: number; index: number } | null = null;
  private prevExpanded = false;
  private shiftOffset = { x: 0, y: 0 };
  private effectivePosition: SliderPosition = 'right';

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
  private petalRenderers: PetalRenderer[] = [];
  private colorBarRenderer!: ColorBarRenderer;
  private arcSliderRenderer: ArcSliderRenderer | null = null;
  private coreButtonRenderer!: CoreButtonRenderer;

  // Timeouts
  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Bound handlers
  private boundClickOutside: (e: MouseEvent) => void;

  constructor(container: HTMLElement, options?: Partial<BlossomColorPickerOptions>) {
    this.container = container;

    const defaultValue = options?.defaultValue ?? DEFAULT_VALUE;

    this.opts = {
      colors: options?.colors ?? [],
      onChange: options?.onChange ?? (() => {}),
      onCollapse: options?.onCollapse ?? (() => {}),
      disabled: options?.disabled ?? false,
      openOnHover: options?.openOnHover ?? false,
      initialExpanded: options?.initialExpanded ?? false,
      animationDuration: options?.animationDuration ?? 300,
      showAlphaSlider: options?.showAlphaSlider ?? true,
      coreSize: options?.coreSize ?? 32,
      petalSize: options?.petalSize ?? 32,
      showCoreColor: options?.showCoreColor ?? true,
      sliderPosition: options?.sliderPosition,
      adaptivePositioning: options?.adaptivePositioning ?? true,
    };

    this.controlledValue = options?.value;
    this.internalValue = options?.value ?? defaultValue;
    this.isExpanded = this.opts.initialExpanded;
    this.prevExpanded = this.isExpanded;
    this.effectivePosition = this.opts.sliderPosition || 'right';

    this.boundClickOutside = this.handleClickOutside.bind(this);

    this.computeLayout();
    this.render();
    this.update();
    this.bindEvents();
  }

  // --- Public API ---

  setValue(value: BlossomColorPickerValue): void {
    this.controlledValue = value;
    this.internalValue = value;
    this.update();
  }

  getValue(): BlossomColorPickerColor {
    const val = this.currentValue;
    const sliderValue = val.saturation;
    const lightness = sliderValueToLightness(sliderValue);
    const selectedPetal = this.allColors.find((c) => c.h === val.hue);
    const pBaseSaturation = selectedPetal?.s ?? 70;
    const visualSaturation = getVisualSaturation(sliderValue, pBaseSaturation);

    return createColorOutput(
      val.hue,
      sliderValue,
      visualSaturation,
      pBaseSaturation,
      lightness,
      val.alpha,
      val.layer
    );
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

    if (options.value !== undefined) {
      this.controlledValue = options.value;
      this.internalValue = options.value;
    }

    if (options.onChange !== undefined) this.opts.onChange = options.onChange;
    if (options.onCollapse !== undefined) this.opts.onCollapse = options.onCollapse;
    if (options.disabled !== undefined) this.opts.disabled = options.disabled;
    if (options.openOnHover !== undefined) this.opts.openOnHover = options.openOnHover;
    if (options.animationDuration !== undefined) this.opts.animationDuration = options.animationDuration;
    if (options.showCoreColor !== undefined) this.opts.showCoreColor = options.showCoreColor;
    if (options.sliderPosition !== undefined) this.opts.sliderPosition = options.sliderPosition;
    if (options.adaptivePositioning !== undefined) this.opts.adaptivePositioning = options.adaptivePositioning;

    if (options.initialExpanded !== undefined) {
      this.opts.initialExpanded = options.initialExpanded;
      // Note: initialExpanded is a construction-time option only.
      // We don't call setExpanded() here — the expanded state is
      // managed by user interaction after mount.
    }

    // These require re-render (DOM structure changes) — only if value actually changed
    if (options.colors !== undefined && !colorsEqual(options.colors, this.opts.colors)) {
      this.opts.colors = options.colors;
      needsRerender = true;
    }
    if (options.coreSize !== undefined && options.coreSize !== this.opts.coreSize) {
      this.opts.coreSize = options.coreSize;
      needsRerender = true;
    }
    if (options.petalSize !== undefined && options.petalSize !== this.opts.petalSize) {
      this.opts.petalSize = options.petalSize;
      needsRerender = true;
    }
    if (options.showAlphaSlider !== undefined && options.showAlphaSlider !== this.opts.showAlphaSlider) {
      this.opts.showAlphaSlider = options.showAlphaSlider;
      needsRerender = true;
    }

    if (needsRerender) {
      this.destroyInner();
      this.computeLayout();
      this.render();
    }

    this.update();
  }

  destroy(): void {
    this.unbindEvents();
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
    const val = this.currentValue;
    if (val.originalSaturation !== undefined) {
      return val.originalSaturation;
    }
    const selectedColor = this.allColors.find((c) => c.h === val.hue);
    return selectedColor?.s ?? 70;
  }

  private get coreColor(): string {
    const val = this.currentValue;
    if (this.isExpanded && !this.opts.showCoreColor) return '#FFFFFF';
    const lightness = val.lightness ?? sliderValueToLightness(val.saturation);
    const saturation = val.originalSaturation ?? this.baseSaturation;
    return hslToHex(val.hue, saturation, lightness);
  }

  private get currentLightness(): number {
    return (
      this.currentValue.lightness ??
      (this.currentValue.layer === 'inner' ? 85 : 65)
    );
  }

  private computeLayout(): void {
    const colors = this.opts.colors;
    this.normalizedColors =
      colors && colors.length > 0
        ? colors.map(parseColor)
        : DEFAULT_COLORS;

    this.layers = organizeColorsIntoLayers(this.normalizedColors);
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
    this.layerRotations = calculateLayerRotations(this.layers);
    this.barRadius = calculateBarRadius(
      this.layerRadii,
      this.opts.petalSize,
      this.opts.coreSize,
      BAR_GAP
    );
    this.containerSize = calculateContainerSize(
      this.barRadius,
      BAR_WIDTH,
      this.opts.showAlphaSlider,
      SLIDER_OFFSET
    );
  }

  private render(): void {
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
      });

      this.rootEl.appendChild(this.containerEl);
      this.container.appendChild(this.rootEl);
    }

    // Background
    this.bgEl = createElement('div');
    this.bgEl.className = 'bcp-bg';
    const bgSize = (this.barRadius + BAR_WIDTH / 2) * 2;
    setStyles(this.bgEl, {
      width: `${bgSize}px`,
      height: `${bgSize}px`,
      backgroundColor: '#FFFFFF',
    });

    this.bgTintEl = createElement('div');
    setStyles(this.bgTintEl, {
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
    });
    this.bgEl.appendChild(this.bgTintEl);
    this.containerEl.appendChild(this.bgEl);

    // Color bar
    this.colorBarRenderer = new ColorBarRenderer(
      this.barRadius,
      BAR_WIDTH,
      this.opts.animationDuration
    );
    this.containerEl.appendChild(this.colorBarRenderer.el);

    // Petals
    this.petalRenderers = [];
    for (let layerIdx = 0; layerIdx < this.layers.length; layerIdx++) {
      const layerColors = this.layers[layerIdx];
      const radius = this.layerRadii[layerIdx];
      const rotation = this.layerRotations[layerIdx];
      const previousItemsCount = this.layerPrefixCounts[layerIdx];
      const totalPetals = layerColors.length;
      const bottomIndex = Math.floor(totalPetals / 2);
      const totalLayers = this.layers.length;
      const baseZ = (totalLayers - layerIdx) * 100;

      for (let index = 0; index < layerColors.length; index++) {
        const color = layerColors[index];
        const staggerDelay =
          previousItemsCount * PETAL_STAGGER + index * PETAL_STAGGER;

        if (index === bottomIndex) {
          // Bottom petal split trick: left half, right half, invisible interaction
          const leftPetal = new PetalRenderer(
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
              zIndex: getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers, true, false),
              rotationOffset: rotation,
              alpha: 1,
              clip: 'left',
              pointerEvents: 'none',
              hasShadow: false,
            }
          );
          this.petalRenderers.push(leftPetal);
          this.containerEl.appendChild(leftPetal.el);

          const rightPetal = new PetalRenderer(
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
              zIndex: getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers, false, true),
              rotationOffset: rotation,
              alpha: 1,
              clip: 'right',
              pointerEvents: 'none',
              hasShadow: false,
            }
          );
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
              zIndex: baseZ + totalPetals + 20,
              rotationOffset: rotation,
              alpha: 0,
              pointerEvents: 'auto',
              hasShadow: false,
            },
            () => this.handlePetalClick(color, layerIdx),
            () => {
              this.hoveredPetal = { layer: layerIdx, index };
              // Update the visual halves
              leftPetal.update(this.isExpanded, true);
              rightPetal.update(this.isExpanded, true);
            },
            () => {
              this.hoveredPetal = null;
              leftPetal.update(this.isExpanded, false);
              rightPetal.update(this.isExpanded, false);
            }
          );
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
              zIndex: getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers),
              rotationOffset: rotation,
              alpha: 1,
              pointerEvents: 'auto',
              hasShadow: false,
            },
            () => this.handlePetalClick(color, layerIdx),
            () => {
              this.hoveredPetal = { layer: layerIdx, index };
            },
            () => {
              this.hoveredPetal = null;
            }
          );
          this.petalRenderers.push(petal);
          this.containerEl.appendChild(petal.el);
        }
      }
    }

    // Arc slider
    if (this.opts.showAlphaSlider) {
      this.arcSliderRenderer = new ArcSliderRenderer(
        this.barRadius,
        BAR_WIDTH,
        SLIDER_OFFSET,
        this.opts.animationDuration,
        (value) => this.handleSliderChange(value),
        this.effectivePosition
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
    const duration = this.opts.animationDuration;

    // Adaptive positioning
    if (this.isExpanded && this.containerEl) {
      const rect = this.containerEl.getBoundingClientRect();
      const result = computeAdaptivePosition({
        elementRect: rect,
        containerSize: this.containerSize,
        currentShiftOffset: this.shiftOffset,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        sliderPosition: this.opts.sliderPosition,
        adaptivePositioning: this.opts.adaptivePositioning,
      });
      this.shiftOffset = result.shiftOffset;
      this.effectivePosition = result.effectivePosition;
    } else if (!this.isExpanded) {
      this.shiftOffset = { x: 0, y: 0 };
    }

    // Container size + shift
    setStyles(this.containerEl, {
      width: `${this.isExpanded ? this.containerSize : this.opts.coreSize}px`,
      height: `${this.isExpanded ? this.containerSize : this.opts.coreSize}px`,
      transform: `translate(calc(-50% + ${this.shiftOffset.x}px), calc(-50% + ${this.shiftOffset.y}px))`,
      transition: `width ${duration}ms ${BLOOM_EASING}, height ${duration}ms ${BLOOM_EASING}, transform ${duration}ms ${BLOOM_EASING}`,
      zIndex: this.isExpanded ? '50' : '0',
    });

    // Background
    setStyles(this.bgEl, {
      opacity: this.isExpanded ? '1' : '0',
      transform: this.isExpanded ? 'scale(1)' : 'scale(0.8)',
      transition: `opacity ${duration}ms ${BLOOM_EASING}, transform ${duration}ms ${BLOOM_EASING}`,
      zIndex: '0',
    });

    setStyles(this.bgTintEl, {
      backgroundColor: hslaToString(
        val.hue,
        val.saturation,
        this.currentLightness,
        15
      ),
      transition: `background-color ${duration}ms ease`,
    });

    // Color bar
    this.colorBarRenderer.update(
      val.hue,
      getVisualSaturation(val.saturation, this.baseSaturation),
      this.currentLightness,
      val.alpha,
      this.isExpanded
    );

    // Petals
    for (const petal of this.petalRenderers) {
      petal.update(this.isExpanded);
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

    // Core button
    this.coreButtonRenderer.update(
      this.coreColor,
      this.isExpanded,
      this.isHovering,
      this.opts.disabled
    );

    // Handle collapse callback
    if (this.prevExpanded && !this.isExpanded) {
      this.fireOnCollapse();
    }
    this.prevExpanded = this.isExpanded;
  }

  private bindEvents(): void {
    this.containerEl.addEventListener('mouseenter', () => {
      this.handleMouseEnter();
    });
    this.containerEl.addEventListener('mouseleave', () => {
      this.handleMouseLeave();
    });
  }

  private unbindEvents(): void {
    document.removeEventListener('mousedown', this.boundClickOutside);
  }

  private destroyInner(): void {
    for (const petal of this.petalRenderers) {
      petal.destroy();
    }
    this.petalRenderers = [];

    this.colorBarRenderer?.destroy();
    this.arcSliderRenderer?.destroy();
    this.arcSliderRenderer = null;
    this.coreButtonRenderer?.destroy();

    if (this.bgEl && this.bgEl.parentNode) {
      this.bgEl.remove();
    }
  }

  private setExpanded(expanded: boolean): void {
    this.isExpanded = expanded;

    if (expanded) {
      document.addEventListener('mousedown', this.boundClickOutside);
    } else {
      document.removeEventListener('mousedown', this.boundClickOutside);
    }

    this.update();
  }

  private handleClickOutside(e: MouseEvent): void {
    if (
      this.containerEl &&
      !this.containerEl.contains(e.target as Node)
    ) {
      this.setExpanded(false);
    }
  }

  private handleMouseEnter(): void {
    if (this.opts.disabled || !this.opts.openOnHover) return;

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

    if (this.opts.openOnHover) {
      this.closeTimeout = setTimeout(() => {
        this.setExpanded(false);
      }, 200);
    }
  }

  private handleCoreClick(): void {
    if (this.opts.disabled) return;
    this.setExpanded(!this.isExpanded);
  }

  private handlePetalClick(
    color: { h: number; s: number; l: number },
    layerIdx: number
  ): void {
    const sliderValue = lightnessToSliderValue(color.l);
    const layerStr: 'inner' | 'outer' = layerIdx === 0 ? 'inner' : 'outer';
    const visualSaturation = color.s;

    const newValue: BlossomColorPickerValue = {
      ...this.currentValue,
      hue: color.h,
      saturation: sliderValue,
      lightness: color.l,
      originalSaturation: color.s,
      layer: layerStr,
    };
    this.internalValue = newValue;

    this.opts.onChange(
      createColorOutput(
        color.h,
        sliderValue,
        visualSaturation,
        color.s,
        color.l,
        this.currentValue.alpha,
        layerStr
      )
    );

    this.update();
  }

  private handleSliderChange(sliderValue: number): void {
    const lightness = sliderValueToLightness(sliderValue);
    const visualSaturation = getVisualSaturation(
      sliderValue,
      this.baseSaturation
    );

    const newValue: BlossomColorPickerValue = {
      ...this.currentValue,
      saturation: sliderValue,
      lightness,
      originalSaturation: this.baseSaturation,
    };
    this.internalValue = newValue;

    this.opts.onChange(
      createColorOutput(
        this.currentValue.hue,
        sliderValue,
        visualSaturation,
        this.baseSaturation,
        lightness,
        this.currentValue.alpha,
        this.currentValue.layer
      )
    );

    this.update();
  }

  private fireOnCollapse(): void {
    const val = this.currentValue;
    const sliderValue = val.saturation;
    const lightness = sliderValueToLightness(sliderValue);
    const selectedPetal = this.allColors.find((c) => c.h === val.hue);
    const pBaseSaturation = selectedPetal?.s ?? 70;
    const visualSaturation = getVisualSaturation(sliderValue, pBaseSaturation);

    this.opts.onCollapse(
      createColorOutput(
        val.hue,
        sliderValue,
        visualSaturation,
        pBaseSaturation,
        lightness,
        val.alpha,
        val.layer
      )
    );
  }
}
