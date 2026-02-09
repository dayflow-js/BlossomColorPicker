import { BLOOM_EASING } from '../constants';
import { hslToString, hslaToString } from '../utils';
import { createElement, setStyles } from '../dom-helpers';

export interface PetalConfig {
  hue: number;
  saturation: number;
  lightness: number;
  index: number;
  totalPetals: number;
  petalSize: number;
  radius: number;
  animationDuration: number;
  staggerDelay: number;
  zIndex: number;
  rotationOffset: number;
  alpha: number;
  clip?: 'left' | 'right';
  pointerEvents: 'auto' | 'none';
  hasShadow: boolean;
}

export class PetalRenderer {
  public el: HTMLButtonElement;
  private config: PetalConfig;
  private isHovered = false;

  constructor(
    config: PetalConfig,
    private onClick?: () => void,
    private onMouseEnter?: () => void,
    private onMouseLeave?: () => void
  ) {
    this.config = config;
    this.el = createElement('button', undefined, {
      type: 'button',
      'aria-label': `Select color hue ${config.hue}`,
      tabIndex: '-1',
    });
    this.el.className = 'bcp-petal';

    if (config.alpha !== 0) {
      this.el.classList.add('bcp-petal-visible');
    }

    this.el.addEventListener('click', () => this.onClick?.());
    this.el.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.onMouseEnter?.();
      this.updateStyles(this.lastExpanded);
    });
    this.el.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.onMouseLeave?.();
      this.updateStyles(this.lastExpanded);
    });

    this.applyBaseStyles();
    this.updateStyles(false);
  }

  private lastExpanded = false;

  private applyBaseStyles(): void {
    const { petalSize, config: c } = { petalSize: this.config.petalSize, config: this.config };
    setStyles(this.el, {
      position: 'absolute',
      width: `${petalSize}px`,
      height: `${petalSize}px`,
      borderRadius: '50%',
      border: 'none',
      padding: '0',
      background: 'none',
      left: '50%',
      top: '50%',
      marginLeft: `${-petalSize / 2}px`,
      marginTop: `${-petalSize / 2}px`,
    });

    if (c.clip === 'left') {
      this.el.style.clipPath = 'polygon(0% -10%, 60% -10%, 60% 110%, 0% 110%)';
    } else if (c.clip === 'right') {
      this.el.style.clipPath = 'polygon(40% -10%, 100% -10%, 100% 110%, 40% 110%)';
    }
  }

  update(isExpanded: boolean, externalHover?: boolean): void {
    if (externalHover !== undefined) {
      this.isHovered = externalHover;
    }
    this.updateStyles(isExpanded);
  }

  private updateStyles(isExpanded: boolean): void {
    this.lastExpanded = isExpanded;
    const c = this.config;
    const isHovered = this.isHovered;
    const isInvisible = c.alpha === 0;

    const angle = (c.index / c.totalPetals) * 360 - 90 + c.rotationOffset;
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * c.radius;
    const y = Math.sin(radian) * c.radius;

    const color =
      c.alpha < 1
        ? hslaToString(c.hue, c.saturation, c.lightness, c.alpha * 100)
        : hslToString(c.hue, c.saturation, c.lightness);

    const scale = isHovered ? 1.1 : 1;

    setStyles(this.el, {
      backgroundColor: color,
      transform: isExpanded
        ? `translate(${x}px, ${y}px) scale(${scale})`
        : 'translate(0, 0) scale(0)',
      opacity: isExpanded ? '1' : '0',
      filter:
        isHovered && !isInvisible ? 'brightness(1.1)' : 'brightness(1)',
      transition: `transform ${c.animationDuration}ms ${BLOOM_EASING} ${isExpanded && !isHovered ? c.staggerDelay : 0}ms,
                   opacity ${c.animationDuration}ms ${BLOOM_EASING} ${isExpanded && !isHovered ? c.staggerDelay : 0}ms,
                   background-color 200ms ease,
                   box-shadow 200ms ease,
                   filter 200ms ease`,
      boxShadow:
        c.hasShadow && !isInvisible
          ? isHovered
            ? '0 4px 12px rgba(0,0,0,0.25)'
            : '0 2px 6px rgba(0,0,0,0.15)'
          : 'none',
      zIndex: String(c.zIndex),
      pointerEvents: c.pointerEvents,
    });

    this.el.tabIndex = isExpanded ? 0 : -1;
  }

  destroy(): void {
    this.el.remove();
  }
}
