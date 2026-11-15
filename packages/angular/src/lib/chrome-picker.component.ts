import '@dayflow/blossom-color-picker/styles.css';
import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  ChromePicker as CorePicker,
  type ChromePickerOptions,
  type BlossomColorPickerValue,
  type BlossomColorPickerColor,
  type ColorInput,
  type SliderPosition,
  type PetalShape,
  type PetalStyle,
  type ChromePickerThemeColors,
} from '@dayflow/blossom-color-picker';

@Component({
  selector: 'chrome-picker',
  standalone: true,
  template: '<div #container></div>',
})
export class ChromePickerComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  /**
   * Controlled value. When set, the picker always shows this value; update it
   * from the change event to reflect user picks.
   */
  @Input() value?: BlossomColorPickerValue;
  /**
   * Initial value when the picker is uncontrolled (no `value`).
   * @default { hue: 330, saturation: 70, alpha: 100, layer: 'outer' }
   */
  @Input() defaultValue?: BlossomColorPickerValue;
  /**
   * Petal colors as hex, `rgb()`/`rgba()`, `hsl()`/`hsla()` strings or
   * `{ h, s, l }` objects, sorted into inner and outer layers automatically.
   * @default DEFAULT_COLORS
   */
  @Input() colors?: ColorInput[];
  /**
   * Disable all user interaction.
   * @default false
   */
  @Input() disabled = false;
  /**
   * Expand the picker when the pointer hovers over it.
   * @default false
   */
  @Input() openOnHover = false;
  /**
   * Start with the picker expanded.
   * @default false
   */
  @Input() initialExpanded = false;
  /**
   * Base timing of the bloom animation in milliseconds. Every phase scales
   * with it, so the full open takes about twice this value.
   * @default 300
   */
  @Input() animationDuration = 300;
  /**
   * @deprecated Use `showShadeSlider`. This controls shade, not opacity.
   * `showShadeSlider` wins when both are set.
   * @default true
   */
  @Input() showAlphaSlider = true;
  /**
   * Show the shade (brightness) arc slider around the petals.
   * @default true
   */
  @Input() showShadeSlider?: boolean;
  /**
   * Petal outline. Every shape except `circle` points its tip away from the core.
   * @default 'circle'
   */
  @Input() petalShape?: PetalShape;
  /**
   * Surface detail on shaped petals. Ignored for `circle`.
   * @default 'flat'
   */
  @Input() petalStyle?: PetalStyle;
  /**
   * Show the hovered or focused petal's color on the ring, background and core
   * before it is picked.
   * @default false
   */
  @Input() hoverPreview?: boolean;
  /**
   * Diameter of the center core button in pixels.
   * @default 32
   */
  @Input() coreSize = 32;
  /**
   * Diameter of each petal in pixels.
   * @default 32
   */
  @Input() petalSize = 32;
  /**
   * Show the selected color in the expanded core. When `false`, the expanded
   * core is white.
   * @default true
   */
  @Input() showCoreColor = true;
  /**
   * Fixed side for the arc slider. When omitted, the slider starts on the
   * right and may move to stay inside the viewport.
   * @default undefined
   */
  @Input() sliderPosition?: SliderPosition;
  /**
   * Shift the expanded picker and arc slider so they stay inside the viewport.
   * @default true
   */
  @Input() adaptivePositioning = true;
  /**
   * Width of the circular hue bar in pixels.
   * @default 12
   */
  @Input() circularBarWidth?: number;
  /**
   * Width of the arc slider track and handle in pixels.
   * @default 12
   */
  @Input() sliderWidth?: number;
  /**
   * Gap between the petals and the arc slider in pixels.
   * @default 30
   */
  @Input() sliderOffset?: number;
  /**
   * Allow the picker to collapse back to the core button. When `false`, it
   * stays expanded.
   * @default false
   */
  @Input() collapsible = false;
  /**
   * Force dark (`true`) or light (`false`) theme. When omitted, the picker
   * follows a `.dark` class on an ancestor or `<html>`, then the system
   * `prefers-color-scheme`.
   * @default undefined
   */
  @Input() darkMode?: boolean;
  /** Theme color overrides applied only while the dark theme is active. */
  @Input() darkModeColors?: Partial<ChromePickerThemeColors>;

  /** Emitted whenever the selected color changes, including during a shade drag. */
  @Output() colorChange = new EventEmitter<BlossomColorPickerColor>();
  /**
   * Emitted once when a petal is picked or a shade drag or key press ends.
   * Use it for saving or undo history.
   */
  @Output() colorChangeComplete = new EventEmitter<BlossomColorPickerColor>();
  /**
   * Emitted with the color a hovered or keyboard-focused petal would select,
   * and with `null` when the preview ends.
   */
  @Output() colorHover = new EventEmitter<BlossomColorPickerColor | null>();
  /** Emitted with the current color when the picker collapses. */
  @Output() colorCollapse = new EventEmitter<BlossomColorPickerColor>();

  private picker: CorePicker | null = null;

  ngAfterViewInit(): void {
    this.picker = new CorePicker(
      this.containerRef.nativeElement,
      this.getOptions()
    );
  }

  ngOnDestroy(): void {
    this.picker?.destroy();
    this.picker = null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.picker) return;

    // Only send value + callbacks for value-only changes (cheap update)
    if (changes['value'] && Object.keys(changes).length === 1) {
      this.picker.setOptions({
        value: this.value,
        onChange: color => this.colorChange.emit(color),
        onChangeComplete: color => this.colorChangeComplete.emit(color),
        onHover: color => this.colorHover.emit(color),
        onCollapse: color => this.colorCollapse.emit(color),
      });
      return;
    }

    this.picker.setOptions(this.getOptions());
  }

  private getOptions(): ChromePickerOptions {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      colors: this.colors,
      disabled: this.disabled,
      openOnHover: this.openOnHover,
      initialExpanded: this.initialExpanded,
      animationDuration: this.animationDuration,
      showAlphaSlider: this.showAlphaSlider,
      showShadeSlider: this.showShadeSlider,
      petalShape: this.petalShape,
      petalStyle: this.petalStyle,
      hoverPreview: this.hoverPreview,
      coreSize: this.coreSize,
      petalSize: this.petalSize,
      showCoreColor: this.showCoreColor,
      sliderPosition: this.sliderPosition,
      adaptivePositioning: this.adaptivePositioning,
      circularBarWidth: this.circularBarWidth,
      sliderWidth: this.sliderWidth,
      sliderOffset: this.sliderOffset,
      collapsible: this.collapsible,
      darkMode: this.darkMode,
      darkModeColors: this.darkModeColors,
      onChange: color => this.colorChange.emit(color),
      onChangeComplete: color => this.colorChangeComplete.emit(color),
      onHover: color => this.colorHover.emit(color),
      onCollapse: color => this.colorCollapse.emit(color),
    };
  }
}
