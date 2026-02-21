import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ThemeMode, ColorScheme, ThemeState } from '../types';
import { applyCSSVariables } from '../lib/utils/cssVariables';

const STORAGE_KEY = 'petconnect_theme';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  colorScheme: ColorScheme;
  setTheme: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  hasColorSchemeSet: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredThemeState(): ThemeState {
  if (typeof window === 'undefined') return { mode: 'system', colorScheme: 'green' };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.mode && parsed.colorScheme) return parsed;
    } catch {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return { mode: stored, colorScheme: 'green' };
      }
    }
  }
  return { mode: 'system', colorScheme: 'green' };
}

function hasConfiguredColorScheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return false;
  try {
    const parsed = JSON.parse(stored);
    return !!(parsed.colorScheme && parsed.colorScheme !== 'green');
  } catch {
    return false;
  }
}

function resolveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return prefersDark ? 'dark' : 'light';
}

/**
 * 应用主题，支持丝滑过渡（包括颜色方案切换）
 * 核心原理：先在第 1 帧挂载 .theme-transitioning（注册 CSS transition），
 * 再在第 2 帧切换 dark 类，浏览器感知到样式变化后触发平滑过渡。
 * 初次渲染时 enableTransition = false，跳过动画避免首屏闪烁。
 */
function applyTheme(resolved: 'light' | 'dark', scheme: ColorScheme, enableTransition: boolean) {
  const root = document.documentElement;
  applyCSSVariables(scheme, resolved === 'dark');

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
  const [themeState, setThemeStateInternal] = useState<ThemeState>(getStoredThemeState);
  const [prefersDark, setPrefersDark] = useState(getSystemPrefersDark);
  const resolvedTheme = resolveTheme(themeState.mode, prefersDark);
  const [hasColorSchemeSetFlag, setHasColorSchemeSetFlag] = useState(hasConfiguredColorScheme);
  // 首次渲染标记：初始化时不触发过渡动画（防止首屏闪烁）
  const isFirstRender = useRef(true);

  useEffect(() => {
    applyTheme(resolvedTheme, themeState.colorScheme, !isFirstRender.current);
    isFirstRender.current = false;
  }, [resolvedTheme, themeState.colorScheme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setPrefersDark(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    const newState = { ...themeState, mode };
    setThemeStateInternal(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, [themeState]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    const newState = { ...themeState, colorScheme: scheme };
    setThemeStateInternal(newState);
    setHasColorSchemeSetFlag(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, [themeState]);

  const value: ThemeContextValue = {
    mode: themeState.mode,
    resolvedTheme,
    colorScheme: themeState.colorScheme,
    setTheme,
    setColorScheme,
    hasColorSchemeSet: hasColorSchemeSetFlag,
  };

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
