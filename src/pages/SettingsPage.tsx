import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, ChevronDown, Plus, X, Trash2 } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import type { InferenceParams, AppSettings, CustomModel } from '../types';

type MenuKey = 'general' | 'model' | 'about';

const menuItems: { key: MenuKey; label: string }[] = [
  { key: 'general', label: '通用' },
  { key: 'model', label: '模型' },
  { key: 'about', label: '关于' },
];

const presetModels = [
  { label: 'GPT-5.5', value: 'gpt-5.5', provider: 'OpenAI' },
  { label: 'Claude Fable 5', value: 'claude-fable-5', provider: 'Anthropic' },
  { label: 'Claude Opus 4.8', value: 'claude-opus-4.8', provider: 'Anthropic' },
  { label: 'Gemini 3.5 Flash', value: 'gemini-3.5-flash', provider: 'Google' },
  { label: 'DeepSeek V4 Pro', value: 'deepseek-v4-pro', provider: 'DeepSeek' },
  { label: 'DeepSeek V4 Flash', value: 'deepseek-v4-flash', provider: 'DeepSeek' },
  { label: 'Qwen3.7 Max', value: 'qwen3.7-max', provider: '阿里云' },
  { label: 'GLM-5.2', value: 'glm-5.2', provider: '智谱' },
  { label: 'Kimi K2.7 Code', value: 'kimi-k2.7-code', provider: '月之暗面' },
  { label: 'Grok 4.20', value: 'grok-4.20', provider: 'xAI' },
  { label: 'Llama 4 (本地)', value: 'llama4', provider: 'Ollama' },
];

function ParamSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  leftLabel,
  rightLabel,
  tooltip,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  leftLabel?: string;
  rightLabel?: string;
  tooltip?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {tooltip && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500">({tooltip})</span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {leftLabel && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 w-10 text-right">
              {leftLabel}
            </span>
          )}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="temperature-slider flex-1"
          />
          {rightLabel && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 w-10">
              {rightLabel}
            </span>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          {value.toFixed(step < 0.1 ? 2 : 1)}
        </p>
      </div>
    </div>
  );
}

interface SettingsPageProps {
  settings: AppSettings;
  onSettingsChange: (s: AppSettings) => void;
}

