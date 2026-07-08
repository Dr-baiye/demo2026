import { useState, useRef, useCallback, useEffect } from 'react';
import type { Message } from '../components/chat/MessageBubble';
import MessageBubble from '../components/chat/MessageBubble';
import InputArea from '../components/chat/InputArea';
import Drawer from '../components/common/Drawer';
import AgentSelector, { agents, type Agent } from '../components/chat/AgentSelector';

const responsesByAgent: Record<string, string[]> = {
  general: [
    '这是一个很有价值的洞察！25-35 岁一二线城市的职场人群确实是效率工具的核心付费群体。\n\n基于你的发现，我建议从以下角度深化分析：\n\n1. 使用场景：他们主要在哪些工作环节使用效率工具？日常沟通、任务管理还是数据分析？\n\n2. 付费驱动因素：是节省时间、提升产出质量，还是降低沟通成本？\n\n3. 竞品参考：可以对比 Notion、飞书等产品在这一人群中的渗透情况。\n\n需要我针对某个方向进一步展开吗？',
    '明白了，这是一个非常重要的发现。\n\n根据行业数据，25-35 岁职场人群的典型特征是：\n\n• 工作 3-10 年，处于职业上升期\n• 对效率提升有强烈诉求\n• 付费决策理性，看重 ROI\n• 偏好简洁、专业的产品体验\n\n建议在产品设计中重点关注这些需求。',
    '分析得很好！结合你的发现，我补充几点建议：\n\n1. 产品定位：聚焦「专业效率」，避免泛化\n2. 定价策略：可考虑按月订阅 + 年付折扣的组合\n3. 增长策略：通过职场 KOL 和内容营销触达目标用户\n4. 差异化：在 AI 能力和数据安全方面建立壁垒',
  ],
  code: [
    '分析你的需求，建议采用以下技术方案：\n\n```typescript\ninterface UserProfile {\n  ageRange: [number, number];\n  city: string;\n  jobType: string;\n}\n```\n\n1. 数据层：使用类型安全的接口定义用户画像模型\n2. 展示层：用 Recharts 绘制年龄和城市分布图\n3. 状态管理：如果跨组件共享，建议用 Context 或 Zustand\n\n需要我帮你写具体实现吗？',
    '从代码架构角度，这个功能可以这样设计：\n\n```typescript\n// hooks/useUserProfile.ts\nexport function useUserProfile(filters: Filter) {\n  const { data, loading } = useQuery(...);\n  return { data, loading };\n}\n```\n\n关键点：\n• 自定义 Hook 封装数据获取逻辑\n• TypeScript 泛型保证类型安全\n• 错误边界处理异常情况',
    '从性能角度考虑：\n\n1. 用户画像数据建议用虚拟列表渲染（大数据量时）\n2. 过滤条件变化时防抖请求\n3. 图表组件用 React.memo 避免不必要重渲染\n4. 考虑用 Web Worker 做数据聚合计算\n\n需要我针对某个点深入讲讲吗？',
  ],
  product: [
    '作为产品顾问，我建议从用户旅程地图入手：\n\n**用户画像关键维度**\n1. 行为特征：工作日高频使用，周末低频\n2. 痛点：协作效率低、信息碎片化\n3. 期望：一站式工作台，减少 App 切换\n\n建议下一步做用户访谈验证这些假设。',
    '产品定位建议：\n\n• 核心价值主张：让职场人每天节省 1 小时\n• 目标市场：一二线城市 25-35 岁知识工作者\n• 差异化：AI 原生体验，而非传统工具的 AI 插件\n\n需要我输出一份完整的产品 PRD 框架吗？',
    '竞品分析洞察：\n\n| 竞品 | 优势 | 劣势 |\n|------|------|------|\n| Notion | 灵活强大 | 学习曲线陡 |\n| 飞书 | 协作一体 | 功能臃肿 |\n| 我们的机会 | 聚焦效率 | — |\n\n建议主打「轻量」和「AI 深度集成」两个卖点。',
  ],
  copywriting: [
    '基于你的调研发现，我帮你写了几版产品文案：\n\n**版本一（理性诉求）**\n「每天节省 1 小时，把精力留给真正重要的事。」\n\n**版本二（情感共鸣）**\n「你不是效率低，只是缺一个好工具。」\n\n**版本三（社交证明）**\n「已有 10 万+ 职场人选择的效率工作台。」',
    '品牌的调性建议：\n\n1. 关键词：专业、高效、可信赖\n2. 视觉风格：简洁克制，翠绿色主调\n3. 文案语气：温和自信，不夸张不贬低\n\n需要我帮你写一份完整的品牌指南吗？',
    '广告文案短版：\n\n「开会、写稿、做报表？交给 AI，你只管思考。」\n「一键切换智能体，每个角色都有专属助手。」\n\n建议 A/B 测试这两版文案的点击率。',
  ],
  data: [
    '基于你的数据洞察，我绘制了用户画像的核心指标：\n\n• 25-35 岁占比：62%（最高密度区间）\n• 一二线城市占比：78%\n• 付费意愿强烈：81%（5 分制中 4+）\n• 日均使用：2.3 小时（工作场景）\n\n建议用堆叠柱状图对比各年龄段付费意愿。',
    '数据分析补充建议：\n\n1. 对用户做 RFM 分层（最近使用、频率、金额）\n2. 用桑基图展示用户从注册到付费的转化路径\n3. 做 Cohorts 分析看不同时段注册用户的留存差异\n\n这些分析可以帮助产品团队做出更精准的迭代决策。',
    '可视化方案推荐：\n\n• 年龄分布 → 直方图\n• 城市分布 → 气泡地图\n• 付费意愿 → 箱线图（按年龄段分组）\n• 使用频率 → 热力图（按日期 × 时段）\n\n推荐用 ECharts 实现，交互体验最佳。',
  ],
  translate: [
    'English translation of the user persona summary:\n\n**Key Finding**\nThe largest user segment consists of professionals aged 25-35 in Tier 1 and Tier 2 cities, with strong willingness to pay for productivity tools.\n\n如有其他语种需求（日语、韩语等），请告知。',
    'Japanese translation:\n\n**主な発見**\n最大のユーザー層は 25〜35 歳の一線都市・二線都市のプロフェッショナルで、生産性ツールへの支払い意欲が高いです。\n\n需要多语言版本的文案也可以告诉我。',
    '多语言本地化建议：\n\n• 英语：专业直接，突出效率 (Productivity)\n• 日语：礼貌谦逊，强调省时 (時短)\n• 韩语：年轻活力，突出智能 (AI)\n\n建议优先中英文版本，后续按市场反馈逐步扩展。',
  ],
};

