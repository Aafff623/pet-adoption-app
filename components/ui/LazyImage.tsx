import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils/cn';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** 加载中/失败时的占位符（默认显示宠物爪印图标） */
  fallback?: React.ReactNode;
  /** wrapper 容器的 className */
  wrapperClassName?: string;
  /** 图片本身的样式，会在加载完成后淡入 */
  className?: string;
  /** 宽高比（用于保持骨架的尺寸稳定），如 "4/3", "1/1" */
  aspectRatio?: string;
}

/**
 * 渐进式懒加载图片组件
 * - 内置 loading="lazy" 原生懒加载
 * - 加载时显示骨架动画占位
 * - 加载完成后以淡入效果显示图片
 * - 加载失败时显示友好占位图标
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback,
  wrapperClassName,
  className,
  aspectRatio = '4/3',
  ...props
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  const paddingTopPercent = (() => {
    const parts = aspectRatio.split('/');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (w > 0) return `${(h / w) * 100}%`;
    }
    return '75%'; // fallback to 4/3
  })();

  return (
    <div
      className={cn('relative overflow-hidden bg-gray-100 dark:bg-zinc-800', wrapperClassName)}
      style={{ paddingTop: wrapperClassName?.includes('aspect-') ? undefined : paddingTopPercent }}
    >
      {/* 骨架占位 */}
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-zinc-800" />
      )}

      {/* 错误 / 无图占位 */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800/60">
          {fallback ?? (
            <>
              <span className="material-icons-round text-3xl text-gray-300 dark:text-zinc-600">pets</span>
            </>
          )}
        </div>
      )}

      {/* 真实图片 */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
