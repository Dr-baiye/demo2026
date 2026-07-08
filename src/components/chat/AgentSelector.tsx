import { Bot, Code, Lightbulb, Pencil, BarChart3, Languages } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  description: string;
}

export const agents: Agent[] = [
  {
    id: 'general',
    name: '通用助手',
    description: '全能 AI 助手，回答各类问题',
  },
  {
    id: 'code',
    name: '代码专家',
    description: '擅长编程、代码审查与技术方案',
  },
  {
    id: 'product',
    name: '产品顾问',
    description: '产品分析、竞品调研与策略建议',
  },
  {
    id: 'copywriting',
    name: '文案创作',
    description: '营销文案、品牌话术与内容润色',
  },
  {
    id: 'data',
    name: '数据分析',
    description: '数据洞察、可视化方案与报表解读',
  },
  {
    id: 'translate',
    name: '翻译专家',
    description: '多语言翻译与本地化建议',
  },
];

const agentIcons: Record<string, typeof Bot> = {
  general: Bot,
  code: Code,
  product: Lightbulb,
  copywriting: Pencil,
  data: BarChart3,
  translate: Languages,
};

function getAgentIcon(id: string) {
  const Icon = agentIcons[id] || Bot;
  return Icon;
}

interface AgentSelectorProps {
  selectedId: string;
  onSelect: (agent: Agent) => void;
}

export function getAgentById(id: string): Agent {
  return agents.find((a) => a.id === id) || agents[0];
}

export default function AgentSelector({ selectedId, onSelect }: AgentSelectorProps) {
  return (
    <div className="space-y-2">
      {agents.map((agent) => {
        const isActive = agent.id === selectedId;
        const Icon = getAgentIcon(agent.id);
        return (
          <button
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
              isActive
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-500'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isActive ? 'text-primary' : 'text-gray-900 dark:text-white'
                }`}
              >
                {agent.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {agent.description}
              </p>
            </div>
            {isActive && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
