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

const ChatDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
        <div className="ml-2 flex items-center">
          {!conversation.isSystem && conversation.otherUserAvatar && (
            <img src={conversation.otherUserAvatar} alt={conversation.otherUserName} className="w-8 h-8 rounded-full object-cover mr-2" />
          )}
          <h1 className="text-lg font-bold text-gray-900">{conversation.otherUserName}</h1>
        </div>
        <div className="flex-1"></div>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="更多选项">
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
              <img
                src={conversation.otherUserAvatar}
                className="w-8 h-8 rounded-full self-end mr-2 mb-1"
                alt={conversation.otherUserName}
              />
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
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600" aria-label="添加附件">
            <span className="material-icons-round text-2xl">add_circle_outline</span>
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
    </div>
  );
};

export default ChatDetail;
