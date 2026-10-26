// Evals del asistente contra el LLM real (T-9.2). Solo se ejecuta si hay clave en el entorno; no corre en CI.
//   ASSISTANT_LLM_API_KEY=… ASSISTANT_LLM_MODEL=gemini-3.5-flash-lite pnpm --filter @rr/api eval [--out informe.md]
import { writeFileSync } from 'node:fs';
import { knowledge } from '@rr/shared/knowledge';
import { loadEnv } from '../src/env';
import { MemoryAnswerCache } from '../src/services/answer-cache';
import { chatTurn } from '../src/services/chat';
import { GeminiClient } from '../src/services/gemini';
import type { LlmClient } from '../src/services/llm';
import { OllamaClient } from '../src/services/ollama';
import cases from './cases.json' with { type: 'json' };
import { check, type Expect } from './checks';

const env = loadEnv({ DATABASE_URL: 'unused', ...process.env });
let llm: LlmClient;
if (env.ASSISTANT_LLM_PROVIDER === 'ollama' && env.OLLAMA_MODEL) llm = new OllamaClient({ baseUrl: env.OLLAMA_BASE_URL, model: env.OLLAMA_MODEL });
else if (env.ASSISTANT_LLM_API_KEY && env.ASSISTANT_LLM_MODEL) llm = new GeminiClient({ apiKey: env.ASSISTANT_LLM_API_KEY, model: env.ASSISTANT_LLM_MODEL });
else {
  console.log('Sin clave: define ASSISTANT_LLM_API_KEY y ASSISTANT_LLM_MODEL (o ASSISTANT_LLM_PROVIDER=ollama y OLLAMA_MODEL). No se ejecuta nada.');
  process.exit(0);
}

const rows: string[] = [];
let failed = 0;
let llmCalls = 0;
let tokensIn = 0;
let tokensOut = 0;
for (const c of cases as { id: string; lang: 'es' | 'en'; messages: { role: 'user' | 'assistant'; content: string }[]; ctx?: object; expect: Expect }[]) {
  let text = '';
  let source = '';
  const callsBefore = llmCalls;
  await (async () => {
    for await (const ev of chatTurn(
      { knowledge, llm, cache: new MemoryAnswerCache(), maxOutputTokens: env.ASSISTANT_LLM_MAX_OUTPUT_TOKENS, recordUsage: (u) => ((llmCalls++), (tokensIn += u.tokensIn), (tokensOut += u.tokensOut)) },
      { lang: c.lang, messages: c.messages, ...(c.ctx ? { ctx: c.ctx } : {}) } as never,
    )) {
      if (ev.type === 'delta') text += ev.text;
      else if (ev.type === 'done') source = ev.source;
      else source = ev.error;
    }
  })();
  // El plan gratuito de Gemini limita las peticiones por minuto: pausa entre llamadas (EVAL_PAUSE_MS, 4500 por defecto).
  if (llmCalls > callsBefore) await new Promise((r) => setTimeout(r, Number(process.env.EVAL_PAUSE_MS ?? 4500)));
  const blocked = text.trim() === knowledge.assistant[c.lang].actions.fallback!.say.join('\n\n').trim() && source === 'llm';
  const fails = source === 'llm_unavailable' ? ['LLM no disponible'] : check(c.lang, c.expect, { text, source });
  if (fails.length) failed++;
  rows.push(`| ${c.id} | ${fails.length ? 'FALLA' : 'ok'} | ${source}${blocked ? ' (bloqueada por el validador)' : ''} | ${fails.join('; ')} | ${text.replace(/\s+/g, ' ').slice(0, 160).replace(/\|/g, '/')} |`);
}

const report = [
  `# Evals del asistente (${new Date().toISOString().slice(0, 10)}, ${env.ASSISTANT_LLM_PROVIDER}${env.ASSISTANT_LLM_MODEL ? ` · ${env.ASSISTANT_LLM_MODEL}` : env.OLLAMA_MODEL ? ` · ${env.OLLAMA_MODEL}` : ''})`,
  '',
  `${cases.length - failed} de ${cases.length} casos correctos · ${tokensIn} tokens de entrada y ${tokensOut} de salida en total`,
  '',
  '| Caso | Resultado | Origen | Fallos | Respuesta (recortada) |',
  '|---|---|---|---|---|',
  ...rows,
].join('\n');
console.log(report);
const out = process.argv.indexOf('--out');
if (out > 0 && process.argv[out + 1]) writeFileSync(process.argv[out + 1]!, report + '\n');
process.exit(failed ? 1 : 0);
