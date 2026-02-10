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
  noRing?: boolean;
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

    // Use strict 50% split. The Underlay petal will handle the gap seam.
    if (c.clip === 'left') {
      this.el.style.clipPath = 'polygon(0% -50%, 50% -50%, 50% 150%, 0% 150%)';
    } else if (c.clip === 'right') {
      this.el.style.clipPath = 'polygon(50% -50%, 100% -50%, 100% 150%, 50% 150%)';
    }
  }

  update(isExpanded: boolean, externalHover?: boolean, mousePos?: { x: number; y: number } | null): void {
    if (externalHover !== undefined) {
      this.isHovered = externalHover;
    }
    this.updateStyles(isExpanded, mousePos);
  }

  private updateStyles(isExpanded: boolean, mousePos?: { x: number; y: number } | null): void {
    const isExpanding = isExpanded && !this.lastExpanded;
    const c = this.config;
    const isHovered = this.isHovered;
    const isInvisible = c.alpha === 0;

    const angle = (c.index / c.totalPetals) * 360 - 90 + c.rotationOffset;
    const radian = (angle * Math.PI) / 180;
    let x = Math.cos(radian) * c.radius;
    let y = Math.sin(radian) * c.radius;

    // Subtle push effect from demo.tsx
    // Only apply if mousePos is valid (user has moved mouse)
    if (isExpanded && mousePos && !isHovered && !isInvisible) {
      const dx = x - mousePos.x;
      const dy = y - mousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 60;
      
      if (dist < minDistance) {
        const pushStrength = (1 - dist / minDistance) * 6;
        const pushAngle = Math.atan2(dy, dx);
        x += Math.cos(pushAngle) * pushStrength;
        y += Math.sin(pushAngle) * pushStrength;
      }
    }

    const color =
      c.alpha < 1
        ? hslaToString(c.hue, c.saturation, c.lightness, c.alpha * 100)
        : hslToString(c.hue, c.saturation, c.lightness);

    const scale = isHovered ? 1.1 : 1;

    // Use fast transition only if:
    // 1. Picker already expanded (not currently expanding)
    // 2. Mouse is active (mousePos exists)
    // 3. Not hovering this specific petal
    const transformTransition = isExpanded && !isExpanding && mousePos && !isHovered 
      ? 'transform 150ms ease-out' 
      : `transform ${c.animationDuration}ms ${BLOOM_EASING} ${isExpanded && !isHovered ? c.staggerDelay : 0}ms`;

    setStyles(this.el, {
      backgroundColor: color,
      transform: isExpanded
        ? `translate(${x}px, ${y}px) scale(${scale})`
        : 'translate(0, 0) scale(0)',
      opacity: isExpanded ? '1' : '0',
      filter:
        isHovered && !isInvisible ? 'brightness(1.1)' : 'brightness(1)',
      transition: `${transformTransition},
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
    this.lastExpanded = isExpanded;
  }

  destroy(): void {
    this.el.remove();
  }
}