import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchChatMessages,
  sendChatMessage,
  insertSystemReply,
  subscribeToMessages,
  markConversationRead,
  fetchConversations,
  clearChatMessages,
} from '../lib/api/messages';
import type { ChatMessage, Conversation } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { formatTime } from '../lib/utils/date';
import { pickReply } from '../lib/utils/autoReply';
import { generateAgentReply, getLlmDebugInfo } from '../lib/api/llm';
import { shouldAllowAI } from '../lib/utils/aiGuard';

const ChatDetail: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachPanel, setShowAttachPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastAiReplyTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const load = async () => {
      setLoading(true);
      try {
        const [messages, convList] = await Promise.all([
          fetchChatMessages(id),
          fetchConversations(user.id),
        ]);
        const conv = convList.find(c => c.id === id) ?? null;
        setConversation(conv);
        setChatMessages(messages);
        await markConversationRead(id);
      } catch {
        showToast('加载聊天记录失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    load();

    channelRef.current = subscribeToMessages(id, (newMsg: ChatMessage) => {
      setChatMessages(prev => {
        const exists = prev.some(m => m.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
      markConversationRead(id);
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [id, user, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/messages', { replace: true });
    }
  };

  const handleClearChatClick = () => {
    setShowMoreMenu(false);
    setShowClearConfirm(true);
  };

  const confirmClearChat = async () => {
    if (!id || clearing) return;
    setClearing(true);
    try {
      await clearChatMessages(id);
      setChatMessages([]);
      setShowClearConfirm(false);
      showToast('已移入回收站，3 天内可还原');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('deleted_at') || msg.includes('column')) {
        showToast('请先在 Supabase 执行 add_deleted_at_to_chat_messages.sql');
      } else {
        showToast('清空失败，请重试');
      }
    } finally {
      setClearing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !id || sending) return;

    const text = inputMessage.trim();
    const convId = id;
    const isSystemConv = conversation?.isSystem ?? false;
    setInputMessage('');
    setSending(true);

    try {
      const sent = await sendChatMessage(id, text);
      setChatMessages(prev => {
        const exists = prev.some(m => m.id === sent.id);
        if (exists) return prev;
        return [...prev, sent];
      });

      const agentType = conversation?.agentType;
      const isAIConv = agentType === 'pet_expert' || agentType === 'emotional_counselor';

      if (isAIConv || !isSystemConv) {
        const delayMs = isAIConv ? 800 + Math.random() * 1200 : 2000 + Math.random() * 3000;
        setTimeout(async () => {
          try {
            let reply: string;
            if (isAIConv && agentType) {
              const recentUserContents = [
                ...chatMessages.filter(m => m.isSelf).map(m => m.content),
                text,
              ].slice(-3);
              const guard = shouldAllowAI(text, lastAiReplyTimeRef.current, recentUserContents);
              if (!guard.allow && guard.fallback) {
                reply = guard.fallback;
              } else {
                const history = chatMessages.slice(-20).map(m => ({
                  role: m.isSelf ? ('user' as const) : ('model' as const),
                  content: m.content,
                }));
                const aiReply = await generateAgentReply(agentType, text, history);
                if (aiReply === null) {
                  const debug = getLlmDebugInfo();
                  console.warn('[PetConnect AI] 回复失败，便于排查:', debug);
                }
                reply = aiReply ?? '抱歉，我这边有点卡，稍后再试～';
                if (aiReply) lastAiReplyTimeRef.current = Date.now();
              }
            } else {
              reply = pickReply(text);
            }
            const replyMsg = await insertSystemReply(convId, reply);
            setChatMessages(prev => {
              const exists = prev.some(m => m.id === replyMsg.id);
              if (exists) return prev;
              return [...prev, replyMsg];
            });
            markConversationRead(convId);
          } catch {
            // 自动回复失败静默处理，不影响用户
          }
        }, delayMs);
      }
    } catch {
      setInputMessage(text);
      showToast('消息发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center fade-in">
        <span className="material-icons text-primary text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex items-center justify-center fade-in">
        <div className="text-center">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">消息未找到</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-6 py-2 bg-primary text-black rounded-full font-bold shadow-lg shadow-primary/20"
          >
            返回消息列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-zinc-900 min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <button
          className="ml-2 flex items-center gap-2 active:opacity-70 transition-opacity"
          onClick={() => !conversation.isSystem && setShowUserProfile(true)}
          aria-label="查看对方信息"
        >
          {!conversation.isSystem && conversation.otherUserAvatar && (
            <img
              src={conversation.otherUserAvatar}
              alt={conversation.otherUserName}
              className="w-8 h-8 rounded-full object-cover"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
            />
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{conversation.otherUserName}</h1>
        </button>
        <div className="flex-1"></div>
        <button
          onClick={() => setShowMoreMenu(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="更多选项"
        >
          <span className="material-icons-round text-gray-600 dark:text-zinc-400">more_vert</span>
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {chatMessages.length === 0 && (
          <div className="text-center text-xs text-gray-400 dark:text-zinc-500 my-4">暂无消息，发送第一条消息吧</div>
        )}
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
            {!msg.isSelf && !conversation.isSystem && conversation.otherUserAvatar && (
              <button
                onClick={() => setShowUserProfile(true)}
                className="self-end mr-2 mb-1 shrink-0 active:opacity-70 transition-opacity"
                aria-label="查看对方信息"
              >
                <img
                  src={conversation.otherUserAvatar}
                  className="w-8 h-8 rounded-full object-cover"
                  alt={conversation.otherUserName}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                />
              </button>
            )}
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
              msg.isSelf
                ? 'bg-primary text-black rounded-br-none'
                : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700 rounded-bl-none shadow-sm'
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.isSelf ? 'text-black/50 text-right' : 'text-gray-400 dark:text-zinc-500'}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white dark:bg-zinc-800 px-4 py-3 border-t border-gray-100 dark:border-zinc-700 sticky bottom-0 z-50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachPanel(prev => !prev)}
            className={`p-2 transition-colors ${showAttachPanel ? 'text-primary' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'}`}
            aria-label="添加附件"
          >
            <span className="material-icons-round text-2xl">{showAttachPanel ? 'cancel' : 'add_circle_outline'}</span>
          </button>
          <input
            type="text"
            placeholder="发送消息..."
            className="flex-1 bg-gray-50 dark:bg-zinc-700 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            aria-label="消息输入框"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || sending}
            className="p-2 text-primary hover:text-green-600 disabled:opacity-40"
            aria-label="发送消息"
          >
            <span className="material-icons-round text-2xl">send</span>
          </button>
        </form>
      </footer>

      {/* 附件功能面板 */}
      {showAttachPanel && (
        <div className="bg-white dark:bg-zinc-800 border-t border-gray-100 dark:border-zinc-700 px-6 py-5 sticky bottom-0 z-40">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: 'camera_alt', label: '拍照', color: 'bg-blue-50 text-blue-500' },
              { icon: 'photo_library', label: '相册', color: 'bg-green-50 text-green-500' },
              { icon: 'attach_file', label: '文件', color: 'bg-orange-50 text-orange-500' },
              { icon: 'location_on', label: '位置', color: 'bg-red-50 text-red-500' },
            ].map(item => (
              <button
                key={item.icon}
                type="button"
                onClick={() => {
                  setShowAttachPanel(false);
                }}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <span className="material-icons-round text-2xl">{item.icon}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-400">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 更多选项底部菜单 */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
            </div>

            {/* 对方用户信息 */}
            {!conversation.isSystem && (
              <div className="flex items-center gap-3 px-5 mb-4 pb-4 border-b border-gray-50 dark:border-zinc-700">
                {conversation.otherUserAvatar ? (
                  <img
                    src={conversation.otherUserAvatar}
                    alt={conversation.otherUserName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100 dark:bg-zinc-700"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="material-icons-round text-gray-400 dark:text-zinc-500">person</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{conversation.otherUserName}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">寄养家庭</p>
                </div>
              </div>
            )}

            <div className="px-4 space-y-1">
              {[
                { icon: 'delete_sweep', label: '清空聊天记录', color: 'text-gray-700 dark:text-zinc-300', action: handleClearChatClick },
                { icon: 'restore_from_trash', label: '消息回收站', color: 'text-blue-500', action: () => { setShowMoreMenu(false); navigate('/recycle-bin'); } },
                { icon: 'flag', label: '举报该用户', color: 'text-orange-500', action: () => setShowMoreMenu(false) },
                { icon: 'block', label: '屏蔽该用户', color: 'text-red-500', action: () => setShowMoreMenu(false) },
              ].map(item => (
                <button
                  key={item.icon}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-700 active:bg-gray-100 dark:active:bg-zinc-600 transition-colors text-left"
                >
                  <span className={`material-icons-round ${item.color}`}>{item.icon}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-4 mt-3">
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full py-3.5 bg-gray-100 dark:bg-zinc-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-600 active:scale-[0.98] transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 清空聊天记录确认弹窗 */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[1000] flex items-end justify-center"
          onClick={() => !clearing && setShowClearConfirm(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
                <span className="material-icons-round text-orange-500 text-2xl">restore_from_trash</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">清空聊天记录</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">消息将移入回收站，3 天内可随时还原。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => !clearing && setShowClearConfirm(false)}
                disabled={clearing}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmClearChat}
                disabled={clearing}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {clearing ? '清空中...' : '确认清空'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户信息卡片弹窗 */}
      {showUserProfile && !conversation.isSystem && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/60 z-[999] flex items-end justify-center"
          onClick={() => setShowUserProfile(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-t-3xl w-full max-w-md pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-zinc-600" />
            </div>

            <div className="flex flex-col items-center px-6 pt-4 pb-6">
              <div className="relative mb-4">
                {conversation.otherUserAvatar ? (
                  <img
                    src={conversation.otherUserAvatar}
                    alt={conversation.otherUserName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg bg-gray-100 dark:bg-zinc-700"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='32' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center border-4 border-white dark:border-zinc-800 shadow-lg">
                    <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-4xl">person</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{conversation.otherUserName}</h3>

              <div className="flex items-center gap-2 mb-5">
                <span className="bg-green-50 dark:bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-green-100 dark:border-primary/30">
                  寄养家庭
                </span>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-500 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                  近期活跃
                </span>
              </div>

              <div className="w-full bg-gray-50 dark:bg-zinc-700 rounded-2xl p-4 mb-6 space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-primary text-lg">shield</span>
                  <span>已通过平台实名认证</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">lock</span>
                  <span className="text-gray-400 dark:text-zinc-500">手机号码已隐藏保护</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-zinc-300">
                  <span className="material-icons-round text-gray-400 dark:text-zinc-500 text-lg">email</span>
                  <span className="text-gray-400 dark:text-zinc-500">邮箱信息已隐藏保护</span>
                </div>
              </div>

              <button
                onClick={() => setShowUserProfile(false)}
                className="w-full h-12 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-600 active:scale-[0.98] transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;
