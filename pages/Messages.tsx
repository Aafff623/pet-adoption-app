import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { fetchConversations } from '../lib/api/messages';
import type { Conversation } from '../types';

const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }
  return `${date.getMonth() + 1}-${date.getDate()}`;
};

const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchConversations(user.id);
        setConversations(data);
      } catch (err) {
        console.error('加载消息列表失败', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filteredConversations = conversations.filter(conv => {
    if (activeTab === 'unread') return conv.unreadCount > 0;
    if (activeTab === 'official') return conv.isSystem;
    return true;
  });

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0 bg-background-light/95 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">消息中心</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="搜索">
            <span className="material-icons-round text-gray-600">search</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="编辑">
            <span className="material-icons-round text-gray-600">edit_note</span>
          </button>
        </div>
      </header>

      {/* 标签页 */}
      <div className="px-6 mb-4 shrink-0">
        <div className="bg-white rounded-xl p-1 flex shadow-sm border border-gray-100" role="tablist">
          {[{ id: 'all', label: '全部' }, { id: 'unread', label: '未读' }, { id: 'official', label: '官方' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-2" role="tabpanel">
        {loading ? (
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center p-3 gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="group flex items-center p-3 -mx-3 rounded-2xl hover:bg-white active:bg-gray-50 transition-colors cursor-pointer relative"
              role="listitem"
              aria-label={`与 ${conv.otherUserName} 的消息`}
            >
              <div className="relative shrink-0">
                {conv.isSystem ? (
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                    <span className="material-icons-round text-blue-500 text-2xl">notifications</span>
                  </div>
                ) : (
                  <img
                    src={conv.otherUserAvatar}
                    alt={conv.otherUserName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white bg-gray-200"
                  />
                )}
                {conv.unreadCount > 0 && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-gray-900 truncate">{conv.otherUserName}</h3>
                  <span className={`text-xs font-medium ${conv.unreadCount > 0 ? 'text-primary' : 'text-gray-400'}`}>
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate pr-6">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="absolute right-3 bottom-4 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {conv.unreadCount}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-icons-round text-6xl mb-4 text-gray-200">sentiment_dissatisfied</span>
            <p>暂无相关消息</p>
          </div>
        )}
      </div>

      <button
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/20 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform z-40"
        aria-label="发起新会话"
      >
        <span className="material-icons-round text-2xl">add_comment</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default Messages;
