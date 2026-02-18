import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchChatMessages,
  sendChatMessage,
  subscribeToMessages,
  markConversationRead,
  fetchConversations,
} from '../lib/api/messages';
import type { ChatMessage, Conversation } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

interface ChatDetailProps {
  showToast: (message: string) => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ showToast }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

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
      } catch (err) {
        console.error('加载聊天记录失败', err);
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
    });

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [id, user]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !id || sending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const sent = await sendChatMessage(id, text);
      setChatMessages(prev => {
        const exists = prev.some(m => m.id === sent.id);
        if (exists) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      console.error('发送消息失败', err);
      setInputMessage(text);
      showToast('消息发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center fade-in">
        <span className="material-icons text-[#60e750] text-4xl animate-spin">refresh</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center fade-in">
        <div className="text-center">
          <p className="text-gray-500 mb-4">消息未找到</p>
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
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="返回">
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
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
          <h1 className="text-lg font-bold text-gray-900">{conversation.otherUserName}</h1>
        </button>
        <div className="flex-1"></div>
        <button
          onClick={() => setShowMoreMenu(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="更多选项"
        >
          <span className="material-icons-round text-gray-600">more_vert</span>
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {chatMessages.length === 0 && (
          <div className="text-center text-xs text-gray-400 my-4">暂无消息，发送第一条消息吧</div>
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
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.isSelf ? 'text-black/50 text-right' : 'text-gray-400'}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white px-4 py-3 border-t border-gray-100 sticky bottom-0 z-50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachPanel(prev => !prev)}
            className={`p-2 transition-colors ${showAttachPanel ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="添加附件"
          >
            <span className="material-icons-round text-2xl">{showAttachPanel ? 'cancel' : 'add_circle_outline'}</span>
          </button>
          <input
            type="text"
            placeholder="发送消息..."
            className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50"
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
        <div className="bg-white border-t border-gray-100 px-6 py-5 sticky bottom-0 z-40">
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
                <span className="text-xs text-gray-500">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 更多选项底部菜单 */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-end justify-center"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* 对方用户信息 */}
            {!conversation.isSystem && (
              <div className="flex items-center gap-3 px-5 mb-4 pb-4 border-b border-gray-50">
                {conversation.otherUserAvatar ? (
                  <img
                    src={conversation.otherUserAvatar}
                    alt={conversation.otherUserName}
                    className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='18' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="material-icons-round text-gray-400">person</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900">{conversation.otherUserName}</p>
                  <p className="text-xs text-gray-400">寄养家庭</p>
                </div>
              </div>
            )}

            <div className="px-4 space-y-1">
              {[
                { icon: 'delete_sweep', label: '清空聊天记录', color: 'text-gray-700', danger: false },
                { icon: 'flag', label: '举报该用户', color: 'text-orange-500', danger: false },
                { icon: 'block', label: '屏蔽该用户', color: 'text-red-500', danger: true },
              ].map(item => (
                <button
                  key={item.icon}
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <span className={`material-icons-round ${item.color}`}>{item.icon}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-4 mt-3">
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-full py-3.5 bg-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-200 active:scale-[0.98] transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户信息卡片弹窗 */}
      {showUserProfile && !conversation.isSystem && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] flex items-end justify-center"
          onClick={() => setShowUserProfile(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md pb-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="flex flex-col items-center px-6 pt-4 pb-6">
              <div className="relative mb-4">
                {conversation.otherUserAvatar ? (
                  <img
                    src={conversation.otherUserAvatar}
                    alt={conversation.otherUserName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-gray-100"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='55%25' font-size='32' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E`; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="material-icons-round text-gray-400 text-4xl">person</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{conversation.otherUserName}</h3>

              <div className="flex items-center gap-2 mb-5">
                <span className="bg-green-50 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-green-100">
                  寄养家庭
                </span>
                <span className="bg-blue-50 text-blue-500 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                  近期活跃
                </span>
              </div>

              <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="material-icons-round text-primary text-lg">shield</span>
                  <span>已通过平台实名认证</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="material-icons-round text-gray-400 text-lg">lock</span>
                  <span className="text-gray-400">手机号码已隐藏保护</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="material-icons-round text-gray-400 text-lg">email</span>
                  <span className="text-gray-400">邮箱信息已隐藏保护</span>
                </div>
              </div>

              <button
                onClick={() => setShowUserProfile(false)}
                className="w-full h-12 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all"
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
