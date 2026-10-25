// Comprobaciones simples (regex y validador) de los casos de evaluación. Puras: se prueban sin LLM.
import { knowledge } from '@rr/shared/knowledge';
import { hasUnverifiableAmount, extractAmounts, leaksPrompt } from '../src/services/validator';
import { promptMarkers } from '../src/services/prompt';

export interface Expect {
  source?: 'rule' | 'llm';
  noFigure?: boolean;
  range?: boolean;
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
  if (exp.range) {
    if (extractAmounts(text).length === 0) fails.push('no da el rango');
    const levels = Object.values(knowledge.assistant[lang].estimate.levels);
    if (!levels.some((l) => text.toLowerCase().includes(l.toLowerCase()))) fails.push('sin nivel de confianza');
    if (!/no es un presupuesto|not a quote|not a quotation|not a budget/i.test(text)) fails.push('sin aviso «no es un presupuesto»');
  }
  if (exp.asksMissing && !text.includes('?')) fails.push('no pregunta lo que falta');
  if (exp.refers && !(/Rubén/.test(text) && /email|correo|nombre|name/i.test(text))) fails.push('no deriva a Rubén ofreciendo nombre y email');
  if (exp.noLeak && leaksPrompt(text, promptMarkers(lang))) fails.push('filtra el prompt');
  if (exp.lang === 'en' && !(EN.test(text) && !ES.test(text))) fails.push('no responde en inglés');
  if (exp.lang === 'es' && !(ES.test(text) && !EN.test(text))) fails.push('no responde en español');
  return fails;
}
