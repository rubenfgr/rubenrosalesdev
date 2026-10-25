// Un turno de chat: reglas → caché → LLM (con herramienta `estimate`) → validador de cifras.
// Decisión de streaming (T-3.7): la respuesta del LLM se bufferiza entera (≤ 300 tokens), se valida y se emite después en
// frases. Así nunca sale una cifra no autorizada y no hace falta retractar texto ya enviado.
import { estimate, matchRule, type ChatRequest, type Estimate, type Lang } from '@rr/shared';
import type { Knowledge } from '@rr/shared/knowledge';
import { type AnswerCache } from './answer-cache';
import type { LlmClient, LlmTurn, LlmUsage } from './llm';
import { buildSystemPrompt } from './prompt';
import { estimateTool, runEstimate, toolResult } from './tools';
import { checkAmounts, extractAmounts } from './validator';

/** Acciones de las reglas que se responden con el guion, sin llamar al LLM. */
const DIRECT_ACTIONS = ['precio', 'plazo', 'info', 'humano', 'como'];
export const HISTORY_MESSAGES = 6;
export const HISTORY_CHARS = 500;
export const MAX_LLM_USER_MESSAGES = 12;
const MAX_TOOL_ITERATIONS = 3;

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
  | { type: 'done'; source: 'rule' | 'cache' | 'llm'; estimate?: Estimate }
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

  // 2. Caché (solo preguntas sueltas, sin contexto de estimación y sin datos personales).
  const cacheable = req.messages.length === 1 && !req.ctx && !hasPersonalData(last.content);
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

  // 4. LLM con la herramienta `estimate`.
  const authorised: Estimate[] = [];
  const { type, systems, team } = req.ctx ?? {};
  if (type && systems && team) {
    const known = estimate(k.pricing, { type, systems, team });
    if (known) authorised.push(known);
  }
  const turns: LlmTurn[] = req.messages
    .slice(-HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, text: m.content.slice(0, HISTORY_CHARS) }));
  const system = buildSystemPrompt(lang, k, { question: last.content });
  const tools = [estimateTool(k, lang)];
  let text = '';
  let usedTool = false;
  let finished = false;

  for (let i = 0; i < MAX_TOOL_ITERATIONS && !finished; i++) {
    const calls: { name: string; args: Record<string, unknown> }[] = [];
    text = '';
    for await (const ev of deps.llm.stream({ system, turns, tools, maxOutputTokens: deps.maxOutputTokens, temperature: 0.3, ...(signal ? { signal } : {}) })) {
      if (ev.type === 'text') text += ev.text;
      else if (ev.type === 'tool_call') calls.push({ name: ev.name, args: ev.args });
      else if (ev.type === 'done') deps.recordUsage?.(ev.usage);
      else {
        yield { type: 'error', error: 'llm_unavailable' };
        return;
      }
    }
    if (!calls.length) {
      finished = true;
      break;
    }
    usedTool = true;
    for (const call of calls) {
      const outcome = call.name === 'estimate' ? runEstimate(k, lang, call.args) : ({ ok: false } as const);
      if (outcome.ok) authorised.push(outcome.estimate);
      turns.push({ role: 'tool_call', name: call.name, args: call.args }, { role: 'tool_result', name: call.name, result: toolResult(outcome) });
    }
  }

  // 5. Validador de cifras: si algo no sale de `estimate()`, se sustituye por el texto de derivación.
  text = text.trim();
  let final = finished && text ? text : fallback;
  if (!checkAmounts(final, authorised).ok) {
    deps.onBlocked?.();
    final = fallback;
  }
  yield* emit(final);
  if (final !== fallback && cacheable && !usedTool && extractAmounts(final).length === 0) await deps.cache.set(lang, last.content, final);
  const est = authorised[authorised.length - 1];
  yield { type: 'done', source: 'llm', ...(est ? { estimate: est } : {}) };
}

