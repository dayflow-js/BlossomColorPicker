import React from 'react';
import { BLOOM_CUBIC_BEZIER } from '../constants';
import { hslaToString } from '../utils';

interface ColorBarProps {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  radius: number;
  barWidth: number;
  isExpanded: boolean;
  animationDuration: number;
}

export const ColorBar: React.FC<ColorBarProps> = ({
  hue,
  saturation,
  lightness,
  alpha,
  radius,
  barWidth,
  isExpanded,
  animationDuration,
}) => {
  const size = (radius + barWidth / 2) * 2 + 4;
  const color = hslaToString(hue, saturation, lightness, alpha);

  return (
    <svg
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity: isExpanded ? 1 : 0,
        transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
        transition: `opacity ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}, transform ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}`,
        zIndex: 5,
      }}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={barWidth}
      />
      {/* Color overlay */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={barWidth}
      />
    </svg>
  );
};
