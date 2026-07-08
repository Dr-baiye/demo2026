import { forwardRef, type FormEvent, type KeyboardEvent } from 'react';
import { SendHorizonal, Loader2, Bot } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onOpenDrawer: () => void;
  selectedAgentName?: string;
  disabled?: boolean;
  isTyping?: boolean;
}

const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(
  function InputArea({ value, onChange, onSend, onOpenDrawer, selectedAgentName, disabled, isTyping }, ref) {
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!value.trim() || disabled || isTyping) return;
      onSend(value.trim());
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            {/* 智能体切换按钮 */}
            <button
              type="button"
              onClick={onOpenDrawer}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={`当前：${selectedAgentName || '通用助手'} — 点击切换`}
            >
              <Bot size={18} />
            </button>

            {/* 输入框 */}
            <textarea
              ref={ref}
              rows={1}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息，Enter 发送，Shift+Enter 换行"
              disabled={disabled}
              className="flex-1 bg-transparent resize-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none py-2 leading-relaxed"
              style={{ minHeight: '2.5rem', maxHeight: '8rem' }}
            />

            {/* 发送按钮 */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={disabled || isTyping || !value.trim()}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="发送"
            >
              {isTyping ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <SendHorizonal size={16} />
              )}
            </button>
          </div>

          {/* 底部提示 */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
            AI 助手可能会产生不准确的信息，请注意甄别
          </p>
        </div>
      </div>
    );
  }
);

export default InputArea;
