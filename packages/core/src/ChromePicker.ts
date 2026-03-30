import { BlossomColorPicker, type BlossomColorPickerOptions } from './BlossomColorPicker';
import {
  type BlossomColorPickerColor,
  type BlossomColorPickerValue,
} from './types';
import {
  hexToHsl,
  rgbToHsl,
  createColorOutput,
  getVisualSaturation,
  sliderValueToLightness,
  lightnessToSliderValue,
} from './utils';
import { createElement, setStyles } from './dom-helpers';

export interface ChromePickerOptions extends BlossomColorPickerOptions {
  // Extra options if needed
}

type ColorMode = 'HEX' | 'RGBA' | 'HSLA';

export class ChromePicker {
  private container: HTMLElement;
  private rootEl!: HTMLDivElement;
  private topEl!: HTMLDivElement;
  private bottomEl!: HTMLDivElement;
  private alphaSliderTrack!: HTMLDivElement;
  private alphaSliderHandle!: HTMLDivElement;
  private alphaSliderInput!: HTMLInputElement;
  private inputsEl!: HTMLDivElement;
  private toggleBtn!: HTMLButtonElement;

  private picker: BlossomColorPicker;
  private mode: ColorMode = 'HSLA';
  private opts: ChromePickerOptions;

  // Track if we are currently updating from inputs to avoid feedback loops
  private isInternalUpdate = false;

  constructor(container: HTMLElement, options?: Partial<ChromePickerOptions>) {
    this.container = container;
    this.opts = {
      ...options,
      collapsible: options?.collapsible ?? false, // Default to expanded for ChromePicker
    };

    this.render();
    
    // Initialize picker in the top element
    this.picker = new BlossomColorPicker(this.topEl, {
      ...this.opts,
      onChange: (color) => this.handlePickerChange(color),
    });

    this.updateInputs();
  }

  private render(): void {
    this.rootEl = createElement('div', {}, { class: 'bcp-chrome-container' });
    this.topEl = createElement('div', {}, { class: 'bcp-chrome-top' });
    this.bottomEl = createElement('div', {}, { class: 'bcp-chrome-bottom' });
    
    // Alpha Slider Row (Full Width)
    const slidersContainer = createElement('div', {}, { 
      class: 'bcp-chrome-sliders',
      style: 'margin-bottom: 16px;' 
    });
    
    const alphaContainer = createElement('div', {}, { class: 'bcp-chrome-slider-container' });
    this.alphaSliderTrack = createElement('div', {}, { class: 'bcp-chrome-alpha-gradient' });
    this.alphaSliderHandle = createElement('div', {}, { class: 'bcp-chrome-slider-handle' });
    this.alphaSliderInput = createElement('input', {}, {
      type: 'range',
      min: '0',
      max: '100',
      step: '1',
      class: 'bcp-chrome-native-slider'
    }) as HTMLInputElement;
    
    this.alphaSliderInput.addEventListener('input', () => {
      const alpha = parseInt(this.alphaSliderInput.value);
      this.syncAlpha(alpha);
    });

    alphaContainer.appendChild(this.alphaSliderTrack);
    alphaContainer.appendChild(this.alphaSliderHandle);
    alphaContainer.appendChild(this.alphaSliderInput);
    slidersContainer.appendChild(alphaContainer);
    
    this.bottomEl.appendChild(slidersContainer);

    const rowEl = createElement('div', {}, { class: 'bcp-chrome-inputs-row' });
    this.inputsEl = createElement('div', {}, { class: 'bcp-chrome-inputs-container' });
    this.toggleBtn = createElement('button', {}, { 
      class: 'bcp-chrome-toggle',
      type: 'button'
    }) as HTMLButtonElement;
    
    this.toggleBtn.innerHTML = `
      <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
        <path d="M6 0L10.3301 4.5H1.66987L6 0Z" fill="#333" />
        <path d="M6 15L1.66987 10.5L10.3301 10.5L6 15Z" fill="#333" />
      </svg>
    `;

    this.toggleBtn.addEventListener('click', () => this.toggleMode());

    rowEl.appendChild(this.inputsEl);
    rowEl.appendChild(this.toggleBtn);
    this.bottomEl.appendChild(rowEl);
    
    this.rootEl.appendChild(this.topEl);
    this.rootEl.appendChild(this.bottomEl);
    this.container.appendChild(this.rootEl);
  }

  private toggleMode(): void {
    if (this.mode === 'HEX') this.mode = 'RGBA';
    else if (this.mode === 'RGBA') this.mode = 'HSLA';
    else this.mode = 'HEX';
    this.updateInputs();
  }

  private handlePickerChange(color: BlossomColorPickerColor): void {
    if (this.isInternalUpdate) return;
    this.updateInputs();
    if (this.opts.onChange) {
      this.opts.onChange(color);
    }
  }

  private updateInputs(): void {
    const color = this.picker.getValue();
    
    // Update Alpha Slider
    this.alphaSliderInput.value = String(color.alpha);
    this.alphaSliderHandle.style.left = `${color.alpha}%`;
    const opaqueColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this.alphaSliderTrack.style.background = `linear-gradient(to right, rgba(${color.r}, ${color.g}, ${color.b}, 0), ${opaqueColor})`;

    this.inputsEl.innerHTML = '';
    
    if (this.mode === 'HEX') {
      this.inputsEl.className = 'bcp-chrome-inputs-hex';
      this.renderHexInputs(color);
    } else if (this.mode === 'RGBA') {
      this.inputsEl.className = 'bcp-chrome-inputs-rgba';
      this.renderRgbaInputs(color);
    } else {
      this.inputsEl.className = 'bcp-chrome-inputs-hsla';
      this.renderHslaInputs(color);
    }
  }

