import { ColorScheme } from '../../types';
import { colorSchemes } from '../config/colorSchemes';

/**
 * 通过 CSS 变量在根元素上设置配色方案
 * 这是一个可靠的动态配色方案实现方式，不需要修改 index.html
 */
export function applyCSSVariables(scheme: ColorScheme, isDark: boolean) {
  const config = colorSchemes[scheme];
  const palette = isDark ? config.dark : config.light;
  const root = document.documentElement;

  // 设置 CSS 变量
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-primary-dark', palette.primaryDark);
  root.style.setProperty('--color-background-light', palette.backgroundLight);
  root.style.setProperty('--color-surface-white', palette.surfaceWhite);
  root.style.setProperty('--color-text-main', palette.textMain);
  root.style.setProperty('--color-text-sub', palette.textSub);
  root.style.setProperty('--color-bg-dark', palette.bgDark);
  root.style.setProperty('--color-surface-dark', palette.surfaceDark);
  root.style.setProperty('--color-border-dark', palette.borderDark);
}
