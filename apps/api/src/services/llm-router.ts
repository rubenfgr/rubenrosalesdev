import { BudgetGuard } from './budget';
import type { LlmClient, LlmEvent, LlmInput } from './llm';

/**
 * Degradación en cadena (T-3.8/T-7.3): con presupuesto, usa el cliente principal (Gemini). Desde el 80 % del tope
 * usa el secundario (Ollama) si existe; si no, no hay LLM y la web sigue con reglas. Al 100 % no se llama
 * al principal bajo ningún concepto. Solo el uso del principal cuenta contra el tope.
 */
export class RoutedLlm implements LlmClient {
  constructor(
    private primary: LlmClient | null,
    private secondary: LlmClient | null,
    private budget: BudgetGuard,
  ) {}

  private pick(): { client: LlmClient; counted: boolean } | null {
    if (this.primary && this.budget.state() === 'ok') return { client: this.primary, counted: true };
    return this.secondary ? { client: this.secondary, counted: false } : null;
  }

  /** ¿Hay algún LLM disponible ahora mismo? */
  available(): boolean {
    return this.pick() !== null;
  }

  async *stream(input: LlmInput): AsyncIterable<LlmEvent> {
    const choice = this.pick();
    if (!choice) {
      yield { type: 'error', reason: 'presupuesto' };
      return;
    }
    for await (const ev of choice.client.stream(input)) {
      if (ev.type === 'done' && choice.counted) this.budget.record(ev.usage);
      yield ev;
    }
  }
}
