import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const STORAGE_KEY = 'petconnect_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return prefersDark ? 'dark' : 'light';
}

/**
 * 应用主题，支持丝滑过渡。
 * 核心原理：先在第 1 帧挂载 .theme-transitioning（注册 CSS transition），
 * 再在第 2 帧切换 dark 类，浏览器感知到样式变化后触发平滑过渡。
 * 初次渲染时 enableTransition = false，跳过动画避免首屏闪烁。
 */
function applyTheme(resolved: 'light' | 'dark', enableTransition: boolean) {
  const root = document.documentElement;

  if (!enableTransition) {
    root.classList.toggle('dark', resolved === 'dark');
    return;
  }

  // 第 1 帧：挂载过渡类，让浏览器注册 transition 规则
  root.classList.add('theme-transitioning');

  // 第 2 帧：切换主题，浏览器检测到颜色变化 → 触发过渡动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.toggle('dark', resolved === 'dark');

      // 过渡完成（400ms）后移除过渡类，恢复其他动画的正常行为
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 420);
    });
  });
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [prefersDark, setPrefersDark] = useState(getSystemPrefersDark);
  const resolvedTheme = resolveTheme(theme, prefersDark);
  // 首次渲染标记：初始化时不触发过渡动画（防止首屏闪烁）
  const isFirstRender = useRef(true);

  useEffect(() => {
    applyTheme(resolvedTheme, !isFirstRender.current);
    isFirstRender.current = false;
  }, [resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setPrefersDark(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const value: ThemeContextValue = { theme, resolvedTheme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
