import type { PetalShape, PetalStyle } from '@dayflow/blossom-color-picker';
import React from 'react';

// Same outlines the picker draws (packages/core/src/renderers/PetalRenderer.ts),
// in a 100x100 box with the tip at the top.
const PATHS: Record<Exclude<PetalShape, 'circle'>, string> = {
  sakura:
    'M50 100C30 100 6 80 4 52C2 26 16 4 34 2C42 1 46 8 50 14C54 8 58 1 66 2C84 4 98 26 96 52C94 80 70 100 50 100Z',
  lotus:
    'M50 0C58 14 96 34 96 62C96 86 76 100 50 100C24 100 4 86 4 62C4 34 42 14 50 0Z',
  pinwheel:
    'M50 100C26 100 6 82 6 56C6 30 22 8 46 4C62 2 80 4 94 0C88 14 96 30 94 52C92 80 74 100 50 100Z',
};

const VEINS: Record<Exclude<PetalShape, 'circle'>, string> = {
  sakura: 'M50 96Q51 55 50 16M50 66Q38 50 27 36M50 66Q62 50 73 36',
  lotus: 'M50 96Q50 50 50 8M50 66Q38 50 27 36M50 66Q62 50 73 36',
  pinwheel: 'M50 96Q58 50 88 6M53 68Q44 50 34 36M54 64Q68 50 80 38',
};

const HUES = [330, 20, 45, 150, 200, 265];

/** A six-petal flower drawn with one of the picker's petal shapes. */
export function PetalShapeIcon({
  shape,
  style,
  size = 64,
}: {
  shape: PetalShape;
  style: PetalStyle;
  size?: number;
}) {
  return (
    <svg
      viewBox='-56 -56 112 112'
      width={size}
      height={size}
      aria-hidden='true'
    >
      {HUES.map((hue, i) => {
        const fill = `hsl(${hue} 75% 66%)`;
        const turn = i * 60;
        return (
          <g key={hue} transform={`rotate(${turn}) translate(0 -32)`}>
            {shape === 'circle' ? (
              <circle r='20' fill={fill} />
            ) : (
              <g transform='translate(-21 -21) scale(0.42)'>
                <path d={PATHS[shape]} fill={fill} />
                {style === 'veined' && (
                  <path
                    d={VEINS[shape]}
                    fill='none'
                    stroke='#fff'
                    strokeOpacity='0.6'
                    strokeWidth='3'
                    strokeLinecap='round'
                  />
                )}
              </g>
            )}
          </g>
        );
      })}
      <circle r='14' fill='var(--landing-surface)' />
    </svg>
  );
}
