export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed text-gray-900 dark:text-white ${
          isUser
            ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm bg-[#F3F4F6] dark:bg-[#374151]'
            : 'rounded-2xl bg-white dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600'
        }`}
      >
        {message.content}
        {!isUser && message.content.length === 0 && (
          <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse rounded-sm ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}
