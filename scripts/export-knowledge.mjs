// Empaqueta el contenido de la web que necesita la API (servicios, proceso, FAQ, asistente y tabla de rangos)
// en packages/shared/generated/knowledge.json. Es la única fuente: la API no copia textos a mano.
// Se ejecuta antes de check, test y build de la API (y de @rr/shared).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'apps/web/src/content');
const read = (rel) => JSON.parse(readFileSync(join(content, rel), 'utf8'));
const byLang = (collection) => ({ es: read(`${collection}/es.json`), en: read(`${collection}/en.json`) });

const knowledge = {
  services: byLang('services'),
  process: byLang('process'),
  faq: byLang('faq'),
  assistant: byLang('assistant'),
  pricing: read('assistant/pricing.json'),
};

const out = join(root, 'packages/shared/generated/knowledge.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(knowledge));
console.log('knowledge.json generado');
