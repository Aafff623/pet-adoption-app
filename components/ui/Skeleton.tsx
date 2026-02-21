import React from 'react';
import { cn } from '../../lib/utils/cn';

interface SkeletonProps {
  className?: string;
  /** 圆形骨架（适用于头像） */
  circle?: boolean;
  /** 渲染指定数量的骨架行 */
  lines?: number;
}

/**
 * 统一的骨架屏组件，替代全站散落的 `animate-pulse bg-gray-100` 类名
 * @example
 * <Skeleton className="h-4 w-48 rounded-full" />
 * <Skeleton circle className="w-12 h-12" />
 * <Skeleton lines={3} />
 */
const Skeleton: React.FC<SkeletonProps> = ({ className, circle = false, lines }) => {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-gray-100 dark:bg-zinc-800 rounded-full',
              i === lines - 1 ? 'w-4/5' : 'w-full',
              'h-3'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-100 dark:bg-zinc-800',
        circle ? 'rounded-full' : 'rounded-xl',
        className
      )}
    />
  );
};

// 预制组合：卡片骨架
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-zinc-800 rounded-2xl shadow-sm overflow-hidden', className)}>
    <Skeleton className="w-full aspect-[4/3]" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton circle className="w-6 h-6" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

// 预制组合：列表行骨架
export const SkeletonListItem: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-3 p-4', className)}>
    <Skeleton circle className="w-12 h-12 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export default Skeleton;
