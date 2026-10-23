import {
  BLOOM_CLOSE_EASING,
  COLLAPSE_DELAY,
  COLLAPSE_DURATION,
  PETAL_CLOSE_DELAY,
  PETAL_CLOSE_DURATION,
  PETAL_CLOSE_EASING,
  PETAL_COLLAPSED_SCALE,
  PETAL_FADE_DURATION,
  PETAL_START_RADIUS,
  PETAL_TRAVEL_DURATION,
  bloomTime,
} from '../constants';
import { createElement, createSVGElement, setStyles } from '../dom-helpers';
import type { PetalShape, PetalStyle } from '../types';
import { hslToString, hslaToString } from '../utils';

// Petal outlines in a 100x100 box, tip at the top (pointing away from the
// core) and base at the bottom. `circle` keeps the original round petals.
const PETAL_PATHS: Record<Exclude<PetalShape, 'circle'>, string> = {
  // Broad petals with a small notch at the tip.
  sakura:
    'M50 100C30 100 6 80 4 52C2 26 16 4 34 2C42 1 46 8 50 14C54 8 58 1 66 2C84 4 98 26 96 52C94 80 70 100 50 100Z',
  // Round base drawn up into a pointed tip.
  lotus:
    'M50 0C58 14 96 34 96 62C96 86 76 100 50 100C24 100 4 86 4 62C4 34 42 14 50 0Z',
  // Tip swept to one side, so the bloom reads as turning.
  pinwheel:
    'M50 100C26 100 6 82 6 56C6 30 22 8 46 4C62 2 80 4 94 0C88 14 96 30 94 52C92 80 74 100 50 100Z',
};

// Vein lines for the `veined` style, in the same box as PETAL_PATHS: a midrib
// from the base out to the tip, and two pairs of side veins.
const PETAL_VEINS: Record<Exclude<PetalShape, 'circle'>, string> = {
  sakura:
    'M50 96Q51 55 50 16M50 66Q38 50 27 36M50 66Q62 50 73 36M50 82Q40 72 30 64M50 82Q60 72 70 64',
  lotus:
    'M50 96Q50 50 50 8M50 66Q38 50 27 36M50 66Q62 50 73 36M50 82Q40 72 30 64M50 82Q60 72 70 64',
  pinwheel:
    'M50 96Q58 50 88 6M53 68Q44 50 34 36M54 64Q68 50 80 38M51 82Q40 72 30 64M52 82Q62 72 72 66',
};

let shadeIdCounter = 0;

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
  openEasing: string;
  zIndex: number;
  rotationOffset: number;
  alpha: number;
  clip?: 'left' | 'right';
  pointerEvents: 'auto' | 'none';
  hasShadow: boolean;
  noRing?: boolean;
  shape?: PetalShape;
  style?: PetalStyle;
}

export class PetalRenderer {
  public el: HTMLButtonElement;
  private config: PetalConfig;
  private isHovered = false;
  private bloomEndTime = 0;
  /** Filled outline for shaped petals; circles paint the button itself. */
  private shapePath: SVGPathElement | null = null;

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
    if (config.shape && config.shape !== 'circle') {
      this.renderShape(config.shape);
    }

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
    const { petalSize, config: c } = {
      petalSize: this.config.petalSize,
      config: this.config,
    };
    setStyles(this.el, {
      position: 'absolute',
      width: `${petalSize}px`,
      height: `${petalSize}px`,
      border: 'none',
      padding: '0',
      background: 'none',
      borderRadius: this.shapePath ? '0' : '50%',
      left: '50%',
      top: '50%',
      marginLeft: `${-petalSize / 2}px`,
      marginTop: `${-petalSize / 2}px`,
      transformOrigin: 'center center',
      willChange: 'transform, scale, opacity',
    });

