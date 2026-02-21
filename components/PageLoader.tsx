import React from 'react';

/**
 * 全局页面加载骨架 - 用于 React.lazy + Suspense 的 fallback
 * 显示顶部进度条风格的加载状态，轻量、不抢焦点
 */
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col">
    {/* 顶部进度条 */}
    <div className="h-0.5 w-full overflow-hidden">
      <div className="h-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite]"
        style={{ width: '60%', animation: 'progressBar 1.2s ease-in-out infinite' }}
      />
    </div>
    {/* 中心 Logo 动画 */}
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="material-icons-round text-primary text-4xl animate-pulse">pets</span>
        <div className="h-1 w-16 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-primary/50 rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  </div>
);

export default PageLoader;
