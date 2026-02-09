import { BLOOM_EASING } from '../constants';
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

    setStyles(this.el, {
      backgroundColor: coreColor,
      transform: isExpanded
        ? 'scale(1)'
        : isHovering
          ? 'scale(1.05)'
          : 'scale(1)',
      boxShadow: isExpanded
        ? '0 0 0 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)'
        : '0 2px 8px rgba(0,0,0,0.15)',
      transition: `transform ${this.animationDuration}ms ${BLOOM_EASING}, box-shadow ${this.animationDuration}ms ${BLOOM_EASING}`,
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
