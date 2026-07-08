import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Message } from './components/chat/MessageBubble';
import { DarkModeProvider } from './hooks/useDarkMode';
import Sidebar from './components/layout/Sidebar';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
}

interface SavedState {
  conversations: Conversation[];
  messagesMap: Record<string, Message[]>;
  activeId: string;
  convCounter: number;
}

const STORAGE_KEY = 'fgima_state';

const initialMessages: Message[] = [
  {
    id: 'm1',
    role: 'user',
    content: '帮我分析一下这个产品的目标用户画像，我有一份上个月的调研数据。',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: '好的！根据你提供的调研数据，我可以从以下几个维度帮你构建用户画像：人口统计特征、行为模式、痛点和需求优先级。你可以先把数据发给我，或者描述一下核心发现。',
  },
  {
    id: 'm3',
    role: 'user',
    content: '核心发现是 25-35 岁一二线城市的职场人群占比最高，他们对效率工具有强烈付费意愿。',
  },
];

const seedConversations: Conversation[] = [
  { id: '1', title: '产品文案优化方案讨论', updatedAt: Date.now() - 3600000 },
  { id: '2', title: 'React 组件设计思路', updatedAt: Date.now() - 7200000 },
];

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedState;
      if (
        Array.isArray(parsed.conversations) &&
        parsed.messagesMap &&
        typeof parsed.activeId === 'string' &&
        typeof parsed.convCounter === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    // 数据损坏则回退默认值
  }
  return {
    conversations: seedConversations,
    messagesMap: { '1': initialMessages, '2': [] },
    activeId: '1',
    convCounter: 2,
  };
}

export default function App() {
  const saved = loadState();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>(saved.conversations);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(saved.messagesMap);
  const [activeId, setActiveId] = useState(saved.activeId);
  const convCounterRef = { current: saved.convCounter };

  // 持久化：任意状态变化时写入 localStorage
  useEffect(() => {
    const data: SavedState = {
      conversations,
      messagesMap,
      activeId,
      convCounter: convCounterRef.current,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 存储满或隐私模式下静默失败
    }
  }, [conversations, messagesMap, activeId]);

  const handleCreate = useCallback(() => {
    convCounterRef.current++;
    const id = `${convCounterRef.current}`;
    setConversations((prev) => [
      { id, title: '新对话', updatedAt: Date.now() },
      ...prev,
    ]);
    setMessagesMap((prev) => ({ ...prev, [id]: [] }));
    setActiveId(id);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (id === activeId && remaining.length > 0) {
          setActiveId(remaining[0].id);
        }
        return remaining;
      });
      setMessagesMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [activeId],
  );

  const handleMessagesChange = useCallback(
    (convId: string, msgs: Message[]) => {
      setMessagesMap((prev) => ({ ...prev, [convId]: msgs }));
      const firstUser = msgs.find((m) => m.role === 'user');
      if (firstUser) {
        const raw = firstUser.content.replace(/\n/g, ' ');
        const title = raw.length > 15 ? raw.slice(0, 15) + '…' : raw;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, title, updatedAt: Date.now() } : c,
          ),
        );
      }
    },
    [],
  );

  return (
    <DarkModeProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-1 flex h-full min-w-0"
                >
                  <ChatPage
                    key={activeId}
                    conversationId={activeId}
                    messages={messagesMap[activeId] || []}
                    onMessagesChange={(msgs) => handleMessagesChange(activeId, msgs)}
                  />
                </motion.div>
              }
            />
            <Route
              path="/settings"
              element={
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="flex-1 flex h-full min-w-0"
                >
                  <SettingsPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </DarkModeProvider>
  );
}
