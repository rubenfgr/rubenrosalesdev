// Implementación de LlmClient para la Gemini API (REST `streamGenerateContent` con SSE).
// Formato verificado en https://ai.google.dev/api/generate-content (2026-10-25). Sin SDK: solo fetch.
import type { LlmClient, LlmEvent, LlmInput, LlmTurn } from './llm';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TIMEOUT_MS = 30_000;

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}
interface GeminiChunk {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  usageMetadata?: {
    promptTokenCount?: number;
    toolUsePromptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
}

/** Convierte los turnos a `contents`: roles user/model; las respuestas de herramienta van como `user`. Une turnos contiguos del mismo rol. */
export function toContents(turns: LlmTurn[]): GeminiContent[] {
  const out: GeminiContent[] = [];
  for (const t of turns) {
    const role = t.role === 'user' || t.role === 'tool_result' ? 'user' : 'model';
    const part: GeminiPart =
      t.role === 'tool_call'
        ? { functionCall: { name: t.name, args: t.args } }
        : t.role === 'tool_result'
          ? { functionResponse: { name: t.name, response: t.result } }
          : { text: t.text };
    const last = out[out.length - 1];
    if (last && last.role === role) last.parts.push(part);
    else out.push({ role, parts: [part] });
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
      ...(input.tools?.length
        ? { tools: [{ functionDeclarations: input.tools.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }] }
        : {}),
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
            if (part.functionCall) yield { type: 'tool_call', name: part.functionCall.name, args: part.functionCall.args ?? {} };
            else if (part.text) yield { type: 'text', text: part.text };
          }
          const u = chunk.usageMetadata;
          if (u) {
            tokensIn = (u.promptTokenCount ?? 0) + (u.toolUsePromptTokenCount ?? 0);
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
