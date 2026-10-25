// Cliente del LLM. La interfaz no conoce ningún proveedor; `createLlmClient` elige la implementación.

/** Turno de la conversación tal como lo ve el modelo (incluye las llamadas a herramientas ya hechas). */
export type LlmTurn =
  | { role: 'user' | 'assistant'; text: string }
  | { role: 'tool_call'; name: string; args: Record<string, unknown> }
  | { role: 'tool_result'; name: string; result: Record<string, unknown> };

export interface LlmTool {
  name: string;
  description: string;
  /** Esquema JSON (subconjunto OpenAPI) de los parámetros. */
  parameters: Record<string, unknown>;
}

export interface LlmInput {
  system: string;
  turns: LlmTurn[];
  tools?: LlmTool[];
  maxOutputTokens: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface LlmUsage {
  tokensIn: number;
  tokensOut: number;
}

export type LlmEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; args: Record<string, unknown> }
  | { type: 'done'; usage: LlmUsage }
  | { type: 'error'; reason: string };

export interface LlmClient {
  /** `false` si el proveedor no usa function calling: la API entrega la estimación como dato en el prompt. */
  readonly supportsTools?: boolean;
  stream(input: LlmInput): AsyncIterable<LlmEvent>;
}

/** Cliente determinista para pruebas: cada llamada a `stream` consume el siguiente guion. */
export class FakeLlmClient implements LlmClient {
  calls: LlmInput[] = [];
  constructor(private scripts: LlmEvent[][]) {}

  async *stream(input: LlmInput): AsyncIterable<LlmEvent> {
    this.calls.push(input);
    const script = this.scripts.shift() ?? [{ type: 'error', reason: 'sin guion' }];
    for (const ev of script) yield ev;
  }
}
