import React, { useId, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { BLOOM_EASING, ARC_GRADIENT_STEPS } from '../constants';
import { sliderValueToLightness, hslToString, getVisualSaturation } from '../utils';

const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
};

const describeArc = (cx: number, cy: number, r: number, startAng: number, endAng: number) => {
  const start = polarToCartesian(cx, cy, r, startAng);
  const end = polarToCartesian(cx, cy, r, endAng);
  const largeArcFlag = Math.abs(endAng - startAng) > 180 ? '1' : '0';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

interface ArcSliderProps {
  value: number; // Slider value 0-100 (0=bright, 100=dark)
  hue: number;
  baseSaturation: number; // The base saturation from selected petal
  isExpanded: boolean;
  barRadius: number;
  barWidth: number;
  sliderOffset: number;
  animationDuration: number;
  onChange: (value: number) => void;
}

export const ArcSlider: React.FC<ArcSliderProps> = ({
  value,
  hue,
  baseSaturation,
  isExpanded,
  barRadius,
  barWidth,
  sliderOffset,
  animationDuration,
  onChange,
}) => {
  const sliderRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Arc slider on the RIGHT side of the bar
  const arcRadius = barRadius + sliderOffset;
  const startAngle = -30; // Top of arc (bright/white)
  const endAngle = 30;    // Bottom of arc (dark)
  const strokeWidth = barWidth;
  const handleRadius = barWidth / 2;

  const svgSize = (arcRadius + handleRadius + strokeWidth) * 2 + 20;
  const center = svgSize / 2;

  // Map slider value (0-100) to arc angle
  const handleAngle = startAngle + (value / 100) * (endAngle - startAngle);
  const handlePos = polarToCartesian(center, center, arcRadius, handleAngle);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const calculateValueFromMouse = useCallback((e: MouseEvent | TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Clamp angle to arc range
    if (angle < startAngle) angle = startAngle;
    if (angle > endAngle) angle = endAngle;

    // Convert angle to slider value (0-100)
    const newValue = ((angle - startAngle) / (endAngle - startAngle)) * 100;
    onChange(Math.round(Math.max(0, Math.min(100, newValue))));
  }, [onChange, startAngle, endAngle]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => calculateValueFromMouse(e);
    const handleTouchMove = (e: TouchEvent) => calculateValueFromMouse(e);
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, calculateValueFromMouse]);

  const handleLightness = sliderValueToLightness(value);
  const handleSaturation = getVisualSaturation(value, baseSaturation);
  const handleColor = hslToString(hue, handleSaturation, handleLightness);

  // Generate gradient colors (like BlossomColorPicker)
  // From white (top) to dark vivid color (bottom)
  const gradientColors = useMemo(() => {
    return Array.from({ length: ARC_GRADIENT_STEPS }, (_, i) => {
      const t = i / (ARC_GRADIENT_STEPS - 1); // 0 (top) to 1 (bottom)
      // t=0: white (value=0)
      // t=1: dark vivid (value=100)
      
      const saturation = getVisualSaturation(t * 100, baseSaturation);
      const lightness = 100 - t * 80; // 100 → 20
      return hslToString(hue, saturation, lightness);
    });
  }, [hue, baseSaturation]);

  const gradientId = `arc-gradient-${useId()}`;

  const gradientStart = polarToCartesian(center, center, arcRadius, startAngle);
  const gradientEnd = polarToCartesian(center, center, arcRadius, endAngle);

  return (
    <svg
      ref={sliderRef}
      width={svgSize}
      height={svgSize}
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        marginLeft: -svgSize / 2,
        marginTop: -svgSize / 2,
        opacity: isExpanded ? 1 : 0,
        transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
        transition: `opacity ${animationDuration}ms ${BLOOM_EASING} ${animationDuration / 2}ms, transform ${animationDuration}ms ${BLOOM_EASING} ${animationDuration / 2}ms`,
        zIndex: 50,
      }}
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse"
          x1={gradientStart.x}
          y1={gradientStart.y}
          x2={gradientEnd.x}
          y2={gradientEnd.y}
        >
          {gradientColors.map((color, i) => (
            <stop
              key={i}
              offset={`${(i / (ARC_GRADIENT_STEPS - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Background track */}
      <path
        d={describeArc(center, center, arcRadius, startAngle, endAngle)}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Gradient overlay */}
      <path
        d={describeArc(center, center, arcRadius, startAngle, endAngle)}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="pointer-events-auto"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          calculateValueFromMouse(e.nativeEvent as unknown as MouseEvent);
        }}
      />

      {/* Slider handle */}
      <circle
        cx={handlePos.x}
        cy={handlePos.y}
        r={handleRadius}
        fill={handleColor}
        stroke="white"
        strokeWidth={2}
        className="pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          transition: isDragging ? 'none' : `cx ${animationDuration / 3}ms ease, cy ${animationDuration / 3}ms ease`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
      />
    </svg>
  );
};
