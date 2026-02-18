import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface NotificationGroup {
  title: string;
  items: NotificationItem[];
}

const STORAGE_KEY = 'petconnect_notification_settings';

const loadSettings = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveSettings = (settings: Record<string, boolean>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
};

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const storedSettings = loadSettings();

  const [groups, setGroups] = useState<NotificationGroup[]>([
    {
      title: '互动通知',
      items: [
        { id: 'new_message', label: '新消息通知', description: '收到新私信时提醒', enabled: storedSettings['new_message'] ?? true },
        { id: 'like', label: '点赞通知', description: '有人点赞您的帖子时提醒', enabled: storedSettings['like'] ?? true },
        { id: 'comment', label: '评论通知', description: '有人评论您的内容时提醒', enabled: storedSettings['comment'] ?? true },
        { id: 'follow', label: '关注通知', description: '有新用户关注您时提醒', enabled: storedSettings['follow'] ?? false },
      ],
    },
    {
      title: '宠物动态',
      items: [
        { id: 'pet_update', label: '宠物状态更新', description: '您关注的宠物有新动态', enabled: storedSettings['pet_update'] ?? true },
        { id: 'adopt_result', label: '领养结果通知', description: '您的领养申请有新进展', enabled: storedSettings['adopt_result'] ?? true },
        { id: 'new_pet', label: '新宠物上架', description: '有符合您偏好的新宠物', enabled: storedSettings['new_pet'] ?? false },
      ],
    },
    {
      title: '系统通知',
      items: [
        { id: 'system', label: '系统公告', description: '重要系统通知和公告', enabled: storedSettings['system'] ?? true },
        { id: 'activity', label: '活动推送', description: '平台活动和优惠信息', enabled: storedSettings['activity'] ?? false },
      ],
    },
  ]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/settings', { replace: true });
    }
  };

  const toggleItem = (groupTitle: string, itemId: string) => {
    setGroups(prev => {
      const updated = prev.map(group => {
        if (group.title !== groupTitle) return group;
        return {
          ...group,
          items: group.items.map(item =>
            item.id === itemId ? { ...item, enabled: !item.enabled } : item
          ),
        };
      });

      const newSettings: Record<string, boolean> = {};
      updated.forEach(group => {
        group.items.forEach(item => {
          newSettings[item.id] = item.enabled;
        });
      });
      saveSettings(newSettings);

      return updated;
    });
  };

  const allEnabled = groups.every(g => g.items.every(i => i.enabled));

  const toggleAll = () => {
    const newState = !allEnabled;
    setGroups(prev => {
      const updated = prev.map(group => ({
        ...group,
        items: group.items.map(item => ({ ...item, enabled: newState })),
      }));
      const newSettings: Record<string, boolean> = {};
      updated.forEach(group => {
        group.items.forEach(item => {
          newSettings[item.id] = item.enabled;
        });
      });
      saveSettings(newSettings);
      return updated;
    });
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col fade-in">
      <header className="px-4 py-4 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">消息通知</h1>
        <button
          onClick={toggleAll}
          className="ml-auto text-sm text-primary font-medium"
        >
          {allEnabled ? '全部关闭' : '全部开启'}
        </button>
      </header>

      <main className="p-6 space-y-6">
        {groups.map(group => (
          <div key={group.title} className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500 ml-1">{group.title}</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {group.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 ${index !== group.items.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={item.enabled}
                    onClick={() => toggleItem(group.title, item.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden ${
                      item.enabled ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        item.enabled ? 'translate-x-[26px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default NotificationSettings;
