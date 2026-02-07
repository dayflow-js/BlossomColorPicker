import React, { useState } from 'react';
import { BLOOM_EASING } from '../constants';
import { hslToString, hslaToString } from '../utils';

interface PetalProps {
  hue: number;
  saturation: number;
  lightness: number;
  index: number;
  totalPetals: number;
  isExpanded: boolean;
  petalSize: number;
  radius: number;
  animationDuration: number;
  staggerDelay: number;
  zIndex: number;
  rotationOffset?: number;
  alpha?: number;
  clip?: 'left' | 'right';
  isExternalHover?: boolean;
  pointerEvents?: 'auto' | 'none';
  hasShadow?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Petal: React.FC<PetalProps> = ({
  hue,
  saturation,
  lightness,
  index,
  totalPetals,
  isExpanded,
  petalSize,
  radius,
  animationDuration,
  staggerDelay,
  zIndex,
  alpha = 1,
  clip,
  isExternalHover,
  pointerEvents = 'auto',
  hasShadow = true,
  onClick,
  onMouseEnter,
  onMouseLeave,
  rotationOffset = 0,
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = isExternalHover ?? internalHover;

  const handleMouseEnter = () => {
    setInternalHover(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setInternalHover(false);
    onMouseLeave?.();
  };

  const angle = (index / totalPetals) * 360 - 90 + rotationOffset; // Start from top (12 o'clock)
  const radian = (angle * Math.PI) / 180;
  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;

  const color =
    alpha < 1
      ? hslaToString(hue, saturation, lightness, alpha * 100)
      : hslToString(hue, saturation, lightness);

  const scale = isHovered ? 1.1 : 1;

  const clipStyle =
    clip === 'left'
      ? { clipPath: 'polygon(0% -10%, 60% -10%, 60% 110%, 0% 110%)' }
      : clip === 'right'
        ? { clipPath: 'polygon(40% -10%, 100% -10%, 100% 110%, 40% 110%)' }
        : {};

  const isInvisible = alpha === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`absolute rounded-full focus:outline-none ${isInvisible ? '' : 'focus:ring-2 focus:ring-white/50'}`}
      style={{
        width: petalSize,
        height: petalSize,
        backgroundColor: color,
        transform: isExpanded
          ? `translate(${x}px, ${y}px) scale(${scale})`
          : 'translate(0, 0) scale(0)',
        opacity: isExpanded ? 1 : 0,
        filter: isHovered && !isInvisible ? 'brightness(1.1)' : 'brightness(1)',
        transition: `transform ${animationDuration}ms ${BLOOM_EASING} ${isExpanded && !isHovered ? staggerDelay : 0}ms,
                     opacity ${animationDuration}ms ${BLOOM_EASING} ${isExpanded && !isHovered ? staggerDelay : 0}ms,
                     background-color 200ms ease,
                     box-shadow 200ms ease,
                     filter 200ms ease`,
        boxShadow:
          hasShadow && !isInvisible
            ? isHovered
              ? '0 4px 12px rgba(0,0,0,0.25)'
              : '0 2px 6px rgba(0,0,0,0.15)'
            : 'none',
        left: '50%',
        top: '50%',
        marginLeft: -petalSize / 2,
        marginTop: -petalSize / 2,
        zIndex,
        pointerEvents,
        ...clipStyle,
      }}
      aria-label={`Select color hue ${hue}`}
      tabIndex={isExpanded ? 0 : -1}
    />
  );
};
