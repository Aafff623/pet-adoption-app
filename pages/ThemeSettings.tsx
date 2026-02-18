import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../contexts/ThemeContext';

const OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: '浅色', icon: 'light_mode' },
  { value: 'dark', label: '深色', icon: 'dark_mode' },
  { value: 'system', label: '跟随系统', icon: 'settings_brightness' },
];

const ThemeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100 ml-2">外观</h1>
      </header>

      <main className="p-6">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-500 dark:text-zinc-400 ml-1">主题模式</h2>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-700">
            {OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`w-full flex items-center justify-between p-4 transition-colors text-left ${
                  theme === opt.value
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                } ${i < OPTIONS.length - 1 ? 'border-b border-gray-50 dark:border-zinc-700' : ''}`}
                aria-label={opt.label}
                aria-pressed={theme === opt.value}
              >
                <div className="flex items-center gap-3">
                  <span className="material-icons-round text-xl text-gray-600 dark:text-zinc-400">
                    {opt.icon}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-zinc-200">{opt.label}</span>
                </div>
                {theme === opt.value && (
                  <span className="material-icons-round text-primary text-xl">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThemeSettings;
