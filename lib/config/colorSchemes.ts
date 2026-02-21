import { ColorScheme, ColorSchemeConfig } from '../../types';

/**
 * 6 种配色方案的完整配置
 * 每种配色包含 light 和 dark 两种模式的颜色定义
 */
export const colorSchemes: Record<ColorScheme, ColorSchemeConfig> = {
  // 绿色 - 默认配色
  green: {
    light: {
      primary: '#60e750',
      primaryDark: '#4ad325',
      backgroundLight: '#f6f8f6',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#60e750',
      primaryDark: '#4ad325',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
  
  // 蓝色 - 专业蓝
  blue: {
    light: {
      primary: '#3b82f6',
      primaryDark: '#1d4ed8',
      backgroundLight: '#f0f4f8',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#60a5fa',
      primaryDark: '#3b82f6',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
  
  // 紫色 - 温暖紫色
  purple: {
    light: {
      primary: '#a855f7',
      primaryDark: '#7e22ce',
      backgroundLight: '#f8f4ff',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#d8b4fe',
      primaryDark: '#a855f7',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
  
  // 粉红 - 温暖粉色
  pink: {
    light: {
      primary: '#ec4899',
      primaryDark: '#be185d',
      backgroundLight: '#fff1f6',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#f472b6',
      primaryDark: '#ec4899',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
  
  // 橙色 - 明亮橙色
  orange: {
    light: {
      primary: '#f97316',
      primaryDark: '#c2410c',
      backgroundLight: '#fff7ed',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#fb923c',
      primaryDark: '#f97316',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
  
  // 青色 - 清爽青色
  cyan: {
    light: {
      primary: '#06b6d4',
      primaryDark: '#0891b2',
      backgroundLight: '#f0fdfa',
      surfaceWhite: '#ffffff',
      textMain: '#1f2937',
      textSub: '#6b7280',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
    dark: {
      primary: '#22d3ee',
      primaryDark: '#06b6d4',
      backgroundLight: '#18181b',
      surfaceWhite: '#27272a',
      textMain: '#f3f4f6',
      textSub: '#d1d5db',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      borderDark: '#3f3f46',
    },
  },
};

/**
 * 获取配色方案名称（中文）
 */
export const colorSchemeLabels: Record<ColorScheme, string> = {
  green: '草绿色',
  blue: '天空蓝',
  purple: '魔法紫',
  pink: '樱花粉',
  orange: '阳光橙',
  cyan: '清爽青',
};

/**
 * 所有可用的配色方案列表
 */
export const COLOR_SCHEMES: ColorScheme[] = ['green', 'blue', 'purple', 'pink', 'orange', 'cyan'];
