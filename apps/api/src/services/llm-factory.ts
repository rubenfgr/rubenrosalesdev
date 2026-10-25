import type { Env } from '../env';
import { GeminiClient } from './gemini';
import type { LlmClient } from './llm';

/** `null` si el LLM está apagado o falta configuración (la API responde `llm_unavailable` y la web degrada a reglas). */
export function createLlmClient(env: Env): LlmClient | null {
  if (env.ASSISTANT_LLM_ENABLED !== '1') return null;
  if (env.ASSISTANT_LLM_PROVIDER === 'gemini') {
    if (!env.ASSISTANT_LLM_API_KEY || !env.ASSISTANT_LLM_MODEL) return null;
    return new GeminiClient({ apiKey: env.ASSISTANT_LLM_API_KEY, model: env.ASSISTANT_LLM_MODEL });
  }
  return null; // ollama: T-3.9
}
