import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名，自动处理冲突（tailwind-merge）
 * 支持条件类名（clsx）
 *
 * @example
 * cn('px-4 py-2', condition && 'bg-primary', 'text-white')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
