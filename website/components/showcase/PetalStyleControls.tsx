'use client';

import type { PetalShape, PetalStyle } from '@dayflow/blossom-color-picker';
import {
  BlossomColorPicker,
  type BlossomColorPickerValue,
} from '@dayflow/blossom-color-picker-react';
import React, { useState } from 'react';

export const PETAL_SHAPES: PetalShape[] = [
  'circle',
  'sakura',
  'lotus',
  'pinwheel',
];

const segmentClass = (active: boolean, disabled = false) =>
  `flex-1 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-all ${
    disabled
      ? 'cursor-not-allowed text-gray-300 dark:text-slate-600'
      : active
        ? 'bg-white text-pink-600 shadow-sm dark:bg-slate-700 dark:text-pink-300'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
  }`;

/** Segmented controls for `petalShape` and `petalStyle`. */
export function PetalStyleControls({
  shape,
  style,
  onShapeChange,
  onStyleChange,
}: {
  shape: PetalShape;
  style: PetalStyle;
  onShapeChange: (shape: PetalShape) => void;
  onStyleChange: (style: PetalStyle) => void;
}) {
  // Veins are drawn on shaped petals only; circles stay flat.
  const veinsAvailable = shape !== 'circle';
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <span className='w-12 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400'>
          Shape
        </span>
        <div className='flex flex-1 rounded-xl bg-gray-100 p-1 dark:bg-slate-800'>
          {PETAL_SHAPES.map(value => (
            <button
              key={value}
              type='button'
              aria-pressed={shape === value}
              onClick={() => onShapeChange(value)}
              className={segmentClass(shape === value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <span className='w-12 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400'>
          Style
        </span>
        <div className='flex flex-1 rounded-xl bg-gray-100 p-1 dark:bg-slate-800'>
          {(['flat', 'veined'] as const).map(value => {
            const disabled = value === 'veined' && !veinsAvailable;
            return (
              <button
                key={value}
                type='button'
                disabled={disabled}
                aria-pressed={style === value}
                title={disabled ? 'Pick a petal shape to add veins' : undefined}
                onClick={() => onStyleChange(value)}
                className={segmentClass(style === value && !disabled, disabled)}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Self-contained playground for the docs: an open bloom plus the controls. */
export function PetalStylePlayground() {
  const [shape, setShape] = useState<PetalShape>('sakura');
  const [style, setStyle] = useState<PetalStyle>('veined');
  const [color, setColor] = useState<BlossomColorPickerValue>({
    hue: 330,
    saturation: 40,
    alpha: 100,
    layer: 'outer',
  });

  return (
    <div className='not-prose my-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900'>
      <div className='flex min-h-72 items-center justify-center'>
        <BlossomColorPicker
          value={color}
          onChange={setColor}
          collapsible={false}
          adaptivePositioning={false}
          coreSize={40}
          petalSize={40}
          showCoreColor
          hoverPreview
          petalShape={shape}
          petalStyle={style}
        />
      </div>
      <PetalStyleControls
        shape={shape}
        style={style}
        onShapeChange={setShape}
        onStyleChange={setStyle}
      />
      <pre className='mt-4 overflow-x-auto rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:bg-slate-800 dark:text-gray-200'>
        {`<BlossomColorPicker petalShape='${shape}'${
          shape !== 'circle' && style !== 'flat' ? ` petalStyle='${style}'` : ''
        } />`}
      </pre>
    </div>
  );
}