let messageCounter = 3;

function generateId(): string {
  messageCounter++;
  return `m${messageCounter}`;
}

function pickResponse(agentId: string): string {
  const pool = responsesByAgent[agentId] || responsesByAgent.general;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface ChatPageProps {
  conversationId: string;
  messages: Message[];
  onMessagesChange: (msgs: Message[]) => void;
}

export default function ChatPage({ messages, onMessagesChange }: ChatPageProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const onMessagesChangeRef = useRef(onMessagesChange);
  onMessagesChangeRef.current = onMessagesChange;
  const currentAgentRef = useRef(selectedAgent);
  currentAgentRef.current = selectedAgent;

  // 卸载时停定时器
  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const userMsg: Message = { id: generateId(), role: 'user', content: text };
      const aiMsg: Message = { id: generateId(), role: 'assistant', content: '' };
      const baseMsgs = messages; // 发送前的消息列表，闭包锁定

      // 第一步：追加用户消息 + 空白 AI 消息
      onMessagesChangeRef.current([...baseMsgs, userMsg, aiMsg]);
      setInputValue('');
      setIsTyping(true);

      const fullResponse = pickResponse(currentAgentRef.current.id);
      let charIndex = 0;

      typingTimerRef.current = window.setInterval(() => {
        charIndex++;
        if (charIndex <= fullResponse.length) {
          // 每次基于锁定基准 + 用户消息 + 逐字 AI，不会累积
          onMessagesChangeRef.current([
            ...baseMsgs,
            userMsg,
            { ...aiMsg, content: fullResponse.slice(0, charIndex) },
          ]);
        } else {
          if (typingTimerRef.current !== null) {
            window.clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setIsTyping(false);
        }
      }, 50);
    },
    [messages],
  );

  const handleSelectAgent = useCallback(
    (agent: Agent) => {
      setSelectedAgent(agent);
      setDrawerOpen(false);
      const notice: Message = {
        id: generateId(),
        role: 'assistant',
        content: `已切换至「${agent.name}」智能体，我将以 ${agent.description} 的身份为你服务。`,
      };
      onMessagesChangeRef.current([...messages, notice]);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 350);
    },
    [messages],
  );

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-gray-800">
      {/* 对话流区域 */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* 欢迎语 */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-32 pb-12">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-white tracking-tight mb-3">
              今天想一起探索什么？
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              当前智能体：{selectedAgent.name} · 点击输入框左侧图标切换
            </p>
          </div>
        )}

        {/* 消息列表 */}
        <div className="max-w-2xl mx-auto space-y-6 py-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      {/* 输入区 */}
      <InputArea
        ref={textareaRef}
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        onOpenDrawer={() => setDrawerOpen(true)}
        selectedAgentName={selectedAgent.name}
        isTyping={isTyping}
      />

      {/* 智能体选择抽屉 */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="选择智能体"
      >
        <AgentSelector
          selectedId={selectedAgent.id}
          onSelect={handleSelectAgent}
        />
      </Drawer>
    </main>
  );
}
