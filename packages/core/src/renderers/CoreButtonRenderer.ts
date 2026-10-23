import {
  TRIGGER_FADE_DURATION,
  TRIGGER_POP_DELAY,
  bloomTime,
} from '../constants';
import { createElement, setStyles } from '../dom-helpers';

export class CoreButtonRenderer {
  public el: HTMLButtonElement;

  constructor(
    private coreSize: number,
    private animationDuration: number,
    private onClick: () => void
  ) {
    this.el = createElement('button', undefined, {
      type: 'button',
      tabIndex: '0',
    });
    this.el.className = 'bcp-core';
    this.el.addEventListener('click', () => this.onClick());

    setStyles(this.el, {
      width: `${coreSize}px`,
      height: `${coreSize}px`,
      zIndex: '1000',
    });
  }

  update(
    coreColor: string,
    isExpanded: boolean,
    isHovering: boolean,
    disabled: boolean
  ): void {
    this.el.disabled = disabled;
    this.el.setAttribute(
      'aria-label',
      `Color picker${isExpanded ? ', expanded' : ''}`
    );
    this.el.setAttribute('aria-expanded', String(isExpanded));
    this.el.tabIndex = isExpanded ? 0 : -1;

    // Cross-fades with the trigger: in as the bloom starts, out once it has folded.
    const fade = bloomTime(TRIGGER_FADE_DURATION, this.animationDuration);
    const handoff = bloomTime(TRIGGER_POP_DELAY, this.animationDuration);

    setStyles(this.el, {
      backgroundColor: coreColor,
      opacity: isExpanded ? '1' : '0',
      pointerEvents: isExpanded ? 'auto' : 'none',
      transform: isExpanded
        ? 'scale(1)'
        : isHovering
          ? 'scale(1.05)'
          : 'scale(1)',
      boxShadow: isExpanded
        ? 'var(--bcp-core-shadow, 0 0 0 2px rgba(0,0,0,0.08), 0 3px 8px rgba(0,0,0,0.12))'
        : 'var(--bcp-trigger-shadow, 0 2px 8px rgba(0,0,0,0.12))',
      transition: `transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, background-color 180ms ease, opacity ${fade}ms ease ${isExpanded ? 0 : handoff}ms`,
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
