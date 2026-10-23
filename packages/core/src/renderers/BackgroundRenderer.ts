import {
  COLLAPSE_DELAY,
  COLLAPSE_DURATION,
  DISC_FADE_DURATION,
  RING_CLOSE_SPRING_DURATION,
  RING_CLOSE_SPRING_EASING,
  RING_COLLAPSED_SCALE,
  RING_SPRING_DURATION,
  RING_SPRING_EASING,
  bloomTime,
} from '../constants';
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
      left: '50%',
      top: '50%',
      marginLeft: `${-radius}px`,
      marginTop: `${-radius}px`,
      pointerEvents: 'none',
      zIndex: '0',
    });

    // Solid background (mask + shadow)
    this.solidBg = createElement('div');
    this.solidBg.className = 'bcp-bg-solid';
    setStyles(this.solidBg, {
      position: 'absolute',
      inset: '0',
      backgroundColor: 'var(--bcp-surface, #FFFFFF)',
      borderRadius: '50%',
      boxShadow:
        'var(--bcp-surface-shadow, 0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06))',
      opacity: '0',
      willChange: 'transform, opacity',
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
    isExpanded: boolean
  ): void {
    // The disc scales with the container and shares the ring's wobble so its
    // edge never peeks out from under it.
    const t = (ms: number) => bloomTime(ms, this.animationDuration);
    setStyles(this.solidBg, {
      // Clicks between petals land on the disc, so they stay inside the picker.
      pointerEvents: isExpanded ? 'auto' : 'none',
      opacity: isExpanded ? '1' : '0',
      transform: isExpanded ? 'scale(1)' : `scale(${RING_COLLAPSED_SCALE})`,
      transition: isExpanded
        ? `opacity ${t(DISC_FADE_DURATION)}ms ease-in, transform ${t(RING_SPRING_DURATION)}ms ${RING_SPRING_EASING}`
        : `opacity ${t(COLLAPSE_DURATION)}ms linear ${t(COLLAPSE_DELAY)}ms, transform ${t(RING_CLOSE_SPRING_DURATION)}ms ${RING_CLOSE_SPRING_EASING}`,
    });

    setStyles(this.tintEl, {
      backgroundColor: `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}% / var(--bcp-tint-opacity, 0.15))`,
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
