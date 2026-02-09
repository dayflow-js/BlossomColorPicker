import type { SliderPosition } from './types';
import { BAR_WIDTH, SLIDER_OFFSET } from './constants';

export interface ComputeAdaptivePositionInput {
  elementRect: { left: number; top: number; width: number; height: number };
  containerSize: number;
  currentShiftOffset: { x: number; y: number };
  windowWidth: number;
  windowHeight: number;
  sliderPosition?: SliderPosition;
  adaptivePositioning: boolean;
}

export interface ComputeAdaptivePositionResult {
  effectivePosition: SliderPosition;
  shiftOffset: { x: number; y: number };
}

export function computeAdaptivePosition({
  elementRect,
  containerSize,
  currentShiftOffset,
  windowWidth,
  windowHeight,
  sliderPosition,
  adaptivePositioning,
}: ComputeAdaptivePositionInput): ComputeAdaptivePositionResult {
  const halfSize = containerSize / 2;
  const centerX = elementRect.left + elementRect.width / 2 - currentShiftOffset.x;
  const centerY = elementRect.top + elementRect.height / 2 - currentShiftOffset.y;

  let newShiftX = 0;
  let newShiftY = 0;

  if (adaptivePositioning) {
    const padding = 10;

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
  }

  let effectivePosition: SliderPosition = sliderPosition || 'right';

  if (!sliderPosition) {
    const spaceRight = windowWidth - (centerX + newShiftX + halfSize);
    const spaceLeft = centerX + newShiftX - halfSize;
    const spaceTop = centerY + newShiftY - halfSize;
    const spaceBottom = windowHeight - (centerY + newShiftY + halfSize);

    const threshold = SLIDER_OFFSET + BAR_WIDTH + 20;

    if (spaceRight < threshold && spaceLeft > spaceRight) {
      effectivePosition = 'left';
    } else if (spaceLeft < threshold && spaceRight > spaceLeft) {
      effectivePosition = 'right';
    } else if (spaceBottom < threshold && spaceTop > spaceBottom) {
      effectivePosition = 'top';
    } else if (spaceTop < threshold && spaceBottom > spaceTop) {
      effectivePosition = 'bottom';
    } else {
      effectivePosition = 'right';
    }
  }

  return {
    effectivePosition,
    shiftOffset: { x: newShiftX, y: newShiftY },
  };
}
