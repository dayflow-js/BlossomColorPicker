import { BLOOM_EASING, ARC_GRADIENT_STEPS } from '../constants';
import type { SliderPosition } from '../types';
import {
  polarToCartesian,
  describeArc,
  getCenterAngle,
  calculateSliderValueFromPoint,
  calculateArcGradientColors,
} from '../arc-geometry';
import { sliderValueToLightness, hslToString, getVisualSaturation } from '../utils';
import { createSVGElement, setStyles, setAttributes } from '../dom-helpers';

let arcIdCounter = 0;

export class ArcSliderRenderer {
  public el: SVGSVGElement;
  private bgPath: SVGPathElement;
  private gradientPath: SVGPathElement;
  private handle: SVGCircleElement;
  private gradient: SVGLinearGradientElement;
  private gradientStops: SVGStopElement[] = [];

  private isDragging = false;
  private svgSize: number;
  private center: number;
  private arcRadius: number;
  private halfSweep = 30;
  private strokeWidth: number;
  private handleRadius: number;
  private gradientId: string;

  private currentPosition: SliderPosition;
  private currentValue = 50;
  private currentHue = 0;
  private currentBaseSaturation = 70;
  private animationDuration: number;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundEnd: () => void;

  constructor(
    private barRadius: number,
    private barWidth: number,
    private sliderOffset: number,
    animationDuration: number,
    private onChange: (value: number) => void,
    position: SliderPosition = 'right'
  ) {
    this.animationDuration = animationDuration;
    this.currentPosition = position;
    this.arcRadius = barRadius + sliderOffset;
    this.strokeWidth = barWidth;
    this.handleRadius = barWidth / 2;
    this.svgSize = (this.arcRadius + this.handleRadius + this.strokeWidth) * 2 + 20;
    this.center = this.svgSize / 2;

    this.gradientId = `bcp-arc-grad-${++arcIdCounter}`;

    this.el = createSVGElement('svg', {
      width: String(this.svgSize),
      height: String(this.svgSize),
    });
    this.el.classList.add('bcp-svg');
    setStyles(this.el, {
      left: '50%',
      top: '50%',
      marginLeft: `${-this.svgSize / 2}px`,
      marginTop: `${-this.svgSize / 2}px`,
      zIndex: '50',
    });

    // Create defs + gradient
    const defs = createSVGElement('defs');
    this.gradient = createSVGElement('linearGradient', {
      id: this.gradientId,
      gradientUnits: 'userSpaceOnUse',
    });

    for (let i = 0; i < ARC_GRADIENT_STEPS; i++) {
      const stop = createSVGElement('stop', {
        offset: `${(i / (ARC_GRADIENT_STEPS - 1)) * 100}%`,
        'stop-color': '#fff',
      });
      this.gradientStops.push(stop);
      this.gradient.appendChild(stop);
    }

    defs.appendChild(this.gradient);
    this.el.appendChild(defs);

    // Background track
    this.bgPath = createSVGElement('path', {
      fill: 'none',
      stroke: 'rgba(0,0,0,0.06)',
      'stroke-width': String(this.strokeWidth),
      'stroke-linecap': 'round',
    });
    this.el.appendChild(this.bgPath);

    // Gradient overlay
    this.gradientPath = createSVGElement('path', {
      fill: 'none',
      stroke: `url(#${this.gradientId})`,
      'stroke-width': String(this.strokeWidth),
      'stroke-linecap': 'round',
    });
    this.gradientPath.classList.add('bcp-slider-track');
    this.gradientPath.addEventListener('click', (e) => {
      this.handleTrackClick(e);
    });
    this.el.appendChild(this.gradientPath);

    // Handle
    this.handle = createSVGElement('circle', {
      r: String(this.handleRadius),
      fill: '#fff',
      stroke: 'white',
      'stroke-width': '2',
    });
    this.handle.classList.add('bcp-slider-handle');
    this.handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.startDrag();
    });
    this.handle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrag();
    });
    this.el.appendChild(this.handle);

    // Bind drag handlers
    this.boundMouseMove = (e: MouseEvent) => this.calculateValueFromEvent(e);
    this.boundTouchMove = (e: TouchEvent) => this.calculateValueFromEvent(e);
    this.boundEnd = () => this.endDrag();

    this.updateGeometry();
  }

  private startDrag(): void {
    this.isDragging = true;
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundEnd);
    window.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    window.addEventListener('touchend', this.boundEnd);
  }

  private endDrag(): void {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundEnd);
    window.removeEventListener('touchmove', this.boundTouchMove);
    window.removeEventListener('touchend', this.boundEnd);
    this.updateHandleTransition();
  }

  private handleTrackClick(e: MouseEvent): void {
    this.calculateValueFromEvent(e);
  }

  private calculateValueFromEvent(e: MouseEvent | TouchEvent): void {
    if ('touches' in e) {
      e.preventDefault();
    }
    const rect = this.el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const centerAngle = getCenterAngle(this.currentPosition);
    const value = calculateSliderValueFromPoint(
      dx,
      dy,
      centerAngle,
      this.halfSweep,
      this.currentPosition
    );

    this.onChange(value);
  }

  private updateGeometry(): void {
    const centerAngle = getCenterAngle(this.currentPosition);
    const drawStartAngle = centerAngle - this.halfSweep;
    const drawEndAngle = centerAngle + this.halfSweep;

    const arcD = describeArc(
      this.center,
      this.center,
      this.arcRadius,
      drawStartAngle,
      drawEndAngle
    );
    this.bgPath.setAttribute('d', arcD);
    this.gradientPath.setAttribute('d', arcD);

    // Gradient direction follows value direction
    const valStartAngle =
      this.currentPosition === 'left' ? drawEndAngle : drawStartAngle;
    const valEndAngle =
      this.currentPosition === 'left' ? drawStartAngle : drawEndAngle;

    const gradStart = polarToCartesian(
      this.center,
      this.center,
      this.arcRadius,
      valStartAngle
    );
    const gradEnd = polarToCartesian(
      this.center,
      this.center,
      this.arcRadius,
      valEndAngle
    );

    setAttributes(this.gradient, {
      x1: String(gradStart.x),
      y1: String(gradStart.y),
      x2: String(gradEnd.x),
      y2: String(gradEnd.y),
    });
  }

  update(
    value: number,
    hue: number,
    baseSaturation: number,
    isExpanded: boolean,
    position: SliderPosition
  ): void {
    this.currentValue = value;
    this.currentHue = hue;
    this.currentBaseSaturation = baseSaturation;

    if (position !== this.currentPosition) {
      this.currentPosition = position;
      this.updateGeometry();
    }

    // Update gradient colors
    const gradientColors = calculateArcGradientColors(
      hue,
      baseSaturation,
      ARC_GRADIENT_STEPS,
      getVisualSaturation,
      hslToString
    );
    for (let i = 0; i < this.gradientStops.length; i++) {
      this.gradientStops[i].setAttribute('stop-color', gradientColors[i]);
    }

    // Update handle position
    const centerAngle = getCenterAngle(position);
    const drawStartAngle = centerAngle - this.halfSweep;
    const drawEndAngle = centerAngle + this.halfSweep;
    const valStartAngle =
      position === 'left' ? drawEndAngle : drawStartAngle;
    const valEndAngle =
      position === 'left' ? drawStartAngle : drawEndAngle;

    const handleAngle =
      valStartAngle + (value / 100) * (valEndAngle - valStartAngle);
    const handlePos = polarToCartesian(
      this.center,
      this.center,
      this.arcRadius,
      handleAngle
    );

    const handleLightness = sliderValueToLightness(value);
    const handleSaturation = getVisualSaturation(value, baseSaturation);
    const handleColor = hslToString(hue, handleSaturation, handleLightness);

    this.handle.setAttribute('cx', String(handlePos.x));
    this.handle.setAttribute('cy', String(handlePos.y));
    this.handle.setAttribute('fill', handleColor);

    this.updateHandleTransition();

    // Show/hide
    setStyles(this.el, {
      opacity: isExpanded ? '1' : '0',
      transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
      transition: `opacity ${this.animationDuration}ms ${BLOOM_EASING} ${this.animationDuration / 2}ms, transform ${this.animationDuration}ms ${BLOOM_EASING} ${this.animationDuration / 2}ms`,
    });
  }

  private updateHandleTransition(): void {
    setStyles(this.handle, {
      transition: this.isDragging
        ? 'none'
        : `cx ${this.animationDuration / 3}ms ease, cy ${this.animationDuration / 3}ms ease`,
    });
  }

  destroy(): void {
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundEnd);
    window.removeEventListener('touchmove', this.boundTouchMove);
    window.removeEventListener('touchend', this.boundEnd);
    this.el.remove();
  }
}