export default function SettingsPage({ settings, onSettingsChange }: SettingsPageProps) {
  const { isDark, toggle } = useDarkMode();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('general');

  // 模型相关
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newCustom, setNewCustom] = useState<CustomModel>({
    name: '',
    apiBase: '',
    apiKey: '',
    modelId: '',
  });

  const { inferenceParams, selectedModel, customModels } = settings;

  const updateInference = (patch: Partial<InferenceParams>) => {
    onSettingsChange({
      ...settings,
      inferenceParams: { ...inferenceParams, ...patch },
    });
  };

  const handleAddCustom = () => {
    if (!newCustom.name.trim() || !newCustom.modelId.trim()) return;
    const updated = [...customModels, { ...newCustom }];
    onSettingsChange({
      ...settings,
      customModels: updated,
      selectedModel: newCustom.modelId,
    });
    setNewCustom({ name: '', apiBase: '', apiKey: '', modelId: '' });
    setShowCustomForm(false);
    setDropdownOpen(false);
  };

  const handleRemoveCustom = (modelId: string) => {
    const updated = customModels.filter((m) => m.modelId !== modelId);
    onSettingsChange({
      ...settings,
      customModels: updated,
      selectedModel: selectedModel === modelId ? 'gpt-5.5' : selectedModel,
    });
  };

  const handleSelectModel = (value: string) => {
    if (value === '__custom__') {
      setShowCustomForm(true);
      setDropdownOpen(false);
      return;
    }
    onSettingsChange({ ...settings, selectedModel: value });
    setDropdownOpen(false);
  };

  const handleClearData = () => {
    localStorage.removeItem('fgima_state');
    window.location.reload();
  };

  const selectedLabel =
    presetModels.find((m) => m.value === selectedModel)?.label ||
    customModels.find((m) => m.modelId === selectedModel)?.name ||
    '未选择';

  return (
    <div className="flex-1 flex h-full min-w-0 dark:bg-gray-800">
      {/* ---- 左侧菜单 ---- */}
      <nav className="w-48 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
        <div className="px-4 pt-5 pb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            设置
          </p>
        </div>
        <ul className="px-2 flex-1 space-y-0.5">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActiveMenu(item.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeMenu === item.key
                    ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---- 右侧内容 ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </Link>

          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={isDark ? '切换亮色模式' : '切换暗色模式'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ========== 通用设置 ========== */}
          {activeMenu === 'general' && (
            <div className="max-w-lg space-y-8">
              <section>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  通用设置
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  语言、界面等基础配置（待扩展）
                </p>
              </section>

              <section className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  数据管理
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  清除所有本地缓存数据，包括历史会话和设置。此操作不可撤销。
                </p>
                {showClearConfirm ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      确认清除
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={16} />
                    清除所有缓存数据
                  </button>
                )}
              </section>
            </div>
          )}

          {/* ========== 模型设置 ========== */}
          {activeMenu === 'model' && (
            <div className="max-w-xl space-y-10">
              {/* ---- 模型选择 ---- */}
              <section>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  模型选择
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  选择预设主流模型或添加自定义 API / 本地模型
                </p>

                {/* 下拉选框 */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                  >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      {/* 点击空白处关闭 */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                        {/* 分组：云端模型 */}
                        <p className="px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                          云端大模型
                        </p>
                        {presetModels.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => handleSelectModel(m.value)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                              selectedModel === m.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            <span>{m.label}</span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                              {m.provider}
                            </span>
                          </button>
                        ))}

                        {/* 分组：自定义模型 */}
                        {customModels.length > 0 && (
                          <>
                            <div className="border-t border-gray-100 dark:border-gray-600 mt-1 pt-1" />
                            <p className="px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                              自定义模型
                            </p>
                            {customModels.map((m) => (
                              <button
                                key={m.modelId}
                                onClick={() => handleSelectModel(m.modelId)}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between group ${
                                  selectedModel === m.modelId
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                <span className="truncate">{m.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustom(m.modelId);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0 text-gray-400 hover:text-red-500 transition-all"
                                  title="删除此模型"
                                >
                                  <X size={14} />
                                </button>
                              </button>
                            ))}
                          </>
                        )}

                        {/* 添加自定义 */}
                        <div className="border-t border-gray-100 dark:border-gray-600 mt-1 pt-1" />
                        <button
                          onClick={() => handleSelectModel('__custom__')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Plus size={14} />
                          添加自定义模型
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* 自定义模型表单 */}
                {showCustomForm && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        添加自定义模型
                      </h4>
                      <button
                        onClick={() => setShowCustomForm(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          显示名称
                        </label>
                        <input
                          type="text"
                          value={newCustom.name}
                          onChange={(e) => setNewCustom((p) => ({ ...p, name: e.target.value }))}
                          placeholder="我的模型"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          模型 ID
                        </label>
                        <input
                          type="text"
                          value={newCustom.modelId}
                          onChange={(e) => setNewCustom((p) => ({ ...p, modelId: e.target.value }))}
                          placeholder="gpt-5.5 / llama4"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                        API 基础地址
                      </label>
                      <input
                        type="text"
                        value={newCustom.apiBase}
                        onChange={(e) => setNewCustom((p) => ({ ...p, apiBase: e.target.value }))}
                        placeholder="https://api.openai.com/v1 或 http://localhost:11434/v1"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        云端 API 填写服务商地址，Ollama 本地模型填写 http://localhost:11434/v1
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                        API Key（选填）
                      </label>
                      <input
                        type="password"
                        value={newCustom.apiKey}
                        onChange={(e) => setNewCustom((p) => ({ ...p, apiKey: e.target.value }))}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      onClick={handleAddCustom}
                      disabled={!newCustom.name.trim() || !newCustom.modelId.trim()}
                      className="w-full py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      保存并使用
                    </button>
                  </div>
                )}
              </section>

              {/* ---- 参数设置 ---- */}
              <section>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  推理参数
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                  调整参数控制模型输出风格，不同模型支持的参数可能不同
                </p>

                <div className="space-y-6">
                  <ParamSlider
                    label="温度 (Temperature)"
                    tooltip="控制随机性，越高越有创意"
                    value={inferenceParams.temperature}
                    onChange={(v) => updateInference({ temperature: v })}
                    min={0}
                    max={2}
                    step={0.1}
                    leftLabel="精确"
                    rightLabel="创意"
                  />

                  <ParamSlider
                    label="Top P（核采样）"
                    tooltip="累积概率阈值，过滤低概率 token"
                    value={inferenceParams.topP}
                    onChange={(v) => updateInference({ topP: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    leftLabel="窄"
                    rightLabel="宽"
                  />

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        最大 Token 数
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        (单次回复的最大长度)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={128}
                        max={32768}
                        step={128}
                        value={inferenceParams.maxTokens}
                        onChange={(e) => updateInference({ maxTokens: parseInt(e.target.value) || 4096 })}
                        className="w-28 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                      />
                      <input
                        type="range"
                        min={128}
                        max={32768}
                        step={128}
                        value={inferenceParams.maxTokens}
                        onChange={(e) => updateInference({ maxTokens: parseInt(e.target.value) })}
                        className="temperature-slider flex-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <ParamSlider
                      label="频率惩罚"
                      tooltip="降低重复词频率"
                      value={inferenceParams.frequencyPenalty}
                      onChange={(v) => updateInference({ frequencyPenalty: v })}
                      min={-2}
                      max={2}
                      step={0.1}
                      leftLabel="重复"
                      rightLabel="多样"
                    />
                    <ParamSlider
                      label="存在惩罚"
                      tooltip="鼓励引入新话题"
                      value={inferenceParams.presencePenalty}
                      onChange={(v) => updateInference({ presencePenalty: v })}
                      min={-2}
                      max={2}
                      step={0.1}
                      leftLabel="聚焦"
                      rightLabel="发散"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        随机种子 (Seed)
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        (固定后相同输入得到相同输出)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inferenceParams.seed ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateInference({ seed: v === '' ? undefined : parseInt(v) });
                        }}
                        placeholder="留空为随机"
                        className="w-36 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-primary"
                      />
                      {inferenceParams.seed !== undefined && (
                        <button
                          onClick={() => updateInference({ seed: undefined })}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ========== 关于 ========== */}
          {activeMenu === 'about' && (
            <div className="max-w-lg space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                关于
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>AI 对话工作台 v1.0</p>
                <p>
                  一个简洁高效的 AI 对话工具，支持多模型切换与个性化参数调节，
                  可接入主流云端大模型及本地 Ollama 模型。
                </p>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Built with React + Tailwind CSS
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
