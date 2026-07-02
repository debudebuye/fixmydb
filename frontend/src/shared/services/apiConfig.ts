export interface AIConfig {
  provider: 'openai' | 'groq' | 'openrouter' | 'gemini';
  apiKey: string;
  model: string;
  baseURL: string;
  label: string;
}

export interface ProviderOption {
  id: AIConfig['provider'];
  label: string;
  desc: string;
  pricing: string;
  models: { id: string; label: string }[];
  defaultModel: string;
  baseURL: string;
  keyHint: string;
  keyPlaceholder: string;
}

export const PROVIDERS: ProviderOption[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    desc: 'Paid — most reliable for schema analysis',
    pricing: 'Pay-per-use (~$0.001/analysis)',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    keyHint: 'Must have access to gpt-4o-mini (GPT-4 class models). Free trial credits may not work.',
    keyPlaceholder: 'sk-...',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (fastest, cheapest)' },
      { id: 'gpt-4o', label: 'GPT-4o (best quality, slower)' },
    ],
  },
  {
    id: 'groq',
    label: 'Groq',
    desc: 'Free — fast inference on open models',
    pricing: 'Free (rate-limited)',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama3-70b-8192',
    keyHint: 'Free API key from groq.com. No billing needed.',
    keyPlaceholder: 'gsk_...',
    models: [
      { id: 'llama3-70b-8192', label: 'Llama 3 70B (best quality)' },
      { id: 'llama3-8b-8192', label: 'Llama 3 8B (fastest)' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (good quality)' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B (lightweight)' },
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    desc: 'Free & paid models — unified API',
    pricing: 'Free & paid options',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    keyHint: 'Free API key from openrouter.ai/keys. Append :free to model name for free tier models.',
    keyPlaceholder: 'sk-or-...',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (free)' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (free, fast)' },
      { id: 'mistralai/mixtral-8x22b-instruct:free', label: 'Mixtral 8x22B (free)' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', label: 'Qwen 2.5 72B (free)' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (paid via OpenRouter)' },
    ],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    desc: 'Free tier via Google AI Studio — good quality',
    pricing: 'Free (rate-limited)',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    keyHint: 'Free API key from aistudio.google.com/apikey. No billing needed for free tier.',
    keyPlaceholder: 'AIza...',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast, free tier)' },
      { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite (lightweight)' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (balanced, free tier)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (best quality, may require billing)' },
    ],
  },
];

const STORAGE_KEY = 'fixmydb_ai_config';

export function getAIConfig(): AIConfig | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAIConfig(config: AIConfig): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function clearAIConfig(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Get the displayed provider label */
export function getProviderLabel(providerId: string): string {
  return PROVIDERS.find(p => p.id === providerId)?.label ?? providerId;
}