    // Use strict 50% split. The Underlay petal will handle the gap seam.
    const rotation = this.rotation;
    if (c.clip && rotation) {
      this.el.style.clipPath = rotatedHalfClip(c.clip, rotation, petalSize);
    } else if (c.clip === 'left') {
      this.el.style.clipPath = 'polygon(0% -50%, 50% -50%, 50% 150%, 0% 150%)';
    } else if (c.clip === 'right') {
      this.el.style.clipPath =
        'polygon(50% -50%, 100% -50%, 100% 150%, 50% 150%)';
    }
  }

  /**
   * Draws the petal as an SVG outline with a soft base-to-tip shade. The path
   * also takes the pointer, so clicks follow the outline rather than its box,
   * and carries the keyboard focus ring (see `.bcp-petal-shaped` in styles.css).
   */
  private renderShape(shape: Exclude<PetalShape, 'circle'>): void {
    this.el.classList.add('bcp-petal-shaped');
    const svg = createSVGElement('svg', {
      viewBox: '0 0 100 100',
      width: '100%',
      height: '100%',
      'aria-hidden': 'true',
    });
    svg.classList.add('bcp-petal-shape');
    this.shapePath = createSVGElement('path', { d: PETAL_PATHS[shape] });
    svg.appendChild(this.shapePath);

    if (this.config.alpha !== 0) {
      const shadeId = `bcp-petal-shade-${++shadeIdCounter}`;
      const gradient = createSVGElement('linearGradient', {
        id: shadeId,
        x1: '0',
        y1: '1',
        x2: '0',
        y2: '0',
      });
      for (const [offset, color, opacity] of [
        ['0', '#000', '0.1'],
        ['0.45', '#000', '0'],
        ['1', '#fff', '0.18'],
      ]) {
        gradient.appendChild(
          createSVGElement('stop', {
            offset,
            'stop-color': color,
            'stop-opacity': opacity,
          })
        );
      }
      const defs = createSVGElement('defs');
      defs.appendChild(gradient);
      const shade = createSVGElement('path', {
        d: PETAL_PATHS[shape],
        fill: `url(#${shadeId})`,
        'pointer-events': 'none',
      });
      svg.prepend(defs);
      svg.appendChild(shade);
      if (this.config.style === 'veined') {
        const veins = createSVGElement('path', {
          d: PETAL_VEINS[shape],
          fill: 'none',
          'stroke-width': '1',
          'stroke-linecap': 'round',
          'vector-effect': 'non-scaling-stroke',
          'pointer-events': 'none',
        });
        veins.classList.add('bcp-petal-veins');
        svg.appendChild(veins);
      }
    }
    this.el.appendChild(svg);
  }

  /** Turn in degrees that points a shaped petal's tip along its ray; 0 for circles. */
  private get rotation(): number {
    const c = this.config;
    if (!this.shapePath) return 0;
    return (c.index / c.totalPetals) * 360 + c.rotationOffset;
  }

  update(
    isExpanded: boolean,
    externalHover?: boolean,
    mousePos?: { x: number; y: number } | null
  ): void {
    if (externalHover !== undefined) {
      this.isHovered = externalHover;
    }
    this.updateStyles(isExpanded, mousePos);
  }

  private updateStyles(
    isExpanded: boolean,
    mousePos?: { x: number; y: number } | null
  ): void {
    const isExpanding = isExpanded && !this.lastExpanded;
    const c = this.config;
    const isHovered = this.isHovered;
    const isInvisible = c.alpha === 0;
    const t = (ms: number) => bloomTime(ms, c.animationDuration);
    // Opening: petals fan out one after another.
    // Closing: they hold while the ring fades, then fold back together.
    const duration = t(
      isExpanded ? PETAL_TRAVEL_DURATION : PETAL_CLOSE_DURATION
    );
    const easing = isExpanded ? c.openEasing : PETAL_CLOSE_EASING;
    const delay = isExpanded ? c.staggerDelay : t(PETAL_CLOSE_DELAY);
    // Size and opacity only change during the fold itself, after the wind-up.
    const fadeDuration = t(
      isExpanded ? PETAL_FADE_DURATION : COLLAPSE_DURATION
    );
    const fadeDelay = isExpanded ? delay : t(COLLAPSE_DELAY);

    if (isExpanding) {
      this.bloomEndTime = performance.now() + delay + duration;
    } else if (!isExpanded) {
      this.bloomEndTime = 0;
    }
    const isBlooming = isExpanded && performance.now() < this.bloomEndTime;

    // Final bloom position
    const finalAngle = (c.index / c.totalPetals) * 360 - 90 + c.rotationOffset;
    const finalRadian = (finalAngle * Math.PI) / 180;
    let x = Math.cos(finalRadian) * c.radius;
    let y = Math.sin(finalRadian) * c.radius;

    // Petals begin near the center and travel straight outward.
    const startRadian = finalRadian;
    const startRadius = c.radius * PETAL_START_RADIUS;
    const startX = Math.cos(startRadian) * startRadius;
    const startY = Math.sin(startRadian) * startRadius;

    // Subtle push effect when expanded and user moves mouse
    if (isExpanded && !isBlooming && mousePos && !isHovered && !isInvisible) {
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

    const scale =
      isHovered && !isBlooming ? 'var(--bcp-petal-hover-scale, 1.1)' : '1';

    // Use fast transition when hovering/moving mouse while already expanded
    const transformTransition =
      isExpanded && !isBlooming && mousePos && !isHovered
        ? 'transform 150ms ease-out'
        : `transform ${duration}ms ${easing} ${delay}ms`;

    const rotation = this.rotation;
    const turn = rotation ? ` rotate(${rotation}deg)` : '';
    const transform = isExpanded
      ? `translate(${x}px, ${y}px)${turn}`
      : `translate(${startX}px, ${startY}px)${turn}`;
    const scaleTransition =
      isExpanded && !isBlooming
        ? 'scale 150ms ease-out'
        : `scale ${fadeDuration}ms ${isExpanded ? 'ease-out' : BLOOM_CLOSE_EASING} ${fadeDelay}ms`;

    // Shaped petals let the outline take the pointer instead of the box.
    const pointerEvents = isExpanded ? c.pointerEvents : 'none';
    if (this.shapePath) {
      this.shapePath.setAttribute('fill', color);
      this.shapePath.style.pointerEvents =
        pointerEvents === 'auto' ? 'visiblePainted' : 'none';
    }

    setStyles(this.el, {
      backgroundColor: this.shapePath ? 'transparent' : color,
      transform,
      scale: isExpanded ? scale : String(PETAL_COLLAPSED_SCALE),
      opacity: isExpanded ? '1' : '0',
      filter:
        isHovered && !isInvisible
          ? 'brightness(var(--bcp-petal-hover-brightness, 1.1))'
          : 'brightness(1)',
      transition: `${transformTransition},
                   ${scaleTransition},
                   opacity ${fadeDuration}ms linear ${fadeDelay}ms,
                   background-color 200ms ease,
                   box-shadow 200ms ease,
                   filter 200ms ease`,
      boxShadow:
        isInvisible || this.shapePath
          ? 'none'
          : c.hasShadow
            ? isHovered
              ? '0 4px 12px rgba(0,0,0,0.25)'
              : '0 2px 6px rgba(0,0,0,0.15)'
            : isHovered
              ? 'var(--bcp-petal-shadow-hover, var(--bcp-petal-shadow, none))'
              : 'var(--bcp-petal-shadow, none)',
      zIndex: String(c.zIndex),
      pointerEvents: this.shapePath ? 'none' : pointerEvents,
    });

    if (c.pointerEvents === 'none') this.el.setAttribute('aria-hidden', 'true');
    this.lastExpanded = isExpanded;
  }

  destroy(): void {
    this.el.remove();
  }
}

/**
 * Clip to one screen-space half of a rotated petal. The split has to stay
 * vertical on screen while the element itself is turned, so the half-plane is
 * turned back into the element's own coordinates.
 */
function rotatedHalfClip(
  side: 'left' | 'right',
  rotation: number,
  size: number
): string {
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const far = side === 'left' ? -size : size;
  const corners = [
    [0, -size],
    [far, -size],
    [far, size],
    [0, size],
  ];
  const points = corners.map(([x, y]) => {
    const px = x * cos - y * sin + size / 2;
    const py = x * sin + y * cos + size / 2;
    return `${px.toFixed(2)}px ${py.toFixed(2)}px`;
  });
  return `polygon(${points.join(', ')})`;
}
