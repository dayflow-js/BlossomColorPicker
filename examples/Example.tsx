import React, { useMemo, useState, useEffect } from 'react';
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

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-4.51-2-7-2" /></svg>
);

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
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-16 overflow-x-hidden transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-slate-800 px-4">
        <div className="relative h-full flex items-center justify-between w-full">
          {/* Left side icon */}
          <div className="flex items-center">
            <span className="text-2xl" role="img" aria-label="blossom">
              🌸
            </span>
            <span className="text-lg md:text-xl font-bold pl-4 whitespace-nowrap">
              Blossom Color Picker
            </span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <a
              href="https://github.com/dayflow-js/BlossomColorPicker"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      </header>

      {/* Basic Example */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl/20 w-full max-w-sm border border-gray-100 dark:border-slate-800 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
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

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl/20 w-full max-w-sm border border-gray-100 dark:border-slate-800 transition-all">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-24">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                Multi-Layer Bloom
              </span>

              <span className="text-xs text-gray-400 dark:text-gray-500">
                {colorCount} colors auto-distributed
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
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
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Color Count
              </span>

              <div className="flex items-center space-x-2">
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
                        setColorCount(
                          Math.max(1, Math.min(colorPalette.length, val))
                        );

                        setIsPickerExpanded(true);
                      }
                    }}
                    className="w-12 bg-transparent text-center text-sm font-mono dark:text-gray-200 focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />

                  <button
                    onClick={() => {
                      setColorCount((prev) =>
                        Math.min(colorPalette.length, prev + 1)
                      );

                      setIsPickerExpanded(true);
                    }}
                    className="px-3 py-1 text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +
                  </button>
                </div>
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
  );
};

export default Example;
