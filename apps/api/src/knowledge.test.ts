import { knowledge } from '@rr/shared/knowledge';
import { describe, expect, it } from 'vitest';

describe('conocimiento empaquetado', () => {
  it('existe (lo genera scripts/export-knowledge.mjs) y trae contenido en es y en', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(knowledge.services[lang].items.length).toBeGreaterThan(0);
      expect(knowledge.process[lang].items.length).toBeGreaterThan(0);
      expect(knowledge.faq[lang].items.length).toBeGreaterThan(0);
      expect(knowledge.assistant[lang].bio.length).toBeGreaterThan(0);
    }
  });
});
