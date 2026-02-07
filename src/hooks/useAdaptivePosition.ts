import { useState, useEffect, RefObject } from 'react';
import { BAR_WIDTH, SLIDER_OFFSET } from '../constants';

type SliderPosition = 'top' | 'bottom' | 'left' | 'right';

interface UseAdaptivePositionOptions {
  isExpanded: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  containerSize: number;
  sliderPosition?: SliderPosition;
  adaptivePositioning: boolean;
}

interface UseAdaptivePositionResult {
  effectivePosition: SliderPosition;
  shiftOffset: { x: number; y: number };
}

/**
 * Hook that handles viewport auto-positioning for the color picker.
 * Shifts the picker to stay within viewport bounds and determines
 * the best arc slider position based on available space.
 */
export function useAdaptivePosition({
  isExpanded,
  containerRef,
  containerSize,
  sliderPosition,
  adaptivePositioning,
}: UseAdaptivePositionOptions): UseAdaptivePositionResult {
  const [effectivePosition, setEffectivePosition] = useState<SliderPosition>(
    sliderPosition || 'right'
  );
  const [shiftOffset, setShiftOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isExpanded && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate Shift Offset
      const halfSize = containerSize / 2;
      const centerX = rect.left + rect.width / 2 - shiftOffset.x;
      const centerY = rect.top + rect.height / 2 - shiftOffset.y;

      let newShiftX = 0;
      let newShiftY = 0;

      // Only shift entire picker if adaptivePositioning is enabled
      if (adaptivePositioning) {
        const padding = 10; // Safety margin

        if (centerX + halfSize > windowWidth - padding) {
          newShiftX = windowWidth - padding - (centerX + halfSize);
        } else if (centerX - halfSize < padding) {
          newShiftX = padding - (centerX - halfSize);
        }

        if (centerY + halfSize > windowHeight - padding) {
          newShiftY = windowHeight - padding - (centerY + halfSize);
        } else if (centerY - halfSize < padding) {
          newShiftY = padding - (centerY - halfSize);
        }

        setShiftOffset({ x: newShiftX, y: newShiftY });
      } else {
        setShiftOffset({ x: 0, y: 0 });
      }

      // Determine ArcSlider position based on available space
      // This part runs regardless of adaptivePositioning (unless sliderPosition is forced)
      if (sliderPosition) {
        setEffectivePosition(sliderPosition);
        return;
      }

      const spaceRight = windowWidth - (centerX + newShiftX + halfSize);
      const spaceLeft = centerX + newShiftX - halfSize;
      const spaceTop = centerY + newShiftY - halfSize;
      const spaceBottom = windowHeight - (centerY + newShiftY + halfSize);

      const threshold = SLIDER_OFFSET + BAR_WIDTH + 20;

      if (spaceRight < threshold && spaceLeft > spaceRight) {
        setEffectivePosition('left');
      } else if (spaceLeft < threshold && spaceRight > spaceLeft) {
        setEffectivePosition('right');
      } else if (spaceBottom < threshold && spaceTop > spaceBottom) {
        setEffectivePosition('top');
      } else if (spaceTop < threshold && spaceBottom > spaceTop) {
        setEffectivePosition('bottom');
      } else {
        setEffectivePosition('right');
      }
    } else if (!isExpanded) {
      setShiftOffset({ x: 0, y: 0 });
    }
  }, [isExpanded, sliderPosition, containerSize, adaptivePositioning]);

  return { effectivePosition, shiftOffset };
}
