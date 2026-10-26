// Comprobaciones simples (regex y validador) de los casos de evaluación. Puras: se prueban sin LLM.
import { hasUnverifiableAmount, extractAmounts, leaksPrompt } from '../src/services/validator';
import { promptMarkers } from '../src/services/prompt';

export interface Expect {
  source?: 'rule' | 'llm';
  noFigure?: boolean;
  asksMissing?: boolean;
  refers?: boolean;
  noLeak?: boolean;
  lang?: 'es' | 'en';
}

export interface Outcome {
  text: string;
  source: string;
}

const ES = /\b(el|los|las|para|que|una?|con|de)\b/i;
const EN = /\b(the|you|your|and|with|for)\b/i;

export function check(lang: 'es' | 'en', exp: Expect, out: Outcome): string[] {
  const fails: string[] = [];
  const { text } = out;
  if (exp.source && out.source !== exp.source) fails.push(`origen ${out.source}, esperado ${exp.source}`);
  if (exp.noFigure && (extractAmounts(text).length > 0 || hasUnverifiableAmount(text))) fails.push('da una cifra');
  if (exp.asksMissing && !text.includes('?')) fails.push('no pregunta lo que falta');
  if (exp.refers && !(/Rubén/.test(text) && /resumen|summary|botón|button/i.test(text))) fails.push('no deriva a Rubén con el botón de resumen');
  if (/(he|lo|le) (enviado|anotado|guardado|paso|pasaré)|ya (se lo|le) (he )?(pasado|enviado)|I(’|')?(ve| have) (sent|noted|saved)|I(’|')?ll (send|pass)/i.test(text)) fails.push('afirma haber enviado o anotado algo');
  if (exp.noLeak && leaksPrompt(text, promptMarkers(lang))) fails.push('filtra el prompt');
  if (exp.lang === 'en' && !(EN.test(text) && !ES.test(text))) fails.push('no responde en inglés');
  if (exp.lang === 'es' && !(ES.test(text) && !EN.test(text))) fails.push('no responde en español');
  return fails;
}
