import React, { useMemo, useState } from 'react';
import { BlossomColorPicker } from '../src';
import { BlossomColorPickerValue } from '../src/types';

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

  // Generate 32 colors to trigger a balanced 3-layer bloom
  // Layer 0: ~4-5, Layer 1: ~6-10, Layer 2: rest
  const manyColors = useMemo(() => {
    const colors = [];
    for (let i = 0; i < 32; i++) {
      colors.push({
        h: (i * 360) / 12, // Cycle hues
        s: 70 + Math.random() * 20,
        l: 30 + (i * 60) / 32, // Vary lightness from 30 to 90
      });
    }
    return colors;
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 space-y-8">
      {/* Basic Example */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-800 tracking-tight">
              Standard
            </span>
            <span className="text-xs text-gray-400">Default 2-layer set</span>
          </div>
          <BlossomColorPicker 
            value={color}
            onChange={(newColor) => setColor(newColor)}
            coreSize={36}
            petalSize={36}
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
            <span className="text-xs text-gray-400">30 colors auto-distributed</span>
          </div>
          <BlossomColorPicker 
            value={multiLayerColor}
            colors={manyColors}
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
