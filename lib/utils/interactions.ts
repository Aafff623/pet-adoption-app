/**
 * 交互特效工具函数
 * 提供涟漪、光晕、粒子等视觉反馈
 */

import React from 'react';

/**
 * 创建涟漪效果
 * @param event - 点击事件
 * @param isPrimary - 是否为主按钮（使用特殊涟漪色）
 */
export function createRipple(event: React.MouseEvent<HTMLElement>, isPrimary = false) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  
  // 计算点击位置相对于按钮的坐标
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // 创建涟漪元素
  const ripple = document.createElement('span');
  ripple.className = `ripple ${isPrimary ? 'ripple-primary' : ''}`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
  
  // 确保按钮有相对定位
  if (!button.classList.contains('ripple-container')) {
    button.classList.add('ripple-container');
  }
  
  button.appendChild(ripple);
  
  // 动画结束后移除元素
  setTimeout(() => ripple.remove(), 600);
}

/**
 * 触发主按钮光晕特效
 * @param button - 按钮元素或事件
 */
export function triggerGlowEffect(button: HTMLElement | React.MouseEvent<HTMLElement>) {
  const element = button instanceof HTMLElement ? button : button.currentTarget;
  
  element.classList.add('glow-effect', 'active');
  
  setTimeout(() => {
    element.classList.remove('active');
  }, 600);
}

/**
 * 创建心形粒子爆炸效果
 * @param event - 点击事件
 * @param count - 粒子数量（默认 6）
 */
export function createHeartParticles(event: React.MouseEvent<HTMLElement>, count = 6) {
  const rect = event.currentTarget.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'heart-particle';
    particle.textContent = '❤️';
    
    // 随机角度和距离
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 20 + Math.random() * 20;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    
    particle.style.left = `${centerX + offsetX}px`;
    particle.style.top = `${centerY + offsetY}px`;
    particle.style.animationDelay = `${i * 0.05}s`;
    
    document.body.appendChild(particle);
    
    // 动画结束后移除
    setTimeout(() => particle.remove(), 1200 + i * 50);
  }
}

/**
 * 组合按钮交互（涟漪 + 光晕）
 * @param event - 点击事件
 * @param options - 配置项
 */
export function enhancedButtonClick(
  event: React.MouseEvent<HTMLElement>,
  options: {
    ripple?: boolean;
    glow?: boolean;
    primary?: boolean;
  } = {}
) {
  const { ripple = true, glow = false, primary = false } = options;
  
  if (ripple) {
    createRipple(event, primary);
  }
  
  if (glow) {
    triggerGlowEffect(event);
  }
}
