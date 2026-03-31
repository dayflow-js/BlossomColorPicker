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
  type ChromePickerThemeColors,
} from '@dayflow/blossom-color-picker';


@Component({
  selector: 'chrome-picker',
  standalone: true,
  template: '<div #container></div>',
})
export class ChromePickerComponent
  implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  @Input() value?: BlossomColorPickerValue;
  @Input() defaultValue?: BlossomColorPickerValue;
  @Input() colors?: ColorInput[];
  @Input() disabled = false;
  @Input() openOnHover = false;
  @Input() initialExpanded = false;
  @Input() animationDuration = 300;
  @Input() showAlphaSlider = true;
  @Input() coreSize = 32;
  @Input() petalSize = 32;
  @Input() showCoreColor = true;
  @Input() sliderPosition?: SliderPosition;
  @Input() adaptivePositioning = true;
  @Input() circularBarWidth?: number;
  @Input() sliderWidth?: number;
  @Input() sliderOffset?: number;
  @Input() collapsible = false;
  @Input() darkMode?: boolean;
  @Input() darkModeColors?: Partial<ChromePickerThemeColors>;

  @Output() colorChange = new EventEmitter<BlossomColorPickerColor>();
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
    if (
      changes['value'] &&
      Object.keys(changes).length === 1
    ) {
      this.picker.setOptions({
        value: this.value,
        onChange: (color) => this.colorChange.emit(color),
        onCollapse: (color) => this.colorCollapse.emit(color),
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
      onChange: (color) => this.colorChange.emit(color),
      onCollapse: (color) => this.colorCollapse.emit(color),
    };
  }
}
