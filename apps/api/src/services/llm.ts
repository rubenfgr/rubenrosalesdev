// Cliente del LLM. La interfaz no conoce ningún proveedor; `createLlmClient` elige la implementación.

/** Turno de la conversación tal como lo ve el modelo. */
export interface LlmTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface LlmInput {
  system: string;
  turns: LlmTurn[];
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
  | { type: 'done'; usage: LlmUsage }
  | { type: 'error'; reason: string };

export interface LlmClient {
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
