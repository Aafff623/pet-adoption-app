import React from 'react';
import { motion } from 'framer-motion';

/**
 * 页面过渡动画：淡入 + 微向上滑动（适配移动端 PWA 体验）
 * 使用方式：在页面根组件外包裹（已在 AnimatedRoutes 统一处理，无需手动添加）
 */
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

export const pageTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 单个页面的过渡动画包裹层
 * 通常由 AnimatedRoutes 统一管理，不需要在每页手动使用
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
