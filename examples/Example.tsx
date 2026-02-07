import React, { useMemo, useState } from 'react';
import { BlossomColorPicker } from '../src';
import { BlossomColorPickerValue } from '../src/types';

const colorPalette = [
  // --- Layer 1: Outermost (12 Colors) ---
  '#E67700',
  '#D9480F',
  '#C92A2A',
  '#A61E4D',
  '#862E9C',
  '#5F3DC4',
  '#364FC7',
  '#1864AB',
  '#0B7285',
  '#087F5B',
  '#2B8A3E',
  '#5C940D',
  // --- Layer 2: Middle-Outer (12 Colors) ---
  '#FCC419',
  '#FF922B',
  '#FF6B6B',
  '#F06595',
  '#CC5DE8',
  '#845EF7',
  '#5C7CFA',
  '#339AF0',
  '#22B8CF',
  '#20C997',
  '#51CF66',
  '#94D82D',
  // --- Layer 3: Middle-Inner (12 Colors) ---
  '#FFE066',
  '#FFC078',
  '#FFA8A8',
  '#FCC2D7',
  '#E599F7',
  '#B197FC',
  '#91A7FF',
  '#74C0FC',
  '#66D9E8',
  '#63E6BE',
  '#8CE99A',
  '#C0EB75',
  // --- Layer 4: Innermost (6 Colors) ---
  '#FFF9DB',
  '#FFF5F5',
  '#F3D9FA',
  '#E7F5FF',
  '#E6FCF5',
  '#F4FCE3',
];

const Example = () => {
  const [color, setColor] = useState<BlossomColorPickerValue>({
    hue: 92,
    saturation: 45,
    lightness: 69,
    alpha: 100,
    layer: 'outer',
  });

  const [activePos, setActivePos] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >('left');
  const [colorCount, setColorCount] = useState(42);
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);
  const [multiLayerColor, setMultiLayerColor] = useState<BlossomColorPickerValue>(
    {
      hue: 330,
      saturation: 10,
      lightness: 92,
      alpha: 100,
      layer: 'outer',
    }
  );

  // Slice palette based on count
  const dynamicPalette = useMemo(
    () => colorPalette.slice(0, colorCount),
    [colorCount]
  );

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-6 space-y-8 overflow-x-hidden">
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
            adaptivePositioning={false}
          />
        </div>
      </div>

      {/* Multi-Layer Example with Dynamic Controls */}

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-25">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800 tracking-tight">
                Multi-Layer Bloom
              </span>

              <span className="text-xs text-gray-400">
                {colorCount} colors auto-distributed
              </span>
              <span className="text-xs text-gray-400">
                Adaptive Positioning on mobile
              </span>
            </div>

            <BlossomColorPicker
              colors={dynamicPalette}
              value={multiLayerColor}
              onChange={(newColor) => setMultiLayerColor(newColor)}
              sliderPosition={activePos}
              initialExpanded={isPickerExpanded}
              coreSize={40}
              petalSize={32}
              onCollapse={() => setIsPickerExpanded(false)}
            />
          </div>

          <div className="space-y-4">
            {/* Color Count Control */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Color Count
              </span>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setColorCount((prev) => Math.max(1, prev - 1));

                      setIsPickerExpanded(true);
                    }}
                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-blue-600"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={colorCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);

                      if (!isNaN(val)) {
                        setColorCount(
                          Math.max(1, Math.min(colorPalette.length, val))
                        );

                        setIsPickerExpanded(true);
                      }
                    }}
                    className="w-12 bg-transparent text-center text-sm font-mono focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />

                  <button
                    onClick={() => {
                      setColorCount((prev) =>
                        Math.min(colorPalette.length, prev + 1)
                      );

                      setIsPickerExpanded(true);
                    }}
                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {/* Position Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => {
                    setActivePos(pos);

                    setIsPickerExpanded(true);
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${activePos === pos
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
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
  );
};

export default Example;
