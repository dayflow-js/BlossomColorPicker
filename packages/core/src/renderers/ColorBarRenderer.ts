import {
  RING_CLOSE_DELAY,
  RING_CLOSE_DURATION,
  RING_FADE_DELAY,
  RING_FADE_DURATION,
  RING_CLOSE_SPRING_DURATION,
  RING_CLOSE_SPRING_EASING,
  RING_COLLAPSED_SCALE,
  RING_SPRING_DURATION,
  RING_SPRING_EASING,
  bloomTime,
} from '../constants';
import { createSVGElement, setStyles } from '../dom-helpers';
import { hslaToString } from '../utils';

export class ColorBarRenderer {
  public el: SVGSVGElement;
  private bgCircle: SVGCircleElement;
  private colorCircle: SVGCircleElement;

  constructor(
    private radius: number,
    private barWidth: number,
    private animationDuration: number
  ) {
    const size = (radius + barWidth / 2) * 2 + 4;
    this.el = createSVGElement('svg', {
      width: String(size),
      height: String(size),
    });
    this.el.classList.add('bcp-svg');
    setStyles(this.el, {
      left: '50%',
      top: '50%',
      marginLeft: `${-size / 2}px`,
      marginTop: `${-size / 2}px`,
      zIndex: '5',
      willChange: 'transform, opacity',
    });

    const cx = String(size / 2);
    const cy = String(size / 2);
    const r = String(radius);
    const sw = String(barWidth);

    this.bgCircle = createSVGElement('circle', {
      cx,
      cy,
      r,
      fill: 'none',
      stroke: 'rgba(0,0,0,0.06)',
      'stroke-width': sw,
    });
    // The style wins over the attribute, so themes can restyle the track.
    this.bgCircle.style.stroke = 'var(--bcp-track, rgba(0, 0, 0, 0.06))';

    this.colorCircle = createSVGElement('circle', {
      cx,
      cy,
      r,
      fill: 'none',
      'stroke-width': sw,
    });

    // Hover previews can change the color many times a second; easing it keeps
    // quick sweeps across the petals from flickering.
    this.colorCircle.style.transition = 'stroke 180ms ease';

    this.el.appendChild(this.bgCircle);
    this.el.appendChild(this.colorCircle);
  }

  update(
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number,
    isExpanded: boolean
  ): void {
    const color = hslaToString(hue, saturation, lightness, alpha);
    this.colorCircle.setAttribute('stroke', color);
    this.colorCircle.style.stroke = color;

    // The ring rides the container scale with its own jelly wobble and lets
    // its color settle in after the first petals; on close it fades out in
    // place before they fold.
    const t = (ms: number) => bloomTime(ms, this.animationDuration);
    setStyles(this.el, {
      opacity: isExpanded ? '1' : '0',
      transform: isExpanded ? 'scale(1)' : `scale(${RING_COLLAPSED_SCALE})`,
      transition: isExpanded
        ? `opacity ${t(RING_FADE_DURATION)}ms linear ${t(RING_FADE_DELAY)}ms, transform ${t(RING_SPRING_DURATION)}ms ${RING_SPRING_EASING}`
        : `opacity ${t(RING_CLOSE_DURATION)}ms linear ${t(RING_CLOSE_DELAY)}ms, transform ${t(RING_CLOSE_SPRING_DURATION)}ms ${RING_CLOSE_SPRING_EASING}`,
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
