'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { BlossomColorPickerValue, BlossomColorPickerProps } from './types';
import {
  DEFAULT_COLORS,
  BLOOM_EASING,
  HOVER_DELAY,
  PETAL_STAGGER,
  BAR_GAP,
  BAR_WIDTH,
  SLIDER_OFFSET,
} from './constants';
import {
  lightnessToSliderValue,
  sliderValueToLightness,
  hslToHex,
  hslaToString,
  createColorOutput,
  organizeColorsIntoLayers,
  getVisualSaturation,
  parseColor,
} from './utils';
import {
  calculateLayerRadii,
  calculateLayerRotations,
  calculateBarRadius,
  calculateContainerSize,
  getPetalZIndex,
} from './layout';
import { useAdaptivePosition } from './hooks/useAdaptivePosition';
import { Petal, ColorBar, ArcSlider } from './components';

export const BlossomColorPicker: React.FC<BlossomColorPickerProps> = ({
  value,
  defaultValue = {
    hue: 330,
    saturation: 70,
    alpha: 50,
    layer: 'outer',
  },
  colors,
  onChange,
  onCollapse,
  disabled = false,
  openOnHover = false,
  initialExpanded = false,
  animationDuration = 300,
  showAlphaSlider = true,
  coreSize = 32,
  petalSize = 32,
  showCoreColor = true,
  sliderPosition,
  adaptivePositioning = true,
  className = '',
}) => {
  // Normalize user input (hex/rgb/hsl strings or HSL objects) → { h, s, l }[]
  const normalizedColors = useMemo(
    () =>
      colors && colors.length > 0 ? colors.map(parseColor) : DEFAULT_COLORS,
    [colors]
  );

  // Determine layers
  const layers = useMemo(
    () => organizeColorsIntoLayers(normalizedColors),
    [normalizedColors]
  );

  // Flatten colors for search/indexing
  const allColors = useMemo(() => layers.flat(), [layers]);

  // Pre-compute prefix sums for petal stagger offsets
  const layerPrefixCounts = useMemo(() => {
    const counts: number[] = [0];
    for (let i = 1; i < layers.length; i++) {
      counts.push(counts[i - 1] + layers[i - 1].length);
    }
    return counts;
  }, [layers]);

  const [internalValue, setInternalValue] = useState<BlossomColorPickerValue>(
    value ?? defaultValue
  );

  const currentValue = value ?? internalValue;

  const [isHovering, setIsHovering] = useState(false);

  const [hoveredPetal, setHoveredPetal] = useState<{
    layer: number;
    index: number;
  } | null>(null);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate individual layer radii using Geometric Nesting with aggressive packing
  const layerRadii = useMemo(
    () => calculateLayerRadii(layers, coreSize, petalSize),
    [layers, coreSize, petalSize]
  );

  // Calculate rotation offsets to stagger layers
  const layerRotations = useMemo(
    () => calculateLayerRotations(layers),
    [layers]
  );

  // The bar is drawn outside the last layer
  const barRadius = calculateBarRadius(layerRadii, petalSize, coreSize, BAR_GAP);

  const containerSize = calculateContainerSize(
    barRadius,
    BAR_WIDTH,
    showAlphaSlider,
    SLIDER_OFFSET
  );

  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle auto-positioning and viewport shifting
  const { effectivePosition, shiftOffset } = useAdaptivePosition({
    isExpanded,
    containerRef,
    containerSize,
    sliderPosition,
    adaptivePositioning,
  });

  const prevExpandedRef = useRef(isExpanded);

  useEffect(() => {
    if (value) {
      setInternalValue(value);
    }
  }, [value]);

  // Call onCollapse when picker collapses
  useEffect(() => {
    if (prevExpandedRef.current && !isExpanded && onCollapse) {
      const sliderValue = currentValue.saturation;
      const lightness = sliderValueToLightness(sliderValue);
      const selectedPetal = allColors.find((c) => c.h === currentValue.hue);
      const pBaseSaturation = selectedPetal?.s ?? 70;
      const visualSaturation = getVisualSaturation(
        sliderValue,
        pBaseSaturation
      );

      onCollapse(
        createColorOutput(
          currentValue.hue,
          sliderValue,
          visualSaturation,
          pBaseSaturation,
          lightness,
          currentValue.alpha,
          currentValue.layer
        )
      );
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, currentValue, onCollapse, allColors]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || !openOnHover) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, HOVER_DELAY);
  }, [disabled, openOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovering(false);

    if (openOnHover) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 200);
    }
  }, [openOnHover]);

  const handleCoreClick = useCallback(() => {
    if (disabled) return;
    setIsExpanded((prev) => !prev);
  }, [disabled]);

  // Get base saturation from selected petal
  const baseSaturation = useMemo(() => {
    if (currentValue.originalSaturation !== undefined) {
      return currentValue.originalSaturation;
    }
    const selectedColor = allColors.find((c) => c.h === currentValue.hue);
    return selectedColor?.s ?? 70;
  }, [currentValue.hue, currentValue.originalSaturation, allColors]);

  // Handle arc slider change
  const handleSliderChange = useCallback(
    (sliderValue: number) => {
      const lightness = sliderValueToLightness(sliderValue);
      const visualSaturation = getVisualSaturation(sliderValue, baseSaturation);

      const newValue = {
        ...currentValue,
        saturation: sliderValue,
        lightness,
        originalSaturation: baseSaturation,
      };
      setInternalValue(newValue);

      onChange?.(
        createColorOutput(
          currentValue.hue,
          sliderValue,
          visualSaturation,
          baseSaturation,
          lightness,
          currentValue.alpha,
          currentValue.layer
        )
      );
    },
    [currentValue, baseSaturation, onChange]
  );

  // Handle petal click
  const handlePetalClick = useCallback(
    (color: { h: number; s: number; l: number }, layerIdx: number) => {
      const sliderValue = lightnessToSliderValue(color.l);
      const layerStr: 'inner' | 'outer' = layerIdx === 0 ? 'inner' : 'outer';
      // When selecting a petal, we want its exact saturation initially.
      const visualSaturation = color.s;

      const newValue = {
        ...currentValue,
        hue: color.h,
        saturation: sliderValue,
        lightness: color.l,
        originalSaturation: color.s,
        layer: layerStr,
      };
      setInternalValue(newValue);
      onChange?.(
        createColorOutput(
          color.h,
          sliderValue,
          visualSaturation,
          color.s,
          color.l,
          currentValue.alpha,
          layerStr
        )
      );
    },
    [currentValue, onChange]
  );

  // Current lightness
  const currentLightness =
    currentValue.lightness ?? (currentValue.layer === 'inner' ? 85 : 65);

  // Core circle color - White when expanded, selected color when collapsed
  const coreColor = useMemo(() => {
    if (isExpanded && !showCoreColor) return '#FFFFFF';
    const lightness =
      currentValue.lightness ?? sliderValueToLightness(currentValue.saturation);
    const saturation = currentValue.originalSaturation ?? baseSaturation;
    return hslToHex(currentValue.hue, saturation, lightness);
  }, [
    isExpanded,
    showCoreColor,
    currentValue.hue,
    currentValue.lightness,
    currentValue.originalSaturation,
    currentValue.saturation,
    baseSaturation,
  ]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: coreSize,
        height: coreSize,
      }}
      role="group"
      aria-label="Color picker"
    >
      <div
        ref={containerRef}
        className="absolute flex items-center justify-center"
        style={{
          width: isExpanded ? containerSize : coreSize,
          height: isExpanded ? containerSize : coreSize,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${shiftOffset.x}px), calc(-50% + ${shiftOffset.y}px))`,
          transition: `width ${animationDuration}ms ${BLOOM_EASING}, height ${animationDuration}ms ${BLOOM_EASING}, transform ${animationDuration}ms ${BLOOM_EASING}`,
          zIndex: isExpanded ? 50 : 0,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background fill */}
        <div
          className="absolute rounded-full pointer-events-none bg-white"
          style={{
            width: (barRadius + BAR_WIDTH / 2) * 2,
            height: (barRadius + BAR_WIDTH / 2) * 2,
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
            transition: `opacity ${animationDuration}ms ${BLOOM_EASING}, transform ${animationDuration}ms ${BLOOM_EASING}`,
            zIndex: 0,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: hslaToString(
                currentValue.hue,
                currentValue.saturation,
                currentLightness,
                15
              ),
              transition: `background-color ${animationDuration}ms ease`,
            }}
          />
        </div>

        {/* Color Bar */}
        <ColorBar
          hue={currentValue.hue}
          saturation={getVisualSaturation(
            currentValue.saturation,
            baseSaturation
          )}
          lightness={currentLightness}
          alpha={currentValue.alpha}
          radius={barRadius}
          barWidth={BAR_WIDTH}
          isExpanded={isExpanded}
          animationDuration={animationDuration}
        />

        {/* Dynamic Layers */}
        {layers.map((layerColors, layerIdx) => {
          const radius = layerRadii[layerIdx];
          const rotation = layerRotations[layerIdx];
          const previousItemsCount = layerPrefixCounts[layerIdx];

          const totalPetals = layerColors.length;
          // Identify the bottom index (6 o'clock)
          const bottomIndex = Math.floor(totalPetals / 2);
          const totalLayers = layers.length;
          const baseZ = (totalLayers - layerIdx) * 100;

          return layerColors.map((color, index) => {
            const isHovered =
              hoveredPetal?.layer === layerIdx && hoveredPetal?.index === index;

            // Special handling for the bottom petal to create the loop trick
            if (index === bottomIndex) {
              return (
                <React.Fragment key={`layer-${layerIdx}-${color.h}-split`}>
                  {/* Visual Left Half (Lowest Z) */}
                  <Petal
                    hue={color.h}
                    saturation={color.s}
                    lightness={color.l}
                    index={index}
                    totalPetals={totalPetals}
                    isExpanded={isExpanded}
                    petalSize={petalSize}
                    radius={radius}
                    animationDuration={animationDuration}
                    staggerDelay={
                      previousItemsCount * PETAL_STAGGER + index * PETAL_STAGGER
                    }
                    zIndex={getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers, true, false)}
                    clip="left"
                    isExternalHover={isHovered}
                    pointerEvents="none"
                    hasShadow={false}
                    rotationOffset={rotation}
                    alpha={1}
                  />
                  {/* Visual Right Half (Highest Z) */}
                  <Petal
                    hue={color.h}
                    saturation={color.s}
                    lightness={color.l}
                    index={index}
                    totalPetals={totalPetals}
                    isExpanded={isExpanded}
                    petalSize={petalSize}
                    radius={radius}
                    animationDuration={animationDuration}
                    staggerDelay={
                      previousItemsCount * PETAL_STAGGER + index * PETAL_STAGGER
                    }
                    zIndex={getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers, false, true)}
                    clip="right"
                    isExternalHover={isHovered}
                    pointerEvents="none"
                    hasShadow={false}
                    rotationOffset={rotation}
                    alpha={1}
                  />
                  {/* Interaction Layer (Top of this petal's stack, Transparent) */}
                  <Petal
                    hue={color.h}
                    saturation={color.s}
                    lightness={color.l}
                    index={index}
                    totalPetals={totalPetals}
                    isExpanded={isExpanded}
                    petalSize={petalSize}
                    radius={radius}
                    animationDuration={animationDuration}
                    staggerDelay={
                      previousItemsCount * PETAL_STAGGER + index * PETAL_STAGGER
                    }
                    zIndex={baseZ + totalPetals + 20} // Interaction needs to be on top of the local stack
                    alpha={0} // Invisible but interactive
                    hasShadow={false}
                    rotationOffset={rotation}
                    onClick={() => handlePetalClick(color, layerIdx)}
                    onMouseEnter={() =>
                      setHoveredPetal({ layer: layerIdx, index })
                    }
                    onMouseLeave={() => setHoveredPetal(null)}
                  />
                </React.Fragment>
              );
            }
            // Normal rendering (Full petal)
            return (
              <Petal
                key={`layer-${layerIdx}-${color.h}-${index}`}
                hue={color.h}
                saturation={color.s}
                lightness={color.l}
                index={index}
                totalPetals={totalPetals}
                isExpanded={isExpanded}
                petalSize={petalSize}
                radius={radius}
                animationDuration={animationDuration}
                staggerDelay={
                  previousItemsCount * PETAL_STAGGER + index * PETAL_STAGGER
                }
                zIndex={getPetalZIndex(index, bottomIndex, totalPetals, layerIdx, totalLayers)}
                isExternalHover={isHovered}
                hasShadow={false}
                rotationOffset={rotation}
                onClick={() => handlePetalClick(color, layerIdx)}
                onMouseEnter={() => setHoveredPetal({ layer: layerIdx, index })}
                onMouseLeave={() => setHoveredPetal(null)}
              />
            );
          });
        })}

        {/* Arc Slider */}
        {showAlphaSlider && (
          <ArcSlider
            value={currentValue.saturation}
            hue={currentValue.hue}
            baseSaturation={baseSaturation}
            isExpanded={isExpanded}
            barRadius={barRadius}
            barWidth={BAR_WIDTH}
            sliderOffset={SLIDER_OFFSET}
            animationDuration={animationDuration}
            onChange={handleSliderChange}
            position={effectivePosition}
          />
        )}

        {/* Core circle */}
        <button
          type="button"
          onClick={handleCoreClick}
          disabled={disabled}
          className="relative rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: coreSize,
            height: coreSize,
            backgroundColor: coreColor,
            transform: isExpanded
              ? 'scale(1)'
              : isHovering
                ? 'scale(1.05)'
                : 'scale(1)',
            boxShadow: isExpanded
              ? '0 0 0 2px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.15)',
            transition: `transform ${animationDuration}ms ${BLOOM_EASING}, box-shadow ${animationDuration}ms ${BLOOM_EASING}`,
            zIndex: 1000,
          }}
          aria-label={`Current color: hue ${currentValue.hue}, alpha ${currentValue.alpha}%`}
          aria-expanded={isExpanded}
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export default BlossomColorPicker;
