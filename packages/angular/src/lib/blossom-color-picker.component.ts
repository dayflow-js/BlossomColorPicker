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
  BlossomColorPicker as CorePicker,
  type BlossomColorPickerOptions,
  type BlossomColorPickerValue,
  type BlossomColorPickerColor,
  type ColorInput,
  type SliderPosition,
} from '@dayflow/blossom-color-picker';


@Component({
  selector: 'blossom-color-picker',
  standalone: true,
  template: '<div #container></div>',
})
export class BlossomColorPickerComponent
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

  private getOptions(): BlossomColorPickerOptions {
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
      onChange: (color) => this.colorChange.emit(color),
      onCollapse: (color) => this.colorCollapse.emit(color),
    };
  }
}
