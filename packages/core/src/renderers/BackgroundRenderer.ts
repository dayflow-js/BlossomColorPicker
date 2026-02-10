import { BLOOM_EASING } from '../constants';
import { hslaToString } from '../utils';
import { createElement, setStyles } from '../dom-helpers';

export class BackgroundRenderer {
  public el: HTMLDivElement;
  private solidBg: HTMLDivElement;
  private tintEl: HTMLDivElement;

  constructor(
    private radius: number,
    private animationDuration: number
  ) {
    const size = radius * 2;
    this.el = createElement('div');
    this.el.className = 'bcp-bg-wrapper';
    setStyles(this.el, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      pointerEvents: 'none',
      zIndex: '0',
    });

    // Solid background (mask)
    this.solidBg = createElement('div');
    this.solidBg.className = 'bcp-bg-solid';
    setStyles(this.solidBg, {
      position: 'absolute',
      inset: '0',
      backgroundColor: '#FFFFFF',
      borderRadius: '50%',
      transform: 'scale(1)',
      transition: `transform ${animationDuration}ms ${BLOOM_EASING}, opacity ${animationDuration}ms ${BLOOM_EASING}`,
    });
    this.el.appendChild(this.solidBg);

    // Color tint layer
    this.tintEl = createElement('div');
    setStyles(this.tintEl, {
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      transition: `background-color ${animationDuration}ms ease`,
    });
    this.solidBg.appendChild(this.tintEl);
  }

  update(
    hue: number,
    saturation: number,
    lightness: number,
    isExpanded: boolean,
    isCoreHovered: boolean,
    mousePos?: { x: number; y: number } | null
  ): void {
    const duration = this.animationDuration;

    setStyles(this.solidBg, {
      transform: isExpanded ? 'scale(0.9)' : 'scale(0.98)',
      opacity: isExpanded ? '1' : '0',
    });

    setStyles(this.tintEl, {
      backgroundColor: hslaToString(hue, saturation, lightness, 15),
    });
  }

  destroy(): void {
    this.el.remove();
  }
}