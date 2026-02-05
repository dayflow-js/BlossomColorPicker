import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { BlossomColorPickerValue, BlossomColorPickerProps } from './types';
import {
  OUTER_COLORS,
  INNER_COLORS,
  BLOOM_CUBIC_BEZIER,
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
} from './utils';
import { Petal, ColorBar, ArcSlider } from './components';

export const BlossomColorPicker: React.FC<BlossomColorPickerProps> = ({
  value,
  defaultValue = {
    hue: 220,
    saturation: 70,
    alpha: 50,
    layer: 'outer',
  },
  colors,
  innerColors: propInnerColors,
  outerColors: propOuterColors,
  onChange,
  onCollapse,
  disabled = false,
  openOnHover = false,
  initialExpanded = false,
  animationDuration = 300,
  showAlphaSlider = true,
  coreSize = 28,
  petalSize = 32,
  className = '',
}) => {
  // Determine layers
  const layers = useMemo(() => {
    if (colors && colors.length > 0) {
      // Automatic layering
      return organizeColorsIntoLayers(colors, coreSize, petalSize, BAR_GAP);
    } else {
      // Legacy or Default 2-layer mode
      // Layer 0 is Inner (closest to core), Layer 1 is Outer
      const inner = propInnerColors || INNER_COLORS;
      const outer = propOuterColors || OUTER_COLORS;
      return [inner, outer];
    }
  }, [colors, propInnerColors, propOuterColors, coreSize, petalSize]);

  // Flatten colors for search/indexing
  const allColors = useMemo(() => layers.flat(), [layers]);

  const [internalValue, setInternalValue] = useState<BlossomColorPickerValue>(
    value ?? defaultValue
  );

  const currentValue = value ?? internalValue;

  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredPetal, setHoveredPetal] = useState<{
    layer: number;
    index: number;
  } | null>(null);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate max container size based on the outermost layer
  const baseLayoutRadius = coreSize / 2 + petalSize * 0.38 - 2;
  const layoutStep = petalSize * 0.55;
  const maxLayerRadius = baseLayoutRadius + (layers.length - 1) * layoutStep;

  // The bar is drawn outside the last layer
  const barRadius = maxLayerRadius + petalSize / 2 + BAR_GAP;

  const containerSize = showAlphaSlider
    ? (barRadius + SLIDER_OFFSET + BAR_WIDTH / 2) * 2 + 12
    : (barRadius + BAR_WIDTH / 2) * 2 + 12;

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
      const selectedPetal = allColors.find(c => c.h === currentValue.hue);
      const pBaseSaturation = selectedPetal?.s ?? 70;
      // Visual saturation logic: only desaturate if very bright (slider < 10)
      const visualSaturation =
        sliderValue < 10
          ? (sliderValue / 10) * pBaseSaturation
          : pBaseSaturation;

      onCollapse(
        createColorOutput(
          currentValue.hue,
          sliderValue,
          visualSaturation,
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
    setIsExpanded(prev => !prev);
  }, [disabled]);

  // Get base saturation from selected petal
  const baseSaturation = useMemo(() => {
    if (currentValue.originalSaturation !== undefined) {
      return currentValue.originalSaturation;
    }
    const selectedColor = allColors.find(c => c.h === currentValue.hue);
    return selectedColor?.s ?? 70;
  }, [currentValue.hue, currentValue.originalSaturation, allColors]);

  // Handle arc slider change
  const handleSliderChange = useCallback(
    (sliderValue: number) => {
      const lightness = sliderValueToLightness(sliderValue);
      // Use consistent saturation logic: keep vivid unless near white
      const visualSaturation =
        sliderValue < 10 ? (sliderValue / 10) * baseSaturation : baseSaturation;

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
    if (isExpanded) return '#FFFFFF';
    const lightness =
      currentValue.lightness ?? sliderValueToLightness(currentValue.saturation);
    const saturation = currentValue.originalSaturation ?? baseSaturation;
    return hslToHex(currentValue.hue, saturation, lightness);
  }, [
    isExpanded,
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
          transform: 'translate(-50%, -50%)',
          transition: `width ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}, height ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}`,
          zIndex: isExpanded ? 50 : 0,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background fill */}
        <div
          className="absolute rounded-full pointer-events-none bg-white dark:bg-slate-900"
          style={{
            width: (barRadius + BAR_WIDTH / 2) * 2,
            height: (barRadius + BAR_WIDTH / 2) * 2,
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'scale(1)' : 'scale(0.8)',
            transition: `opacity ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}, transform ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}`,
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
              transition: 'background-color 300ms ease',
            }}
          />
        </div>

        {/* Color Bar */}
        <ColorBar
          hue={currentValue.hue}
          saturation={
            currentValue.saturation < 10
              ? (currentValue.saturation / 10) * baseSaturation
              : baseSaturation
          }
          lightness={currentLightness}
          alpha={currentValue.alpha}
          radius={barRadius}
          barWidth={BAR_WIDTH}
          isExpanded={isExpanded}
          animationDuration={animationDuration}
        />

        {/* Dynamic Layers */}
        {layers.map((layerColors, layerIdx) => {
          const radius = baseLayoutRadius + layerIdx * layoutStep;
          const previousItemsCount = layers
            .slice(0, layerIdx)
            .reduce((sum, layer) => sum + layer.length, 0);

          const totalPetals = layerColors.length;
          // Identify the bottom index (6 o'clock)
          const bottomIndex = Math.floor(totalPetals / 2);

          // Helper to get Z-Index for the "Fan" loop trick
          // Goal: Continuous overlap (N covers N+1)
          // Sequence: BottomRight(Top) -> Next -> ... -> BottomLeft(Bottom)
          const getZIndex = (
            index: number,
            isBottomLeft: boolean = false,
            isBottomRight: boolean = false
          ) => {
            const baseZ = (layers.length - layerIdx) * 100; // Base layer Z
            const maxLocalZ = totalPetals + 10;

            if (index === bottomIndex) {
              if (isBottomRight) return baseZ + maxLocalZ; // Top of stack (6 o'clock Right)
              if (isBottomLeft) return baseZ; // Bottom of stack (6 o'clock Left)
              return baseZ;
            }

            // Steps from Bottom (clockwise)
            // 6->0, 7->1, ..., 0->6, 1->7, ..., 5->11
            // By using +steps, Z increases clockwise, creating counter-clockwise overlap (1 > 0 > 11)
            let steps = (index - bottomIndex + totalPetals) % totalPetals;

            return baseZ + steps;
          };

          return layerColors.map((color, index) => {
            const isSelected = currentValue.hue === color.h;

            const isHovered =
              hoveredPetal?.layer === layerIdx && hoveredPetal?.index === index;

            const baseZ = (layers.length - layerIdx) * 100;

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
                    zIndex={getZIndex(index, true, false)}
                    clip="left"
                    isExternalHover={isHovered}
                    pointerEvents="none"
                    hasShadow={false}
                    alpha={1}
                    onClick={() => { }}
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
                    zIndex={getZIndex(index, false, true)}
                    clip="right"
                    isExternalHover={isHovered}
                    pointerEvents="none"
                    hasShadow={false}
                    alpha={1}
                    onClick={() => { }}
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
                zIndex={getZIndex(index)}
                isExternalHover={isHovered}
                hasShadow={false}
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
            transition: `transform ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}, box-shadow ${animationDuration}ms ${BLOOM_CUBIC_BEZIER}`,
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
