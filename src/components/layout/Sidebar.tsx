import { Plus, Settings, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Conversation } from '../../App';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function ConversationLink({
  conv,
  isActive,
  onSelect,
  onDelete,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className={`relative group ${isActive ? 'active-conversation' : ''}`}>
      <button
        onClick={() => onSelect(conv.id)}
        className={`block w-full px-3 py-2 rounded-lg text-sm text-left truncate transition-colors pr-8 ${
          isActive
            ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        {conv.title}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conv.id);
        }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="删除会话"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

function groupByTime(
  conversations: Conversation[],
): { label: string; items: Conversation[] }[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTs = todayStart.getTime();
  const yesterdayTs = todayTs - 86400000;

  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const earlier: Conversation[] = [];

  for (const c of conversations) {
    if (c.updatedAt >= todayTs) {
      today.push(c);
    } else if (c.updatedAt >= yesterdayTs) {
      yesterday.push(c);
    } else {
      earlier.push(c);
    }
  }

  const groups: { label: string; items: Conversation[] }[] = [];
  if (today.length) groups.push({ label: '今天', items: today });
  if (yesterday.length) groups.push({ label: '昨天', items: yesterday });
  if (earlier.length) groups.push({ label: '更早', items: earlier });
  return groups;
}

export default function Sidebar({ conversations, activeId, onSelect, onCreate, onDelete }: SidebarProps) {
  const groups = groupByTime(conversations);
  const navigate = useNavigate();
  const location = useLocation();
  const isSettings = location.pathname === '/settings';

  const handleSelect = (id: string) => {
    onSelect(id);
    navigate('/');
  };

  const handleCreate = () => {
    onCreate();
    navigate('/');
  };

  const handleSettings = () => {
    navigate(isSettings ? '/' : '/settings');
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-full">
      {/* 新对话按钮 */}
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          新对话
        </button>
      </div>

      {/* 历史会话列表 */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            暂无历史会话
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((conv) => (
                  <ConversationLink
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    onSelect={handleSelect}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* 设置入口 */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
        <button
          onClick={handleSettings}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
            isSettings
              ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Settings size={18} />
          设置
        </button>
      </div>

      {/* 选中会话左侧翠绿色竖条 */}
      <style>{`
        .active-conversation::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 24px;
          background-color: #10B981;
          border-radius: 0 2px 2px 0;
        }
      `}</style>
    </aside>
  );
}
