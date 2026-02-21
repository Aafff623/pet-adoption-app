/**
 * AI 防滥用校验：限制恶意或高频触发 AI 回复
 * 配置：可通过 `VITE_AI_MAX_MESSAGE_LENGTH` 环境变量调整最大允许长度（字符数）。
 */

const DEFAULT_MAX_MESSAGE_LENGTH = 400;
const MAX_MESSAGE_LENGTH = (() => {
  try {
    const v = (import.meta.env.VITE_AI_MAX_MESSAGE_LENGTH as string | undefined)?.trim();
    if (v) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n > 0) return n;
    }
  } catch {}
  return DEFAULT_MAX_MESSAGE_LENGTH;
})();

const COOLDOWN_MS = 8000;
const RECENT_USER_MESSAGES_COUNT = 4;
const MIN_MESSAGE_LENGTH = 1;

/**
 * 判断是否应允许调用 AI 生成回复。
 * 返回 { allow: boolean }，不允许时直接不触发 AI 回复。
 */
export function shouldAllowAI(
  userMessage: string,
  lastAiReplyTime: number | null,
  recentUserMessages: string[],
): { allow: boolean } {
  const trimmed = userMessage.trim();
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return { allow: false };
  }

  // 当消息过长时仍允许发送，但禁用 AI 自动回复以防滥用。
  // 这保证用户可以发送长文本给对方，但不会触发模型回复（可在服务端/模型端做更细粒度处理）。
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { allow: false };
  }

  const now = Date.now();
  if (lastAiReplyTime !== null && now - lastAiReplyTime < COOLDOWN_MS) {
    return { allow: false };
  }

  const recentSame = recentUserMessages
    .slice(-RECENT_USER_MESSAGES_COUNT)
    .filter((m) => m.trim() === trimmed);
  if (recentSame.length >= 2) {
    return { allow: false };
  }

  return { allow: true };
}
