// Empaqueta el contenido de la web que necesita la API (servicios, proceso, FAQ y asistente)
// en packages/shared/generated/knowledge.json. Es la única fuente: la API no copia textos a mano.
// Se ejecuta antes de check, test y build de la API (y de @rr/shared).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'apps/web/src/content');
const read = (rel) => JSON.parse(readFileSync(join(content, rel), 'utf8'));
const byLang = (collection) => ({ es: read(`${collection}/es.json`), en: read(`${collection}/en.json`) });

const uiContact = JSON.parse(readFileSync(join(root, 'apps/web/src/i18n/ui/es.json'), 'utf8')).contact;
const titles = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? v : v.title]));

const knowledge = {
  services: byLang('services'),
  process: byLang('process'),
  faq: byLang('faq'),
  assistant: byLang('assistant'),
  // Etiquetas en español del formulario de contacto, para redactar el email a Rubén.
  contactEs: { goals: titles(uiContact.goals), sizes: uiContact.sizes, whens: uiContact.whens },
};

const out = join(root, 'packages/shared/generated/knowledge.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(knowledge));
console.log('knowledge.json generado');
