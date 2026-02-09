import { BLOOM_EASING } from '../constants';
import { hslaToString } from '../utils';
import { createSVGElement, setStyles } from '../dom-helpers';

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

    this.colorCircle = createSVGElement('circle', {
      cx,
      cy,
      r,
      fill: 'none',
      'stroke-width': sw,
    });

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

    setStyles(this.el, {
      opacity: isExpanded ? '1' : '0',
      transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
      transition: `opacity ${this.animationDuration}ms ${BLOOM_EASING}, transform ${this.animationDuration}ms ${BLOOM_EASING}`,
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
