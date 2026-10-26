// Implementación de LlmClient para Ollama (modelos open, coste cero). API verificada en https://docs.ollama.com/api/chat
// (2026-10-25): POST /api/chat, respuesta NDJSON con message.content y, al final, prompt_eval_count / eval_count.
import type { LlmClient, LlmEvent, LlmInput, LlmTurn } from './llm';

const TIMEOUT_MS = 60_000; // sin GPU el modelo local es más lento que Gemini

interface OllamaChunk {
  message?: { content?: string };
  done?: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export function toMessages(system: string, turns: LlmTurn[]): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  return [
    { role: 'system', content: system },
    ...turns.map((t) => ({ role: t.role, content: t.text })),
  ];
}

export class OllamaClient implements LlmClient {
  private fetchImpl: typeof fetch;
  constructor(private opts: { baseUrl: string; model: string; fetchImpl?: typeof fetch }) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async *stream(input: LlmInput): AsyncIterable<LlmEvent> {
    try {
      const signal = input.signal ? AbortSignal.any([input.signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS);
      const res = await this.fetchImpl(`${this.opts.baseUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: this.opts.model,
          messages: toMessages(input.system, input.turns),
          stream: true,
          options: { temperature: input.temperature ?? 0.3, num_predict: input.maxOutputTokens },
        }),
        signal,
      });
      if (!res.ok || !res.body) {
        yield { type: 'error', reason: `ollama ${res.status}` };
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      let tokensIn = 0;
      let tokensOut = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (value) buf += value;
        const lines = buf.split('\n');
        buf = done ? '' : lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line) as OllamaChunk;
          if (chunk.message?.content) yield { type: 'text', text: chunk.message.content };
          if (chunk.done) {
            tokensIn = chunk.prompt_eval_count ?? 0;
            tokensOut = chunk.eval_count ?? 0;
          }
        }
        if (done) break;
      }
      yield { type: 'done', usage: { tokensIn, tokensOut } };
    } catch (err) {
      yield { type: 'error', reason: err instanceof Error ? err.name : 'desconocido' };
    }
  }
}
