import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { colorSchemes, colorSchemeLabels, COLOR_SCHEMES } from '../lib/config/colorSchemes';
import type { ThemeMode, ColorScheme } from '../types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: '浅色', icon: 'light_mode' },
  { value: 'dark', label: '深色', icon: 'dark_mode' },
  { value: 'system', label: '跟随系统', icon: 'settings_brightness' },
];

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { mode, setTheme, colorScheme, setColorScheme, resolvedTheme } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  return (
    <div className="pb-24 fade-in">
      <header className="px-6 pt-6 pb-4 sticky top-0 z-40 bg-background-light/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all"
          aria-label="返回"
        >
          <span className="material-icons-round text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-text-main dark:text-zinc-100 mt-2">外观</h1>
      </header>

      <main className="px-6 space-y-8 py-6">
        {/* 主题模式选择 */}
        <section>
          <h2 className="text-xs font-semibold text-text-sub dark:text-zinc-400 mb-3 uppercase tracking-wider">
            主题模式
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700">
            {THEME_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`w-full flex items-center justify-between p-4 transition-colors text-left ${
                  mode === opt.value
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                } ${i < THEME_OPTIONS.length - 1 ? 'border-b border-gray-100 dark:border-zinc-700' : ''}`}
                aria-label={opt.label}
                aria-pressed={mode === opt.value}
              >
                <div className="flex items-center gap-3">
                  <span className="material-icons-round text-xl text-gray-600 dark:text-zinc-400">
                    {opt.icon}
                  </span>
                  <span className="font-medium text-text-main dark:text-zinc-200">{opt.label}</span>
                </div>
                {mode === opt.value && (
                  <span className="material-icons-round text-primary text-xl">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 配色方案选择 */}
        <section>
          <h2 className="text-xs font-semibold text-text-sub dark:text-zinc-400 mb-3 uppercase tracking-wider">
            配色方案
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {COLOR_SCHEMES.map((scheme) => {
              const config = colorSchemes[scheme];
              const isSelected = colorScheme === scheme;

              return (
                <button
                  key={scheme}
                  onClick={() => setColorScheme(scheme)}
                  className={`relative p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-primary/50 bg-white dark:bg-zinc-800'
                  }`}
                >
                  {/* 亮暗模式颜色预览条 */}
                  <div className="mb-3 h-16 rounded-xl overflow-hidden flex gap-0.5">
                    <div
                      className="flex-1 rounded-l-xl"
                      style={{ backgroundColor: config.light.primary }}
                    />
                    <div
                      className="flex-1 rounded-r-xl opacity-80"
                      style={{ backgroundColor: config.dark.primary }}
                    />
                  </div>

                  {/* 配色名称 */}
                  <div className="font-semibold text-text-main dark:text-zinc-100 text-sm">
                    {colorSchemeLabels[scheme]}
                  </div>
                  <div className="text-xs text-text-sub dark:text-zinc-400 mt-0.5">
                    {isSelected ? '当前使用' : ''}
                  </div>

                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-white" style={{ fontSize: '14px' }}>check</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 当前配色预览卡片 */}
        <section>
          <h2 className="text-xs font-semibold text-text-sub dark:text-zinc-400 mb-3 uppercase tracking-wider">
            当前配色预览
          </h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-4 border border-gray-100 dark:border-zinc-700 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: colorSchemes[colorScheme as ColorScheme]?.[resolvedTheme]?.primary + '20' }}>
              <div
                className="w-8 h-8 rounded-full shadow-sm"
                style={{ backgroundColor: colorSchemes[colorScheme as ColorScheme]?.[resolvedTheme]?.primary }}
              />
              <div>
                <div className="font-semibold text-text-main dark:text-zinc-100 text-sm">
                  {colorSchemeLabels[colorScheme as ColorScheme]}
                </div>
                <div className="text-xs text-text-sub dark:text-zinc-400">
                  {resolvedTheme === 'dark' ? '深色模式' : '浅色模式'}
                </div>
              </div>
            </div>
            <p className="text-xs text-text-sub dark:text-zinc-400 px-1">
              配色方案将应用于按鈕、选中状态、标签等交互元素的主色调。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ThemeSettings;
