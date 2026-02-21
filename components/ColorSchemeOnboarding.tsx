import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { colorSchemes, colorSchemeLabels, COLOR_SCHEMES } from '../lib/config/colorSchemes';
import { ColorScheme } from '../types';

interface ColorSchemeOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 首次登录配色选择引导 Modal
 * 展示 6 种配色方案，用户可预览和选择
 */
export const ColorSchemeOnboarding: React.FC<ColorSchemeOnboardingProps> = ({ isOpen, onClose }) => {
  const { setColorScheme, resolvedTheme } = useTheme();
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(null);

  const handleSelectScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    setSelectedScheme(scheme);
    // 延迟关闭，让用户看到颜色变化的过渡效果
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleSkip = () => {
    // 跳过时仍需设置为 green（这样下次就不会再显示）
    setColorScheme('green');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 - fade in 动画 */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal 内容 - scale in 动画 */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className="bg-white dark:bg-zinc-800 rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-in scale-in-95 duration-200 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
            <h2 className="text-2xl font-bold text-text-main dark:text-zinc-100 mb-2">
              选择你喜欢的配色
            </h2>
            <p className="text-text-sub dark:text-zinc-400 text-sm">
              个性化你的应用外观，随时可在设置中更换
            </p>
          </div>

          {/* 配色网格 */}
          <div className="p-6 space-y-4">
            {COLOR_SCHEMES.map((scheme) => {
              const config = colorSchemes[scheme];
              const lightPalette = config.light;
              const darkPalette = config.dark;
              
              return (
                <button
                  key={scheme}
                  onClick={() => handleSelectScheme(scheme)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all active:scale-[0.97] ${
                    selectedScheme === scheme
                      ? 'border-primary bg-primary/5 dark:bg-primary/20'
                      : 'border-gray-200 dark:border-zinc-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* 配色预览 - 亮暗模式各一小块 */}
                    <div className="flex gap-2 flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm transition-all"
                        style={{ backgroundColor: lightPalette.primary }}
                        title="亮色模式"
                      />
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm transition-all"
                        style={{ backgroundColor: darkPalette.primary }}
                        title="暗色模式"
                      />
                    </div>
                    
                    {/* 配色名称和选中标记 */}
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-text-main dark:text-zinc-100">
                        {colorSchemeLabels[scheme]}
                      </div>
                    </div>
                    
                    {selectedScheme === scheme && (
                      <span className="material-icons-round text-primary text-lg">
                        check_circle
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 底部操作按钮 */}
          <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 rounded-xl text-text-sub dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-[0.97] transition-all font-medium"
            >
              跳过
            </button>
            <button
              onClick={() => selectedScheme && handleSelectScheme(selectedScheme)}
              disabled={!selectedScheme}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white disabled:opacity-50 active:scale-[0.97] transition-all font-medium"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
