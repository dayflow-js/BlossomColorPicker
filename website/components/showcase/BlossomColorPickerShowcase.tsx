'use client';

import React, { useMemo, useState } from 'react';
import { BlossomColorPicker, ChromePicker, type BlossomColorPickerValue, hslToHex, sliderValueToLightness } from '@dayflow/blossom-color-picker-react';

const colorPalette = [
  // --- Layer 1: Outermost (12 Colors) ---
  '#E67700', '#D9480F', '#C92A2A', '#A61E4D', '#862E9C', '#5F3DC4',
  '#364FC7', '#1864AB', '#0B7285', '#087F5B', '#2B8A3E', '#5C940D',
  // --- Layer 2: Middle-Outer (12 Colors) ---
  '#FCC419', '#FF922B', '#FF6B6B', '#F06595', '#CC5DE8', '#845EF7',
  '#5C7CFA', '#339AF0', '#22B8CF', '#20C997', '#51CF66', '#94D82D',
  // --- Layer 3: Middle-Inner (12 Colors) ---
  '#FFE066', '#FFC078', '#FFA8A8', '#FCC2D7', '#E599F7', '#B197FC',
  '#91A7FF', '#74C0FC', '#66D9E8', '#63E6BE', '#8CE99A', '#C0EB75',
  // --- Layer 4: Innermost (6 Colors) ---
  '#FFF9DB', '#FFF5F5', '#F3D9FA', '#E7F5FF', '#E6FCF5', '#F4FCE3',
];

export function BlossomColorPickerShowcase() {
  const [basicColor, setBasicColor] = useState<BlossomColorPickerValue>({
    hue: 92,
    saturation: 45,
    lightness: 69,
    alpha: 100,
    layer: 'outer',
  });

  const [chromeColor, setChromeColor] = useState<BlossomColorPickerValue>({
    hue: 210,
    saturation: 50,
    lightness: 50,
    alpha: 80,
    layer: 'outer',
  });

  const [activePos, setActivePos] = useState<'top' | 'bottom' | 'left' | 'right'>('left');
  const [colorCount, setColorCount] = useState(42);
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);
  const [multiLayerColor, setMultiLayerColor] = useState<BlossomColorPickerValue>({
    hue: 330,
    saturation: 10,
    lightness: 92,
    alpha: 100,
    layer: 'outer',
  });

  const dynamicPalette = useMemo(() => colorPalette.slice(0, colorCount), [colorCount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl items-start py-8 overflow-x-hidden">
      <div className="flex flex-col gap-8">
        {/* Basic Bloom */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl/20 border border-gray-100 dark:border-slate-800 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                Basic
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Standard interactive blossom
              </span>
            </div>
            <BlossomColorPicker
              value={basicColor}
              onChange={(newColor) => setBasicColor(newColor)}
              coreSize={44}
              petalSize={44}
              sliderWidth={24}
              adaptivePositioning={false}
            />
          </div>
        </div>

        {/* Multi-Layer Example */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl/20 border border-gray-100 dark:border-slate-800 transition-all">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-24">
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                  Multi-Layer
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {colorCount} colors auto-distributed
                </span>
              </div>

              <div className="relative">
                <BlossomColorPicker
                  colors={dynamicPalette}
                  value={multiLayerColor}
                  onChange={(newColor) => setMultiLayerColor(newColor)}
                  sliderPosition={activePos}
                  initialExpanded={isPickerExpanded}
                  coreSize={48}
                  petalSize={36}
                  sliderWidth={18}
                  onCollapse={() => setIsPickerExpanded(false)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-slate-800">
              {/* Color Count Control */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Color Count
                </span>
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setColorCount((prev) => Math.max(1, prev - 1));
                      setIsPickerExpanded(true);
                    }}
                    className="px-3 py-1 text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={colorCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setColorCount(Math.max(1, Math.min(colorPalette.length, val)));
                        setIsPickerExpanded(true);
                      }
                    }}
                    className="w-12 bg-transparent text-center text-sm font-mono dark:text-gray-200 focus:outline-none appearance-none"
                  />
                  <button
                    onClick={() => {
                      setColorCount((prev) => Math.min(colorPalette.length, prev + 1));
                      setIsPickerExpanded(true);
                    }}
                    className="px-3 py-1 text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Position Tabs */}
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      setActivePos(pos);
                      setIsPickerExpanded(true);
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activePos === pos
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                  >
                    {pos.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* ChromePicker Example */}
        <div className="bg-white dark:bg-slate-900 px-8 py-11 rounded-2xl shadow-xl dark:shadow-2xl/20 border border-gray-100 dark:border-slate-800 transition-all flex flex-col h-full">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight mb-8">
            Chrome Picker
          </span>
          <div className="flex flex-1 items-center justify-center">
            <ChromePicker
              value={chromeColor}
              onChange={(newColor) => setChromeColor(newColor)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
