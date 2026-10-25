import { knowledge } from '@rr/shared/knowledge';
import { describe, expect, it } from 'vitest';
import { buildSystemPrompt, RULES } from './prompt';

const langs = ['es', 'en'] as const;

describe('buildSystemPrompt', () => {
  for (const lang of langs) {
    describe(lang, () => {
      const prompt = buildSystemPrompt(lang);

      it('contiene las 7 reglas de producto', () => {
        expect(RULES[lang]).toHaveLength(7);
        for (const rule of RULES[lang]) expect(prompt).toContain(rule);
      });

      it('contiene la bio y la tabla de rangos', () => {
        expect(prompt).toContain(knowledge.assistant[lang].bio);
        for (const [id, p] of Object.entries(knowledge.pricing.types)) {
          expect(prompt).toContain(`${knowledge.assistant[lang].types[id]}: ${p.minEur}–${p.maxEur} €`);
        }
      });

      it('contiene servicios, proceso y FAQ del idioma', () => {
        expect(prompt).toContain(knowledge.services[lang].items[0]!.name);
        expect(prompt).toContain(knowledge.process[lang].items[0]!.title);
        expect(prompt).toContain(knowledge.faq[lang].items[0]!.question);
      });

      it('no contiene importes en euros fuera de pricing.json', () => {
        const allowed = new Set<number>();
        for (const p of Object.values(knowledge.pricing.types)) {
          allowed.add(p.minEur);
          allowed.add(p.maxEur);
        }
        const amounts = [...prompt.matchAll(/(\d[\d.,]*)\s*(?:€|EUR|euros?)/gi)].map((m) => Number(m[1]!.replace(/[.,]/g, '')));
        expect(amounts.length).toBeGreaterThan(0);
        for (const a of amounts) expect(allowed.has(a), `cifra no autorizada: ${a}`).toBe(true);
      });
    });
  }

  it('con una pregunta, solo añade las secciones relevantes y cabe en ~1.200 tokens (caracteres / 4)', () => {
    for (const lang of langs) {
      const q = lang === 'es' ? '¿Cómo es el proceso de trabajo y qué pasa después del despliegue?' : 'How does the process work after deployment?';
      const prompt = buildSystemPrompt(lang, knowledge, { question: q });
      expect(prompt.length / 4).toBeLessThanOrEqual(1200);
      expect(prompt.length).toBeLessThanOrEqual(buildSystemPrompt(lang).length);
      for (const rule of RULES[lang]) expect(prompt).toContain(rule);
      expect(prompt).toContain(knowledge.assistant[lang].bio);
    }
  });

  it('una pregunta sin coincidencias no añade servicios, proceso ni FAQ', () => {
    const prompt = buildSystemPrompt('es', knowledge, { question: 'zzzzz qqqqq' });
    expect(prompt).not.toContain(`## Servicios`);
    expect(prompt).not.toContain(`## Preguntas frecuentes`);
  });

  it('el prompt de cada idioma no mezcla las reglas del otro', () => {
    expect(buildSystemPrompt('es')).not.toContain(RULES.en[0]!);
    expect(buildSystemPrompt('en')).not.toContain(RULES.es[0]!);
  });
});
