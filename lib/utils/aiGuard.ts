/**
 * AI 防滥用校验：限制恶意或高频触发 AI 回复
 */

const MAX_MESSAGE_LENGTH = 400;
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