  private renderHexInputs(color: BlossomColorPickerColor): void {
    const group = this.createInputGroup('HEX', color.hex.toUpperCase(), (val) => {
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        const hsl = hexToHsl(val);
        this.syncPicker({
          hue: hsl.h,
          saturation: lightnessToSliderValue(hsl.l),
          lightness: hsl.l,
          originalSaturation: hsl.s,
          alpha: color.alpha,
          layer: color.layer,
        });
      }
    });
    this.inputsEl.appendChild(group);
  }

  private renderRgbaInputs(color: BlossomColorPickerColor): void {
    const r = this.createInputGroup('R', String(color.r), () => this.syncRgba(color));
    const g = this.createInputGroup('G', String(color.g), () => this.syncRgba(color));
    const b = this.createInputGroup('B', String(color.b), () => this.syncRgba(color));
    const a = this.createInputGroup('A', (color.alpha === 100 ? '1' : (color.alpha / 100).toFixed(2)), () => this.syncRgba(color));
    
    this.inputsEl.appendChild(r);
    this.inputsEl.appendChild(g);
    this.inputsEl.appendChild(b);
    this.inputsEl.appendChild(a);
  }

  private syncRgba(prevColor: BlossomColorPickerColor): void {
    const inputs = this.inputsEl.querySelectorAll('input');
    const r = parseInt(inputs[0].value);
    const g = parseInt(inputs[1].value);
    const b = parseInt(inputs[2].value);
    const a = parseFloat(inputs[3].value);

    if (inputs[3].value.endsWith('.')) return;

    if (!isNaN(r) && !isNaN(g) && !isNaN(b) && !isNaN(a)) {
      const hsl = rgbToHsl(r, g, b);
      this.syncPicker({
        hue: hsl.h,
        saturation: lightnessToSliderValue(hsl.l),
        lightness: hsl.l,
        originalSaturation: hsl.s,
        alpha: Math.max(0, Math.min(100, a * 100)),
        layer: prevColor.layer,
      });
    }
  }

  private renderHslaInputs(color: BlossomColorPickerColor): void {
    const h = this.createInputGroup('H', String(Math.round(color.hue)), () => this.syncHsla(color));
    const s = this.createInputGroup('S', String(Math.round(color.saturation)), () => this.syncHsla(color));
    const l = this.createInputGroup('L', String(Math.round(color.lightness ?? 50)), () => this.syncHsla(color));
    const a = this.createInputGroup('A', (color.alpha === 100 ? '1' : (color.alpha / 100).toFixed(2)), () => this.syncHsla(color));

    this.inputsEl.appendChild(h);
    this.inputsEl.appendChild(s);
    this.inputsEl.appendChild(l);
    this.inputsEl.appendChild(a);
  }

  private syncHsla(prevColor: BlossomColorPickerColor): void {
    const inputs = this.inputsEl.querySelectorAll('input');
    const h = parseInt(inputs[0].value);
    const s = parseInt(inputs[1].value);
    const l = parseInt(inputs[2].value);
    const a = parseFloat(inputs[3].value);

    if (inputs[3].value.endsWith('.')) return;

    if (!isNaN(h) && !isNaN(s) && !isNaN(l) && !isNaN(a)) {
      this.syncPicker({
        hue: Math.max(0, Math.min(360, h)),
        saturation: Math.max(0, Math.min(100, s)),
        lightness: Math.max(0, Math.min(100, l)),
        originalSaturation: prevColor.originalSaturation ?? 70,
        alpha: Math.max(0, Math.min(100, a * 100)),
        layer: prevColor.layer,
      });
    }
  }

  private syncAlpha(alpha: number): void {
    const color = this.picker.getValue();
    this.syncPicker({
      hue: color.hue,
      saturation: color.saturation,
      lightness: color.lightness,
      originalSaturation: color.originalSaturation,
      alpha: alpha,
      layer: color.layer,
    });
    this.updateInputs();
  }

  private createInputGroup(label: string, value: string, onChange: (val: string) => void): HTMLDivElement {
    const group = createElement('div', {}, { class: 'bcp-chrome-input-group' });
    const input = createElement('input', {}, { class: 'bcp-chrome-input' }) as HTMLInputElement;
    input.value = value;
    input.addEventListener('input', () => onChange(input.value));
    
    const labelEl = createElement('span', {}, { class: 'bcp-chrome-label' });
    labelEl.textContent = label;
    
    group.appendChild(input);
    group.appendChild(labelEl);
    return group;
  }

  private syncPicker(value: BlossomColorPickerValue): void {
    this.isInternalUpdate = true;
    this.picker.setValue(value);
    this.isInternalUpdate = false;
  }

  public setValue(value: BlossomColorPickerValue): void {
    this.picker.setValue(value);
    this.updateInputs();
  }

  public getValue(): BlossomColorPickerColor {
    return this.picker.getValue();
  }

  public setOptions(options: Partial<ChromePickerOptions>): void {
    this.opts = { ...this.opts, ...options };
    this.picker.setOptions(options);
    this.updateInputs();
  }

  public destroy(): void {
    this.picker.destroy();
    this.rootEl.remove();
  }
}
