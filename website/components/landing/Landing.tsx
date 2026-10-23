'use client';

import {
  organizeColorsIntoLayers,
  type PetalShape,
  type PetalStyle,
} from '@dayflow/blossom-color-picker';
import {
  BlossomColorPicker,
  ChromePicker,
  hslToHex,
  lightnessToSliderValue,
  type BlossomColorPickerColor,
  type BlossomColorPickerValue,
} from '@dayflow/blossom-color-picker-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { FrameworkInstall } from '@/components/FrameworkInstall';

import { PetalShapeIcon } from './PetalShapeIcon';

const SHAPES: { value: PetalShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'sakura', label: 'Sakura' },
  { value: 'lotus', label: 'Lotus' },
  { value: 'pinwheel', label: 'Pinwheel' },
];

// The pink petal from the default palette, so the page opens on a real swatch.
const START = { h: 327, s: 75, l: 62 };
const START_VALUE: BlossomColorPickerValue = {
  hue: START.h,
  saturation: lightnessToSliderValue(START.l),
  lightness: START.l,
  originalSaturation: START.s,
  alpha: 100,
  layer: 'outer',
};

function useIsWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 640px)');
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return wide;
}

export function Landing() {
  const wide = useIsWide();
  const [shape, setShape] = useState<PetalShape>('sakura');
  const [style, setStyle] = useState<PetalStyle>('veined');
  const [value, setValue] = useState(START_VALUE);
  const [hex, setHex] = useState(hslToHex(START.h, START.s, START.l));
  const [lightness, setLightness] = useState(START.l);

  const petals = { petalShape: shape, petalStyle: style };
  const pick = (color: BlossomColorPickerColor) => {
    setValue(color);
    setHex(color.hex);
    setLightness(color.lightness ?? START.l);
  };

  return (
    <div
      className='landing'
      style={
        {
          '--bloom': hex,
          // Dark text on light picks, light text on deep ones.
          '--bloom-ink': lightness > 50 ? '#2B2233' : '#FFFFFF',
        } as React.CSSProperties
      }
    >
      <section className='landing-hero'>
        <div className='landing-wash' aria-hidden='true' />
        <div className='landing-hero-copy'>
          <h1 className='landing-display landing-title'>
            A color picker that blooms open.
          </h1>
          <p className='landing-lede'>
            Click the core and the petals fan out. Pick one, then slide along
            the arc to make it lighter or darker. Works with React, Vue, Svelte,
            Angular and plain JavaScript.
          </p>
          <div className='landing-actions'>
            <Link href='/docs/introduction' className='landing-button-primary'>
              Get started
            </Link>
            <Link
              href='https://github.com/dayflow-js/BlossomColorPicker'
              className='landing-button-quiet'
            >
              View on GitHub
            </Link>
          </div>
        </div>

        <div className='landing-hero-bloom'>
          <div className='landing-bloom-stage'>
            <BlossomColorPicker
              value={value}
              onChange={pick}
              collapsible={false}
              adaptivePositioning={false}
              coreSize={wide ? 64 : 40}
              petalSize={wide ? 62 : 36}
              circularBarWidth={wide ? 16 : 10}
              sliderWidth={wide ? 20 : 14}
              showCoreColor
              hoverPreview
              {...petals}
            />
          </div>
          <div className='landing-styler'>
            <div
              className='landing-shapes'
              role='radiogroup'
              aria-label='Petal shape'
            >
              {SHAPES.map(option => (
                <button
                  key={option.value}
                  type='button'
                  role='radio'
                  aria-checked={shape === option.value}
                  onClick={() => setShape(option.value)}
                  className='landing-shape'
                >
                  <PetalShapeIcon
                    shape={option.value}
                    style={option.value === 'circle' ? 'flat' : style}
                    size={wide ? 44 : 36}
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <div className='landing-styler-row'>
              <output className='landing-readout' aria-live='polite'>
                <span
                  className='landing-readout-swatch'
                  style={{ background: hex }}
                />
                {hex.toUpperCase()}
              </output>
              <label className='landing-switch'>
                <input
                  type='checkbox'
                  role='switch'
                  aria-checked={style === 'veined'}
                  checked={style === 'veined'}
                  disabled={shape === 'circle'}
                  onChange={e => setStyle(e.target.checked ? 'veined' : 'flat')}
                />
                <span className='landing-switch-track' aria-hidden='true' />
                <span>Veins</span>
              </label>
            </div>
            <p className='landing-styler-note landing-muted'>
              Every picker on this page follows your choice. In code, set{' '}
              <code>petalShape</code> and <code>petalStyle</code>.
            </p>
          </div>
        </div>
      </section>

      <section className='landing-section' aria-labelledby='layouts-heading'>
        <div className='landing-section-head'>
          <h2 id='layouts-heading' className='landing-display landing-h2'>
            Fits the way you use color
          </h2>
        </div>
        <div className='landing-demos'>
          <TextColorDemo petals={petals} />
          <ManyColorsDemo petals={petals} />
          <ChromeDemo petals={petals} />
        </div>
      </section>

      <section
        className='landing-section landing-install'
        aria-labelledby='install-heading'
      >
        <div className='landing-section-head'>
          <h2 id='install-heading' className='landing-display landing-h2'>
            Install
          </h2>
          <p className='landing-muted'>
            One package per framework, all built on the same dependency-free
            core.{' '}
            <Link href='/docs/introduction' className='landing-link'>
              Read the docs
            </Link>
          </p>
        </div>
        <div className='landing-install-body'>
          <FrameworkInstall />
        </div>
      </section>

      <footer className='landing-footer'>
        MIT {new Date().getFullYear()} © Blossom Color Picker
      </footer>
    </div>
  );
}

type PetalProps = { petalShape: PetalShape; petalStyle: PetalStyle };

function TextColorDemo({ petals }: { petals: PetalProps }) {
  const [hex, setHex] = useState('#6586E5');
  return (
    <div className='landing-demo'>
      <h3 className='landing-h3'>As a toolbar button</h3>
      <p className='landing-muted'>
        Closed, it is a single swatch. Open it to change the text color.
      </p>
      <div className='landing-toolbar'>
        <span aria-hidden='true' className='landing-toolbar-key font-bold'>
          B
        </span>
        <span aria-hidden='true' className='landing-toolbar-key italic'>
          I
        </span>
        <span aria-hidden='true' className='landing-toolbar-key underline'>
          U
        </span>
        <span className='landing-toolbar-rule' aria-hidden='true' />
        <BlossomColorPicker
          defaultValue={{
            hue: 225,
            saturation: 50,
            alpha: 100,
            layer: 'outer',
          }}
          onChange={color => setHex(color.hex)}
          coreSize={26}
          petalSize={30}
          sliderWidth={14}
          showCoreColor
          {...petals}
        />
      </div>
      <p className='landing-sample' style={{ color: hex }}>
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  );
}

const MAX_COLOR_COUNT = 42;

// Lightness / saturation of each ring, innermost first.
const RING_TONES: Record<number, { s: number; l: number }[]> = {
  1: [{ s: 76, l: 66 }],
  2: [
    { s: 88, l: 87 },
    { s: 74, l: 64 },
  ],
  3: [
    { s: 88, l: 90 },
    { s: 80, l: 77 },
    { s: 72, l: 63 },
  ],
  4: [
    { s: 90, l: 92 },
    { s: 85, l: 82 },
    { s: 78, l: 72 },
    { s: 70, l: 61 },
  ],
};

// A colour wheel laid out for the picker's own rings: hue follows the angle
// and each ring keeps one tone, getting lighter towards the centre.
function buildWheelPalette(count: number) {
  const ringSizes = organizeColorsIntoLayers(
    Array.from({ length: count }, (_, i) => ({ h: 0, s: 0, l: count - i }))
  ).map(ring => ring.length);
  const tones = RING_TONES[ringSizes.length];

  return ringSizes.flatMap((size, ringIdx) => {
    const step = 360 / size;
    const rotation = ringIdx === 0 ? 0 : 180 / ringSizes[ringIdx - 1];
    return Array.from({ length: size }, (_, i) => ({
      h: Math.round(i * step + (rotation % step)) % 360,
      ...tones[ringIdx],
    }));
  });
}

function ManyColorsDemo({ petals }: { petals: PetalProps }) {
  const [count, setCount] = useState(MAX_COLOR_COUNT);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    'left'
  );
  const palette = useMemo(() => buildWheelPalette(count), [count]);
  const change = (next: number) =>
    setCount(Math.max(1, Math.min(MAX_COLOR_COUNT, next)));

  return (
    <div className='landing-demo'>
      <h3 className='landing-h3'>With your own palette</h3>
      <p className='landing-muted'>
        Pass your own colors and they are sorted into rings by lightness. The
        arc can sit on any side.
      </p>
      <div className='landing-demo-stage'>
        <BlossomColorPicker
          colors={palette}
          sliderPosition={position}
          collapsible={false}
          adaptivePositioning={false}
          coreSize={28}
          petalSize={24}
          circularBarWidth={8}
          sliderWidth={12}
          sliderOffset={22}
          showCoreColor
          {...petals}
        />
      </div>
      <div className='landing-controls'>
        <div className='landing-stepper'>
          <span>Colors</span>
          <button
            type='button'
            onClick={() => change(count - 1)}
            aria-label='Fewer colors'
          >
            −
          </button>
          <output>{count}</output>
          <button
            type='button'
            onClick={() => change(count + 1)}
            aria-label='More colors'
          >
            +
          </button>
        </div>
        <div
          className='landing-segment'
          role='radiogroup'
          aria-label='Slider side'
        >
          {(['top', 'right', 'bottom', 'left'] as const).map(side => (
            <button
              key={side}
              type='button'
              role='radio'
              aria-checked={position === side}
              onClick={() => setPosition(side)}
            >
              {side[0].toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChromeDemo({ petals }: { petals: PetalProps }) {
  const [value, setValue] = useState<BlossomColorPickerValue>({
    hue: 210,
    saturation: 50,
    lightness: 50,
    alpha: 80,
    layer: 'outer',
  });
  return (
    <div className='landing-demo'>
      <h3 className='landing-h3'>With exact values</h3>
      <p className='landing-muted'>
        <code>ChromePicker</code> adds opacity and HEX, RGBA or HSLA inputs
        under the bloom.
      </p>
      <div className='landing-demo-stage'>
        <ChromePicker value={value} onChange={setValue} {...petals} />
      </div>
    </div>
  );
}
