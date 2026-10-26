// Un turno de chat: reglas → caché → LLM → validador de cifras (el asistente no da ningún importe en euros).
// Decisión de streaming (T-3.7): la respuesta del LLM se bufferiza entera (≤ 300 tokens), se valida y se emite después en
// frases. Así nunca sale una cifra no autorizada y no hace falta retractar texto ya enviado.
import { matchRule, type ChatRequest, type Lang } from '@rr/shared';
import type { Knowledge } from '@rr/shared/knowledge';
import { type AnswerCache } from './answer-cache';
import type { LlmClient, LlmTurn, LlmUsage } from './llm';
import { buildSystemPrompt, promptMarkers } from './prompt';
import { checkAmounts, extractAmounts, leaksPrompt } from './validator';

/** Acciones de las reglas que se responden con el guion, sin llamar al LLM. */
const DIRECT_ACTIONS = ['precio', 'plazo', 'info', 'humano', 'como'];
export const HISTORY_MESSAGES = 6;
export const HISTORY_CHARS = 500;
export const MAX_LLM_USER_MESSAGES = 12;

export interface ChatDeps {
  knowledge: Knowledge;
  llm: LlmClient;
  cache: AnswerCache;
  maxOutputTokens: number;
  /** Se llama al terminar cada respuesta del LLM con el uso de tokens (control de coste). */
  recordUsage?: (usage: LlmUsage) => void;
  /** Se consulta antes de cada llamada al LLM (tope mensual, límite diario por IP). */
  allowLlm?: () => boolean;
  /** Aviso (sin contenido) de que el validador sustituyó una respuesta. */
  onBlocked?: () => void;
}

export type ChatEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; source: 'rule' | 'cache' | 'llm' }
  | { type: 'error'; error: 'llm_unavailable' };

const sentences = (text: string): string[] => text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
const hasPersonalData = (text: string): boolean => /\S+@\S+\.\S+/.test(text) || /\d[\d\s().-]{6,}\d/.test(text);

export async function* chatTurn(deps: ChatDeps, req: ChatRequest, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
  const { knowledge: k } = deps;
  const lang: Lang = req.lang;
  const A = k.assistant[lang];
  const last = req.messages[req.messages.length - 1]!;
  if (last.role !== 'user') {
    yield { type: 'error', error: 'llm_unavailable' };
    return;
  }
  const fallback = A.actions.fallback!.say.join('\n\n');
  const emit = function* (text: string): Generator<ChatEvent> {
    for (const part of sentences(text)) yield { type: 'delta', text: part };
  };

  // 1. Reglas primero: sin coste.
  const action = matchRule(A.rules, last.content);
  if (action && DIRECT_ACTIONS.includes(action) && A.actions[action]) {
    yield* emit(A.actions[action]!.say.join('\n\n'));
    yield { type: 'done', source: 'rule' };
    return;
  }

  // 2. Caché (solo preguntas sueltas y sin datos personales).
  const cacheable = req.messages.length === 1 && !hasPersonalData(last.content);
  if (cacheable) {
    const hit = await deps.cache.get(lang, last.content);
    if (hit) {
      yield* emit(hit);
      yield { type: 'done', source: 'cache' };
      return;
    }
  }

  // 3. Límites: por conversación y los que decida quien llama (mensual, diario por IP).
  const userMessages = req.messages.filter((m) => m.role === 'user').length;
  if (userMessages > MAX_LLM_USER_MESSAGES || (deps.allowLlm && !deps.allowLlm())) {
    yield { type: 'error', error: 'llm_unavailable' };
    return;
  }

  // 4. LLM: historial corto y recortado, prompt mínimo.
  const turns: LlmTurn[] = req.messages.slice(-HISTORY_MESSAGES).map((m) => ({ role: m.role, text: m.content.slice(0, HISTORY_CHARS) }));
  const system = buildSystemPrompt(lang, k, { question: last.content });
  let text = '';
  for await (const ev of deps.llm.stream({ system, turns, maxOutputTokens: deps.maxOutputTokens, temperature: 0.3, ...(signal ? { signal } : {}) })) {
    if (ev.type === 'text') text += ev.text;
    else if (ev.type === 'done') deps.recordUsage?.(ev.usage);
    else if (ev.type === 'error') {
      yield { type: 'error', error: 'llm_unavailable' };
      return;
    }
  }

  // 5. Validador: ningún importe en euros ni fragmentos del prompt llegan al visitante; si los hay, se deriva a Rubén.
  text = text.trim();
  let final = text || fallback;
  if (!checkAmounts(final, []).ok || leaksPrompt(final, promptMarkers(lang))) {
    deps.onBlocked?.();
    final = fallback;
  }
  yield* emit(final);
  if (final !== fallback && cacheable && extractAmounts(final).length === 0) await deps.cache.set(lang, last.content, final);
  yield { type: 'done', source: 'llm' };
}
