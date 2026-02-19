import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const SUPABASE_REQUEST_TIMEOUT_MS = 10_000;

const fetchWithTimeout: typeof fetch = async (input, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), SUPABASE_REQUEST_TIMEOUT_MS);

  const externalSignal = init.signal;
  const abortExternal = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', abortExternal, { once: true });
    }
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Supabase 请求超时（>${SUPABASE_REQUEST_TIMEOUT_MS / 1000}s）`);
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortExternal);
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量，请在 .env.local 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
});
