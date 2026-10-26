// Implementación de LlmClient para la Gemini API (REST `streamGenerateContent` con SSE; sin function calling, el asistente no usa herramientas).
// Formato verificado en https://ai.google.dev/api/generate-content (2026-10-25). Sin SDK: solo fetch.
import type { LlmClient, LlmEvent, LlmInput, LlmTurn } from './llm';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TIMEOUT_MS = 30_000;

interface GeminiPart {
  text?: string;
}
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}
interface GeminiChunk {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
}

/** Convierte los turnos a `contents`: roles user/model. Une turnos contiguos del mismo rol. */
export function toContents(turns: LlmTurn[]): GeminiContent[] {
  const out: GeminiContent[] = [];
  for (const t of turns) {
    const role = t.role === 'user' ? 'user' : 'model';
    const last = out[out.length - 1];
    if (last && last.role === role) last.parts.push({ text: t.text });
    else out.push({ role, parts: [{ text: t.text }] });
  }
  return out;
}

export interface GeminiOptions {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}

export class GeminiClient implements LlmClient {
  private fetchImpl: typeof fetch;
  constructor(private opts: GeminiOptions) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  private async request(input: LlmInput): Promise<Response> {
    const body = {
      systemInstruction: { parts: [{ text: input.system }] },
      contents: toContents(input.turns),
      generationConfig: { maxOutputTokens: input.maxOutputTokens, temperature: input.temperature ?? 0.3 },
    };
    const url = `${BASE}/models/${encodeURIComponent(this.opts.model)}:streamGenerateContent?alt=sse`;
    let res: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const signal = input.signal ? AbortSignal.any([input.signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS);
      res = await this.fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': this.opts.apiKey },
        body: JSON.stringify(body),
        signal,
      });
      // Un único reintento ante 429/5xx del proveedor.
      if (res.status !== 429 && res.status < 500) break;
      if (attempt === 0) await res.body?.cancel();
    }
    return res!;
  }

  async *stream(input: LlmInput): AsyncIterable<LlmEvent> {
    let tokensIn = 0;
    let tokensOut = 0;
    try {
      const res = await this.request(input);
      // Nunca se registra el cuerpo ni la clave: solo el estado.
      if (!res.ok || !res.body) {
        yield { type: 'error', reason: `proveedor ${res.status}` };
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (value) buf += value;
        const lines = buf.split('\n');
        buf = done ? '' : lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const json = line.slice(5).trim();
          if (!json) continue;
          const chunk = JSON.parse(json) as GeminiChunk;
          for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
            if (part.text) yield { type: 'text', text: part.text };
          }
          const u = chunk.usageMetadata;
          if (u) {
            tokensIn = u.promptTokenCount ?? 0;
            // Los tokens de razonamiento se facturan como salida.
            tokensOut = (u.candidatesTokenCount ?? 0) + (u.thoughtsTokenCount ?? 0);
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
