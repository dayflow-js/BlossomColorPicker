import {
  BlossomColorPicker,
  ChromePicker,
} from '@dayflow/blossom-color-picker-react';
import type { BlossomColorPickerValue } from '@dayflow/blossom-color-picker-react';
import React, { useMemo, useState } from 'react';

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
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
    <path d='M9 18c-4.51 2-4.51-2-7-2' />
  </svg>
);

const Example = () => {
  const [color, setColor] = useState<BlossomColorPickerValue>({
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

  const [activePos, setActivePos] = useState<
    'top' | 'bottom' | 'left' | 'right'
  >('left');
  const [colorCount, setColorCount] = useState(42);
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);
  const [multiLayerColor, setMultiLayerColor] =
    useState<BlossomColorPickerValue>({
      hue: 330,
      saturation: 10,
      lightness: 92,
      alpha: 100,
      layer: 'outer',
    });

  // Slice palette based on count
  const dynamicPalette = useMemo(
    () => colorPalette.slice(0, colorCount),
    [colorCount]
  );

  return (
    <div className='fixed inset-0 flex flex-col items-center gap-6 overflow-x-hidden overflow-y-auto bg-gray-50 px-6 pt-24 pb-20 transition-colors duration-300 md:px-24 md:pt-48 dark:bg-slate-950'>
      <header className='fixed top-0 right-0 left-0 z-50 h-14 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80'>
        <div className='relative flex h-full w-full items-center justify-between'>
          {/* Left side icon */}
          <div className='flex items-center'>
            <span className='text-2xl' role='img' aria-label='blossom'>
              🌸
            </span>
            <span className='pl-4 text-lg font-bold whitespace-nowrap md:text-xl'>
              Blossom Color Picker
            </span>
          </div>

          {/* Right side actions */}
          <div className='flex items-center space-x-2 md:space-x-3'>
            <a
              href='https://github.com/dayflow-js/BlossomColorPicker'
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      </header>

      <div className='grid w-full max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-2'>
        <div className='flex flex-col gap-8'>
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-2xl/20'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <span className='text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100'>
                  Basic Bloom
                </span>
              </div>
              <BlossomColorPicker
                value={color}
                onChange={newColor => setColor(newColor)}
                coreSize={36}
                petalSize={36}
                sliderWidth={24}
                adaptivePositioning={false}
              />
            </div>
          </div>

          {/* Multi-Layer Example */}
          <div className='rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-2xl/20'>
            <div className='flex flex-col'>
              <div className='mb-24 flex items-center justify-between'>
                <div className='flex flex-col'>
                  <span className='text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100'>
                    Multi-Layer Bloom
                  </span>

                  <span className='text-xs text-gray-400 dark:text-gray-500'>
                    {colorCount} colors auto-distributed
                  </span>
                  <span className='text-xs text-gray-400 dark:text-gray-500'>
                    Adaptive Positioning on mobile
                  </span>
                </div>

                <BlossomColorPicker
                  colors={dynamicPalette}
                  value={multiLayerColor}
                  onChange={newColor => setMultiLayerColor(newColor)}
                  sliderPosition={activePos}
                  initialExpanded={isPickerExpanded}
                  coreSize={40}
                  petalSize={32}
                  sliderWidth={18}
                  onCollapse={() => setIsPickerExpanded(false)}
                />
              </div>

              <div className='space-y-4'>
                {/* Color Count Control */}
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                    Color Count
                  </span>

                  <div className='flex items-center rounded-lg bg-gray-100 p-1 dark:bg-slate-800'>
                    <button
                      onClick={() => {
                        setColorCount(prev => Math.max(1, prev - 1));
                        setIsPickerExpanded(true);
                      }}
                      className='px-3 py-1 text-lg font-bold text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    >
                      -
                    </button>
                    <input
                      type='number'
                      value={colorCount}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setColorCount(
                            Math.max(1, Math.min(colorPalette.length, val))
                          );
                          setIsPickerExpanded(true);
                        }
                      }}
                      className='w-12 appearance-none bg-transparent text-center font-mono text-sm focus:outline-none dark:text-gray-200'
                    />
                    <button
                      onClick={() => {
                        setColorCount(prev =>
                          Math.min(colorPalette.length, prev + 1)
                        );
                        setIsPickerExpanded(true);
                      }}
                      className='px-3 py-1 text-lg font-bold text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Position Tabs */}
                <div className='flex rounded-xl bg-gray-100 p-1 dark:bg-slate-800'>
                  {(['top', 'bottom', 'left', 'right'] as const).map(pos => (
                    <button
                      key={pos}
                      onClick={() => {
                        setActivePos(pos);
                        setIsPickerExpanded(true);
                      }}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                        activePos === pos
                          ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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

        <div className='flex flex-col gap-8'>
          <div className='flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-2xl/20'>
            <span className='mb-5 text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100'>
              {`<ChromePicker/>`}
            </span>
            <div className='flex justify-center'>
              <ChromePicker
                value={chromeColor}
                onChange={newColor => setChromeColor(newColor)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Example;
