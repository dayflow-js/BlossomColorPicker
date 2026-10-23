import {
  polarToCartesian,
  describeArc,
  getCenterAngle,
  calculateSliderValueFromPoint,
  calculateArcGradientColors,
} from '../arc-geometry';
import {
  SLIDER_CLOSE_DURATION,
  SLIDER_FADE_DELAY,
  SLIDER_FADE_DURATION,
  ARC_GRADIENT_STEPS,
  bloomTime,
} from '../constants';
import { createSVGElement, setStyles, setAttributes } from '../dom-helpers';
import type { SliderPosition } from '../types';
import {
  sliderValueToLightness,
  hslToString,
  getVisualSaturation,
} from '../utils';

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
  private handleRadius: number;
  private gradientId: string;

  private currentPosition: SliderPosition;
  private currentValue = 50;
  private currentHue = 0;
  private currentBaseSaturation = 70;
  private animationDuration: number;

  private pointerId: number | null = null;
  private keyboardChanged = false;
  private boundPointerMove = (e: PointerEvent) => {
    if (e.pointerId === this.pointerId) this.calculateValueFromEvent(e);
  };
  private boundEnd = (e: PointerEvent) => {
    if (e.pointerId === this.pointerId) this.endDrag();
  };
  // Backup for browsers that ignore `touch-action` on SVG: while a drag is
  // running, a finger moving on the page must not scroll it.
  private boundTouchMove = (e: TouchEvent) => {
    if (this.pointerId !== null && e.cancelable) e.preventDefault();
  };

  constructor(
    barRadius: number,
    private barWidth: number,
    sliderOffset: number,
    animationDuration: number,
    private onChange: (value: number) => void,
    position: SliderPosition = 'right',
    private onChangeComplete: () => void = () => {}
  ) {
    this.animationDuration = animationDuration;
    this.currentPosition = position;
    this.arcRadius = barRadius + sliderOffset;
    this.handleRadius = barWidth / 2;
    // Just wide enough for the arc and the handle's 2px outline in any
    // position; anything larger would only add dead space around the bloom.
    this.svgSize = (this.arcRadius + this.handleRadius + 2) * 2;
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
      willChange: 'opacity',
      // A touch that starts on the arc or handle drags the slider instead of
      // scrolling the page. The SVG itself takes no pointer, so touches on its
      // empty corners still scroll normally.
      touchAction: 'none',
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
      'stroke-width': String(this.barWidth),
      'stroke-linecap': 'round',
    });
    this.bgPath.style.stroke = 'var(--bcp-track, rgba(0, 0, 0, 0.06))';
    this.el.appendChild(this.bgPath);

    // Gradient overlay
    this.gradientPath = createSVGElement('path', {
      fill: 'none',
      stroke: `url(#${this.gradientId})`,
      'stroke-width': String(this.barWidth),
      'stroke-linecap': 'round',
    });
    this.gradientPath.classList.add('bcp-slider-track');
    this.gradientPath.addEventListener('pointerdown', e =>
      this.startDrag(e, true)
    );
    this.el.appendChild(this.gradientPath);

    // Handle
    this.handle = createSVGElement('circle', {
      r: String(this.handleRadius),
      fill: '#fff',
      stroke: 'white',
      'stroke-width': '2',
    });
    this.handle.classList.add('bcp-slider-handle');
    setAttributes(this.handle, {
      role: 'slider',
      'aria-label': 'Shade',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      tabindex: '-1',
    });
    this.handle.addEventListener('pointerdown', e => this.startDrag(e, false));
    this.handle.addEventListener('keydown', e => this.handleKeyDown(e));
    this.handle.addEventListener('keyup', e => {
      if (
        [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(e.key)
      )
        this.completeKeyboardChange();
    });
    this.handle.addEventListener('blur', () => {
      this.handle.classList.remove('bcp-pointer-focus');
      this.completeKeyboardChange();
    });
    this.el.appendChild(this.handle);

    this.updateGeometry();
  }

  private startDrag(e: PointerEvent, jump: boolean): void {
    if (e.button !== 0 || this.pointerId !== null) return;
    e.preventDefault();
    // Focus the handle so arrow keys work right after a drag, but mark it so
    // the keyboard focus ring stays hidden until a key is actually pressed.
    this.handle.classList.add('bcp-pointer-focus');
    this.handle.focus();
    this.pointerId = e.pointerId;
    this.isDragging = true;
    this.updateHandleTransition();
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundEnd);
    window.addEventListener('pointercancel', this.boundEnd);
    window.addEventListener('touchmove', this.boundTouchMove, {
      passive: false,
    });
    // Capture keeps pen/touch input attached to the slider outside its SVG bounds.
    this.el.setPointerCapture?.(e.pointerId);
    if (jump) this.calculateValueFromEvent(e);
  }

  private endDrag(complete = true): void {
    const id = this.pointerId;
    this.pointerId = null;
    this.isDragging = false;
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundEnd);
    window.removeEventListener('pointercancel', this.boundEnd);
    window.removeEventListener('touchmove', this.boundTouchMove);
    if (id !== null && this.el.hasPointerCapture?.(id))
      this.el.releasePointerCapture(id);
    setStyles(this.handle, {
      transition: `cx ${this.animationDuration / 3}ms ease, cy ${this.animationDuration / 3}ms ease`,
    });
    if (id !== null && complete) this.onChangeComplete();
  }

  private completeKeyboardChange(): void {
    if (!this.keyboardChanged) return;
    this.keyboardChanged = false;
    this.onChangeComplete();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.handle.classList.remove('bcp-pointer-focus');
    const step = e.shiftKey ? 10 : 1;
    const changes: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: 10,
      PageDown: -10,
      Home: -this.currentValue,
      End: 100 - this.currentValue,
    };
    if (!(e.key in changes)) return;
    e.preventDefault();
    const value = Math.max(
      0,
      Math.min(100, this.currentValue + changes[e.key])
    );
    if (value === this.currentValue) return;
    this.keyboardChanged = true;
    this.onChange(value);
  }

  private calculateValueFromEvent(e: PointerEvent): void {
    const rect = this.el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const { clientX, clientY } = e;

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
    setAttributes(this.handle, {
      tabindex: isExpanded ? '0' : '-1',
      'aria-valuenow': String(value),
      'aria-valuetext': `${Math.round(value)}% shade`,
      'aria-orientation':
        position === 'left' || position === 'right' ? 'vertical' : 'horizontal',
    });
    this.el.setAttribute('aria-hidden', String(!isExpanded));
    if (!isExpanded) this.endDrag();
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
    const valStartAngle = position === 'left' ? drawEndAngle : drawStartAngle;
    const valEndAngle = position === 'left' ? drawStartAngle : drawEndAngle;

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

    // The arc is the last beat of the bloom and the first thing to leave.
    const delay = isExpanded
      ? bloomTime(SLIDER_FADE_DELAY, this.animationDuration)
      : 0;
    const duration = bloomTime(
      isExpanded ? SLIDER_FADE_DURATION : SLIDER_CLOSE_DURATION,
      this.animationDuration
    );

    setStyles(this.el, {
      opacity: isExpanded ? '1' : '0',
      transition: `opacity ${duration}ms linear ${delay}ms`,
    });
    // The square SVG never takes the pointer itself, only the arc and handle,
    // so the empty corners around the bloom stay clickable.
    const arcPointer = isExpanded ? 'visibleStroke' : 'none';
    this.gradientPath.style.pointerEvents = arcPointer;
    this.handle.style.pointerEvents = isExpanded ? 'visiblePainted' : 'none';

    setStyles(this.handle, {
      transition: this.isDragging
        ? 'none'
        : `cx ${this.animationDuration / 3}ms ease, cy ${this.animationDuration / 3}ms ease`,
    });
  }

  private updateHandleTransition(): void {
    if (this.isDragging) {
      setStyles(this.handle, {
        transition: 'none',
      });
    }
  }

  destroy(): void {
    this.endDrag(false);
    this.el.remove();
  }
}
