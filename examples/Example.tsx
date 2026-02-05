import React, { useState } from 'react';
import { BlossomColorPicker } from '../src';
import { BlossomColorPickerValue } from '../src/types';

const colorPalette = [
  // --- Layer 1: Outermost (12 Colors) ---
  "#EFB920", "#E89826", "#E07222", "#D64B29",
  "#C92A2A", "#B82878", "#8A35A3", "#5F3DC4",
  "#364FC7", "#2B78A5", "#3F8F75", "#72A848",
  // --- Layer 2: Middle (12 Colors) ---
  "#FCD752", "#FDBA50", "#FA9C4D", "#F6774F",
  "#F15656", "#E756A6", "#B261CC", "#8966DF",
  "#6586E5", "#69B5E2", "#77C9A2", "#A4D483",
  // --- Layer 3: Innermost (8 Colors) ---
  "#FDF1B6", "#FCE0CA", "#F8C8D4", "#F4C2D7",
  "#DEC2E9", "#C6DEF5", "#B2DFDB", "#D2ECD0",
];

const Example = () => {
  const [color, setColor] = useState<BlossomColorPickerValue>({
    hue: 220,
    saturation: 70,
    lightness: 65,
    alpha: 100,
    layer: 'outer'
  });

  const [multiLayerColor, setMultiLayerColor] = useState<BlossomColorPickerValue>({
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 100,
    layer: 'outer'
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 space-y-8">
      {/* Basic Example */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-800 tracking-tight">
              Color
            </span>
          </div>
          <BlossomColorPicker
            value={color}
            onChange={(newColor) => setColor(newColor)}
            coreSize={36}
            petalSize={36}
            showCoreColor={false}
          />
        </div>
      </div>

      {/* 3-Layer Example */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-800 tracking-tight">
              3-Layer Bloom
            </span>
            <span className="text-xs text-gray-400">32 colors auto-distributed</span>
          </div>
          <BlossomColorPicker
            value={multiLayerColor}
            colors={colorPalette}
            onChange={(newColor) => setMultiLayerColor(newColor)}
            coreSize={36}
            petalSize={36}
          />
        </div>
      </div>
    </div>
  );
};

export default Example;
