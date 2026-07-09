import type { Message } from './components/chat/MessageBubble';

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
}

export interface InferenceParams {
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  seed?: number;
}

export interface CustomModel {
  name: string;
  apiBase: string;
  apiKey: string;
  modelId: string;
}

export interface AppSettings {
  selectedModel: string;
  customModels: CustomModel[];
  inferenceParams: InferenceParams;
}

export interface SavedState {
  conversations: Conversation[];
  messagesMap: Record<string, Message[]>;
  activeId: string;
  convCounter: number;
  settings: AppSettings;
}
