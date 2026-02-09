const SVG_NS = 'http://www.w3.org/2000/svg';

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  styles?: Partial<CSSStyleDeclaration>,
  attrs?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (styles) setStyles(el, styles);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
  }
  return el;
}

export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
  }
  return el;
}

export function setStyles(
  el: HTMLElement | SVGElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  for (const [key, val] of Object.entries(styles)) {
    if (val !== undefined) {
      (el.style as unknown as Record<string, unknown>)[key] = val;
    }
  }
}

export function setAttributes(
  el: Element,
  attrs: Record<string, string>
): void {
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
}
