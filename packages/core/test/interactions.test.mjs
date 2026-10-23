import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { Window } from 'happy-dom';

import {
  BlossomColorPicker,
  ChromePicker,
  lightnessToSliderValue,
} from '../dist/index.esm.js';

const window = new Window();
for (const name of [
  'window',
  'document',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  globalThis[name] =
    typeof window[name] === 'function' && name.endsWith('AnimationFrame')
      ? window[name].bind(window)
      : window[name];
}
const pickers = [];
afterEach(() => {
  for (const picker of pickers.splice(0)) picker.destroy();
  document.body.innerHTML = '';
});
function setup(options = {}, Picker = BlossomColorPicker) {
  const host = document.createElement('div');
  document.body.append(host);
  const picker = new Picker(host, {
    animationDuration: 0,
    adaptivePositioning: false,
    ...options,
  });
  pickers.push(picker);
  return { host, picker };
}
function key(target, key, type = 'keydown', extra = {}) {
  target.dispatchEvent(
    new window.KeyboardEvent(type, {
      key,
      bubbles: true,
      cancelable: true,
      ...extra,
    })
  );
}
function pointer(target, type, extra = {}) {
  target.dispatchEvent(
    new window.PointerEvent(type, {
      bubbles: true,
      button: 0,
      pointerId: 1,
      ...extra,
    })
  );
}
const wait = () => new Promise(r => setTimeout(r, 250));
const buttons = host => [...host.querySelectorAll('[data-color-index]')];

test('opaque default, shade alias and explicit opacity remain compatible', () => {
  const { host, picker } = setup({ showAlphaSlider: false });
  assert.equal(picker.getValue().alpha, 100);
  assert.equal(host.querySelector('[role=slider]'), null);
  picker.setOptions({ showShadeSlider: true, showAlphaSlider: false });
  assert.ok(host.querySelector('[role=slider]'));
  picker.setValue({ ...picker.getValue(), alpha: 27 });
  assert.equal(picker.getValue().alpha, 27);
});

test('duplicate hues retain input identity and saturation across shade and collapse', () => {
  const collapsed = [];
  const { host, picker } = setup({
    initialExpanded: true,
    colors: [
      { h: 0, s: 0, l: 80 },
      { h: 0, s: 85, l: 40 },
      { h: 0, s: 30, l: 60 },
    ],
    onCollapse: color => collapsed.push(color),
  });
  host.querySelector('[data-color-index="1"]').click();
  assert.equal(picker.getValue().colorIndex, 1);
  assert.equal(picker.getValue().originalSaturation, 85);
  const slider = host.querySelector('[role=slider]');
  key(slider, 'ArrowRight');
  key(slider, 'ArrowRight', 'keyup');
  assert.equal(picker.getValue().originalSaturation, 85);
  picker.collapse();
  assert.deepEqual(collapsed[0], picker.getValue());
  picker.setValue({
    hue: 0,
    saturation: 50,
    colorIndex: 2,
    alpha: 100,
    layer: 'inner',
  });
  assert.equal(picker.getValue().originalSaturation, 30);
});

test('explicit black and white palette lightness survives output and collapse', () => {
  const { host, picker } = setup({
    initialExpanded: true,
    colors: ['#000000', '#ffffff'],
  });
  host.querySelector('[data-color-index="0"]').click();
  assert.equal(picker.getValue().hex, '#000000');
  assert.equal(picker.getValue().lightness, 0);
});

test('arrow keys wrap around rings and navigate nearest angles across multiple rings', () => {
  const { host } = setup({ initialExpanded: true });
  const petals = buttons(host);
  // Match ring navigation using the rendered layout, including its rotations.
  const first = petals[0];
  first.focus();
  key(first, 'ArrowLeft');
  const lastInRing = document.activeElement;
  assert.notEqual(lastInRing, first);
  key(lastInRing, 'ArrowRight');
  assert.equal(document.activeElement, first);
  key(first, 'ArrowDown');
  const outer = document.activeElement;
  assert.notEqual(outer, first);
  key(outer, 'ArrowUp');
  assert.equal(document.activeElement, first);
  for (const decorative of host.querySelectorAll(
    '.bcp-petal[aria-hidden=true]'
  )) {
    assert.equal(decorative.tabIndex, -1);
  }
});

test('Escape restores trigger focus and touch/pen outside pointer closes picker', () => {
  const { host } = setup();
  const trigger = host.querySelector('.bcp-trigger-btn');
  trigger.focus();
  trigger.click();
  assert.ok(document.activeElement.matches('.bcp-petal'));
  key(document.activeElement, 'Escape');
  assert.equal(document.activeElement, trigger);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  trigger.click();
  pointer(document.body, 'pointerdown', { pointerType: 'touch' });
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('slider supports bounds, steps and one completion for a repeated keyboard gesture', () => {
  const changes = [],
    completed = [];
  const { host, picker } = setup({
    initialExpanded: true,
    onChange: c => changes.push(c),
    onChangeComplete: c => completed.push(c),
  });
  const slider = host.querySelector('[role=slider]');
  slider.focus();
  key(slider, 'Home');
  key(slider, 'Home', 'keyup');
  assert.equal(slider.getAttribute('aria-valuenow'), '0');
  completed.length = 0;
  key(slider, 'ArrowRight');
  key(slider, 'ArrowRight', 'keydown', { repeat: true });
  key(slider, 'ArrowRight', 'keydown', { shiftKey: true });
  assert.equal(completed.length, 0);
  key(slider, 'ArrowRight', 'keyup');
  assert.equal(completed.length, 1);
  assert.equal(picker.getValue().saturation, 12);
  key(slider, 'End');
  slider.blur();
  assert.equal(completed.length, 2);
  assert.equal(picker.getValue().saturation, 100);
  key(slider, 'ArrowRight');
  key(slider, 'ArrowRight', 'keyup');
  assert.equal(completed.length, 2);
  assert.ok(changes.length > completed.length);
});

test('controlled interactions emit proposals without mutating value and accept parent feedback', () => {
  const changes = [],
    completed = [];
  const value = {
    hue: 20,
    saturation: 40,
    alpha: 65,
    layer: 'outer',
    originalSaturation: 22,
  };
  const { host, picker } = setup({
    value,
    initialExpanded: true,
    onChange: c => changes.push(c),
    onChangeComplete: c => completed.push(c),
  });
  buttons(host)[0].click();
  assert.equal(picker.getValue().hue, 20);
  assert.equal(completed.length, 1);
  const slider = host.querySelector('[role=slider]');
  key(slider, 'ArrowRight');
  key(slider, 'ArrowRight', 'keyup');
  assert.equal(picker.getValue().saturation, 40);
  assert.equal(changes.at(-1).saturation, 41);
  assert.deepEqual(completed.at(-1), changes.at(-1));
  assert.equal(value.saturation, 40);
  picker.setValue(changes.at(-1));
  assert.equal(picker.getValue().saturation, 41);
  picker.setOptions({ value: undefined });
  key(slider, 'ArrowRight');
  assert.equal(picker.getValue().saturation, 42);
});

test('pointer drags filter pointer identity, complete once, and detach after destroy', () => {
  const changes = [],
    completed = [];
  const { host, picker } = setup({
    initialExpanded: true,
    onChange: c => changes.push(c),
    onChangeComplete: c => completed.push(c),
  });
  const slider = host.querySelector('[role=slider]');
  pointer(slider, 'pointerdown', { pointerType: 'pen' });
  pointer(window, 'pointermove', { pointerId: 2, clientX: 100, clientY: 10 });
  assert.equal(changes.length, 0);
  pointer(window, 'pointermove', { clientX: 100, clientY: 10 });
  pointer(window, 'pointermove', { clientX: 100, clientY: 20 });
  assert.equal(completed.length, 0);
  pointer(window, 'pointerup');
  pointer(window, 'pointerup');
  assert.equal(completed.length, 1);
  assert.deepEqual(completed[0], changes.at(-1));
  pointer(slider, 'pointerdown');
  picker.destroy();
  const count = changes.length;
  pointer(window, 'pointermove', { clientX: 100, clientY: 30 });
  assert.equal(changes.length, count);
});

test('track pointer gesture and cancellation finish the last emitted proposal', () => {
  const completed = [];
  const { host } = setup({
    initialExpanded: true,
    onChangeComplete: c => completed.push(c),
  });
  pointer(host.querySelector('.bcp-slider-track'), 'pointerdown', {
    clientX: 100,
    clientY: 10,
  });
  assert.equal(completed.length, 0);
  pointer(window, 'pointercancel');
  assert.equal(completed.length, 1);
});

test('disabled petals and slider do not change value or fire callbacks', () => {
  const changes = [];
  const { host, picker } = setup({
    initialExpanded: true,
    disabled: true,
    onChange: c => changes.push(c),
  });
  const before = picker.getValue();
  buttons(host)[0].click();
  key(host.querySelector('[role=slider]'), 'Home');
  assert.deepEqual(picker.getValue(), before);
  assert.equal(changes.length, 0);
  assert.equal(host.querySelector('.bcp-container').inert, true);
});

test('legacy hue values use nearest lightness instead of the first duplicate hue', () => {
  const { picker } = setup({
    colors: [
      { h: 10, s: 5, l: 80 },
      { h: 10, s: 90, l: 40 },
    ],
    defaultValue: {
      hue: 10,
      saturation: lightnessToSliderValue(40),
      alpha: 100,
      layer: 'inner',
    },
  });
  assert.equal(picker.getValue().originalSaturation, 90);
});

test('ChromePicker keeps its internal change adapter after setOptions', () => {
  const changes = [],
    completed = [];
  const { host, picker } = setup(
    {
      onChange: c => changes.push(c),
      onChangeComplete: c => completed.push(c),
    },
    ChromePicker
  );
  picker.setOptions({ showShadeSlider: true });
  const petal = buttons(host)[0];
  petal.click();
  assert.equal(changes.length, 1);
  assert.equal(completed.length, 1);
  assert.equal(
    host.querySelector('.bcp-chrome-native-slider').value,
    String(picker.getValue().alpha)
  );
});

test('all four rings are reachable and repeated palette objects get distinct identities', () => {
  const repeated = { h: 15, s: 30, l: 60 };
  const colors = [
    repeated,
    repeated,
    ...Array.from({ length: 58 }, (_, i) => ({ h: i * 6, s: 50, l: 90 - i })),
  ];
  const { host, picker } = setup({ colors, initialExpanded: true });
  assert.equal(buttons(host).length, 60);
  assert.equal(new Set(buttons(host).map(b => b.dataset.colorIndex)).size, 60);
  const first = buttons(host)[0];
  first.focus();
  const visited = [first];
  for (let i = 0; i < 3; i++) {
    key(document.activeElement, 'ArrowDown');
    assert.ok(!visited.includes(document.activeElement));
    visited.push(document.activeElement);
  }
  const outer = document.activeElement;
  key(outer, 'ArrowDown');
  assert.equal(document.activeElement, outer);
  host.querySelector('[data-color-index="1"]').click();
  assert.equal(picker.getValue().colorIndex, 1);
});

test('one petal remains in the Tab order through pointer animation and state updates', async () => {
  const { host, picker } = setup({ initialExpanded: true });
  const petals = buttons(host);
  petals[2].focus();
  const focusable = () => buttons(host).filter(b => b.tabIndex === 0);
  assert.deepEqual(focusable(), [petals[2]]);
  host
    .querySelector('.bcp-container')
    .dispatchEvent(
      new window.MouseEvent('mousemove', { clientX: 20, clientY: 20 })
    );
  await new Promise(resolve => window.requestAnimationFrame(resolve));
  assert.deepEqual(focusable(), [petals[2]]);
  picker.setOptions({ showCoreColor: true });
  assert.deepEqual(focusable(), [petals[2]]);
});

test('Escape leaves a noncollapsible picker open', () => {
  const { host } = setup({ collapsible: false });
  buttons(host)[0].focus();
  key(document.activeElement, 'Escape');
  assert.equal(host.querySelector('.bcp-container').inert, false);
  assert.equal(document.activeElement, buttons(host)[0]);
});

test('hovering a petal reports its color and previews it only when enabled', () => {
  const hovers = [];
  const { host, picker } = setup({
    initialExpanded: true,
    showCoreColor: true,
    colors: ['#ff0000', '#0000ff'],
    defaultValue: { hue: 0, saturation: 50, alpha: 100, layer: 'inner' },
    onHover: c => hovers.push(c),
  });
  const ring = () =>
    host
      .querySelectorAll('.bcp-svg')[0]
      .querySelectorAll('circle')[1]
      .getAttribute('stroke');
  const before = ring();
  const blue = host.querySelector('[data-color-index="1"]');
  blue.dispatchEvent(new window.MouseEvent('mouseenter'));
  assert.equal(hovers.at(-1).hex, '#0000ff');
  assert.equal(ring(), before);
  blue.dispatchEvent(new window.MouseEvent('mouseleave'));
  assert.equal(hovers.at(-1), null);

  picker.setOptions({ hoverPreview: true });
  blue.dispatchEvent(new window.MouseEvent('mouseenter'));
  assert.notEqual(ring(), before);
  assert.equal(picker.getValue().colorIndex, undefined);
  picker.collapse();
  assert.equal(hovers.at(-1), null);
  assert.equal(ring(), before);
});

test('shaped petals draw an outline that points outward; circles stay as before', () => {
  const { host, picker } = setup({ initialExpanded: true });
  const petal = () => host.querySelector('[data-color-index]');
  assert.equal(petal().style.borderRadius, '50%');
  assert.equal(petal().querySelector('svg'), null);
  assert.doesNotMatch(petal().style.transform, /rotate/);

  picker.setOptions({ petalShape: 'sakura' });
  const path = petal().querySelector('.bcp-petal-shape path');
  assert.ok(path.getAttribute('d'));
  assert.match(path.getAttribute('fill'), /^hsl/);
  assert.equal(petal().style.backgroundColor, 'transparent');
  assert.ok(
    [...host.querySelectorAll('[data-color-index]')].some(p =>
      /rotate\(/.test(p.style.transform)
    )
  );
  // The outline, not the square box, takes the pointer.
  assert.equal(petal().style.pointerEvents, 'none');
  assert.equal(path.style.pointerEvents, 'visiblePainted');
  for (const half of host.querySelectorAll('.bcp-petal[aria-hidden=true]')) {
    if (half.style.clipPath) assert.match(half.style.clipPath, /px/);
  }
  picker.collapse();
  assert.equal(path.style.pointerEvents, 'none');
});

test('every petal shape renders its own outline', () => {
  const { host, picker } = setup({ initialExpanded: true });
  const outlines = new Set();
  for (const shape of ['sakura', 'lotus', 'pinwheel']) {
    picker.setOptions({ petalShape: shape });
    const d = host
      .querySelector('[data-color-index] .bcp-petal-shape path')
      .getAttribute('d');
    assert.ok(d);
    outlines.add(d);
  }
  assert.equal(outlines.size, 3);
});

test('openOnHover closes after a mouse click but stays open for keyboard focus', async () => {
  const { host } = setup({ openOnHover: true, initialExpanded: true });
  const root = host.querySelector('.bcp-root');
  const trigger = host.querySelector('.bcp-trigger-btn');
  const petal = buttons(host)[0];

  // Keyboard focus inside keeps the bloom open when the pointer wanders off.
  petal.focus();
  root.dispatchEvent(new window.MouseEvent('mouseleave'));
  await wait();
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');

  // Focus left behind by a mouse click is not :focus-visible.
  petal.matches = selector =>
    selector === ':focus-visible'
      ? false
      : window.Element.prototype.matches.call(petal, selector);
  root.dispatchEvent(new window.MouseEvent('mouseleave'));
  await wait();
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('veined petals draw vein lines only on shaped petals', () => {
  const { host, picker } = setup({
    initialExpanded: true,
    petalStyle: 'veined',
  });
  // Circles have no outline to draw veins on.
  assert.equal(host.querySelector('.bcp-petal-veins'), null);
  picker.setOptions({ petalShape: 'lotus' });
  const visible = host.querySelectorAll('.bcp-petal-visible').length;
  assert.equal(host.querySelectorAll('.bcp-petal-veins').length, visible);
  // The invisible hit-target petal stays bare.
  for (const petal of host.querySelectorAll(
    '.bcp-petal:not(.bcp-petal-visible)'
  ))
    assert.equal(petal.querySelector('.bcp-petal-veins'), null);
  picker.setOptions({ petalStyle: 'flat' });
  assert.equal(host.querySelector('.bcp-petal-veins'), null);
});

test('only the visible parts take the pointer, not the square layers around them', () => {
  const { host, picker } = setup({ initialExpanded: true });
  const container = host.querySelector('.bcp-container');
  const slider = host.querySelector('.bcp-slider-track').ownerSVGElement;
  assert.equal(container.style.pointerEvents, 'none');
  assert.notEqual(slider.style.pointerEvents, 'auto');
  assert.equal(
    host.querySelector('.bcp-slider-track').style.pointerEvents,
    'visibleStroke'
  );
  assert.equal(host.querySelector('.bcp-bg-solid').style.pointerEvents, 'auto');
  picker.collapse();
  assert.equal(
    host.querySelector('.bcp-slider-track').style.pointerEvents,
    'none'
  );
  assert.equal(host.querySelector('[role=slider]').style.pointerEvents, 'none');
  assert.equal(host.querySelector('.bcp-bg-solid').style.pointerEvents, 'none');
});

test('dragging the slider hides its focus ring until a key is pressed', () => {
  const { host } = setup({ initialExpanded: true });
  const handle = host.querySelector('[role=slider]');
  pointer(handle, 'pointerdown');
  assert.equal(document.activeElement, handle);
  assert.ok(handle.classList.contains('bcp-pointer-focus'));
  pointer(window, 'pointerup');
  key(handle, 'ArrowRight');
  assert.ok(!handle.classList.contains('bcp-pointer-focus'));
});

test('focus leaving another petal keeps the hovered petal previewed', () => {
  const { host } = setup({
    initialExpanded: true,
    hoverPreview: true,
    colors: ['#0000ff', '#ff0000'],
  });
  const ring = () =>
    host
      .querySelectorAll('.bcp-svg')[0]
      .querySelectorAll('circle')[1]
      .getAttribute('stroke');
  const blue = host.querySelector('[data-color-index="0"]');
  const red = host.querySelector('[data-color-index="1"]');
  blue.click();
  blue.focus();
  const selected = ring();
  red.dispatchEvent(new window.MouseEvent('mouseenter'));
  const previewed = ring();
  assert.notEqual(previewed, selected);
  // Clicking red moves focus off blue; the red preview must stay put.
  blue.blur();
  assert.equal(ring(), previewed);
  red.dispatchEvent(new window.MouseEvent('mouseleave'));
  assert.equal(ring(), selected);
});

test('a touch drag on the slider does not scroll the page', () => {
  const { host } = setup({ initialExpanded: true });
  const handle = host.querySelector('[role=slider]');
  assert.equal(handle.ownerSVGElement.style.touchAction, 'none');
  const touchmove = () => {
    const e = new window.Event('touchmove', {
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(e);
    return e.defaultPrevented;
  };
  assert.equal(touchmove(), false);
  pointer(handle, 'pointerdown', { pointerType: 'touch' });
  assert.equal(touchmove(), true);
  pointer(window, 'pointerup', { pointerType: 'touch' });
  assert.equal(touchmove(), false);
});

test('an always-open bloom moves its arc when sliderPosition changes', () => {
  const { host, picker } = setup({
    collapsible: false,
    sliderPosition: 'left',
  });
  const orientation = () =>
    host.querySelector('[role=slider]').getAttribute('aria-orientation');
  assert.equal(orientation(), 'vertical');
  picker.setOptions({ sliderPosition: 'bottom' });
  assert.equal(orientation(), 'horizontal');
  picker.setOptions({ sliderPosition: 'right' });
  assert.equal(orientation(), 'vertical');
});

test('ChromePicker inputs and alpha slider complete once per committed edit', () => {
  const changes = [],
    completed = [];
  const { host } = setup(
    {
      onChange: c => changes.push(c),
      onChangeComplete: c => completed.push(c),
    },
    ChromePicker
  );
  const fire = (el, type, extra = {}) =>
    el.dispatchEvent(
      new window.Event(type, { bubbles: true, cancelable: true, ...extra })
    );

  // Dragging the alpha slider reports every step, then completes on release.
  const alpha = host.querySelector('.bcp-chrome-native-slider');
  alpha.value = '40';
  fire(alpha, 'input');
  alpha.value = '30';
  fire(alpha, 'input');
  assert.equal(changes.length, 2);
  assert.equal(completed.length, 0);
  fire(alpha, 'change');
  assert.equal(completed.length, 1);
  assert.equal(completed[0].alpha, 30);
  fire(alpha, 'change');
  assert.equal(completed.length, 1);

  // Typing completes on Enter; the change event that follows does not repeat it.
  host.querySelector('.bcp-chrome-toggle').click(); // HSLA -> HEX
  const hex = host.querySelector('.bcp-chrome-input');
  hex.value = '#12';
  fire(hex, 'input');
  fire(hex, 'change');
  assert.equal(completed.length, 1, 'an invalid value does not complete');
  hex.value = '#1E90FF';
  fire(hex, 'input');
  hex.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
  );
  fire(hex, 'change');
  assert.equal(completed.length, 2);
  assert.deepEqual(completed[1], changes.at(-1));
});
