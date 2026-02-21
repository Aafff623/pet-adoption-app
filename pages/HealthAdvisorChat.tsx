import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchAdoptedPets, fetchMyPublishedPets } from '../lib/api/pets';
import { sendHealthConsultation, type ChatTurn } from '../lib/api/healthAdvisor';
import BottomNav from '../components/BottomNav';
import type { Pet } from '../types';

function useUniqueId(): string {
  const [id] = useState(() => crypto.randomUUID());
  return id;
}

const HealthAdvisorChat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const sessionId = useUniqueId();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [adopted, published] = await Promise.all([
          fetchAdoptedPets(user.id),
          fetchMyPublishedPets(user.id),
        ]);
        const combined = [...adopted];
        const pubIds = new Set(adopted.map(p => p.id));
        published.forEach(p => {
          if (!pubIds.has(p.id)) combined.push(p);
        });
        setPets(combined);
        if (combined.length > 0 && !selectedPetId) {
          setSelectedPetId(combined[0].id);
        }
      } catch {
        showToast('加载宠物列表失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, showToast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setSending(true);
    try {
      const history = [...messages, { role: 'user', content: text }];
      const { reply } = await sendHealthConsultation({
        userId: user.id,
        petId: selectedPetId,
        sessionId,
        userMessage: text,
        history: history.slice(-20),
      });
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch {
      showToast('发送失败，请重试');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else {
      const petId = selectedPetId ?? pets[0]?.id;
      navigate(petId ? `/pet-health/${petId}` : '/my-pets', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-zinc-900 flex flex-col pb-20">
      <header className="px-4 py-4 flex items-center bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-50">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
          aria-label="返回"
        >
          <span className="material-icons-round text-2xl text-gray-700 dark:text-zinc-300">arrow_back</span>
        </button>
        <div className="ml-2 flex-1">
          <h1 className="font-bold text-lg text-gray-900 dark:text-zinc-100">AI 健康顾问</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">异常预警 · 健康咨询 · 居家护理</p>
        </div>
      </header>

      {pets.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700">
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">咨询宠物</p>
          <select
            value={selectedPetId ?? ''}
            onChange={e => setSelectedPetId(e.target.value || null)}
            className="w-full py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 text-sm"
          >
            <option value="">不指定</option>
            {pets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-zinc-400 text-sm">
            <span className="material-icons-round text-4xl mb-2 block opacity-60">medical_services</span>
            <p>例如：「它最近为什么频繁挠耳朵？」</p>
            <p>「食欲下降怎么办？」</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                m.role === 'user'
                  ? 'bg-primary text-black'
                  : 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-zinc-700 rounded-2xl px-4 py-2.5">
              <span className="material-icons-round text-lg animate-pulse">more_horiz</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white dark:bg-zinc-800 border-t border-gray-100 dark:border-zinc-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入健康问题..."
            className="flex-1 py-2.5 px-4 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-full bg-primary text-black disabled:opacity-50"
          >
            <span className="material-icons-round">send</span>
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
};

export default HealthAdvisorChat;
