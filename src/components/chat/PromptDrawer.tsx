interface PromptCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

const promptCards: PromptCard[] = [
  {
    id: 'p1',
    title: '产品分析',
    description: '帮我分析产品目标用户画像',
    prompt: '帮我分析一下这个产品的目标用户画像，我有一份上个月的调研数据。',
  },
  {
    id: 'p2',
    title: '竞品调研',
    description: '撰写竞品分析报告框架',
    prompt: '请帮我撰写一份竞品分析报告的框架，包含市场定位、功能对比、优劣势分析等维度。',
  },
  {
    id: 'p3',
    title: '文案润色',
    description: '优化产品文案和营销话术',
    prompt: '请帮我润色以下产品文案，使其更具吸引力和转化率，同时保持专业调性。',
  },
  {
    id: 'p4',
    title: '代码 Review',
    description: '审查代码逻辑和性能问题',
    prompt: '请帮我审查以下 React 组件代码，重点关注性能优化、状态管理和潜在的内存泄漏问题。',
  },
  {
    id: 'p5',
    title: '会议纪要',
    description: '将讨论要点整理为会议纪要',
    prompt: '请帮我把以下讨论要点整理成一份结构清晰的会议纪要，包含结论和待办事项。',
  },
  {
    id: 'p6',
    title: '数据可视化',
    description: '推荐合适的图表类型和方案',
    prompt: '我有一组时间序列数据和分类对比数据，请帮我推荐最合适的图表类型和可视化方案。',
  },
];

interface PromptDrawerProps {
  onPickPrompt: (prompt: string) => void;
}

export default function PromptDrawer({ onPickPrompt }: PromptDrawerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {promptCards.map((card) => (
        <PromptCardItem
          key={card.id}
          card={card}
          onPick={() => onPickPrompt(card.prompt)}
        />
      ))}
    </div>
  );
}

function PromptCardItem({
  card,
  onPick,
}: {
  card: PromptCard;
  onPick: () => void;
}) {
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500 transition-colors">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{card.title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 mb-3">
        {card.description}
      </p>
      <button
        onClick={onPick}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
      >
        填入
      </button>
    </div>
  );
}
