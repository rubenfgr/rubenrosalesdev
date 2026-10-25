import type { Env } from '../env';
import type { BudgetGuard } from './budget';
import { GeminiClient } from './gemini';
import { RoutedLlm } from './llm-router';
import { OllamaClient } from './ollama';
import type { LlmClient } from './llm';

const gemini = (env: Env): LlmClient | null =>
  env.ASSISTANT_LLM_API_KEY && env.ASSISTANT_LLM_MODEL ? new GeminiClient({ apiKey: env.ASSISTANT_LLM_API_KEY, model: env.ASSISTANT_LLM_MODEL }) : null;
const ollama = (env: Env): LlmClient | null => (env.OLLAMA_MODEL ? new OllamaClient({ baseUrl: env.OLLAMA_BASE_URL, model: env.OLLAMA_MODEL }) : null);

/**
 * `null` si el LLM está apagado o falta configuración (la API responde `llm_unavailable` y la web degrada a reglas).
 * Con Gemini, sin precios configurados no se usa: sin ellos el tope de gasto no podría calcularse.
 */
export function createLlmClient(env: Env, budget: BudgetGuard): RoutedLlm | null {
  if (env.ASSISTANT_LLM_ENABLED !== '1') return null;
  if (env.ASSISTANT_LLM_PROVIDER === 'ollama') {
    const o = ollama(env);
    return o ? new RoutedLlm(null, o, budget) : null;
  }
  const g = gemini(env);
  if (!g) return null;
  if (env.ASSISTANT_LLM_PRICE_IN_PER_MTOK <= 0 || env.ASSISTANT_LLM_PRICE_OUT_PER_MTOK <= 0) {
    console.error('llm: faltan ASSISTANT_LLM_PRICE_IN/OUT_PER_MTOK; el LLM queda desactivado (no se puede calcular el tope de gasto)');
    return null;
  }
  return new RoutedLlm(g, ollama(env), budget);
}
