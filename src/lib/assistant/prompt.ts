// System prompt del asistente con LLM. Se construye a partir de los mismos datos que la web:
// bio, servicios, proceso, FAQ y tabla de rangos, en el idioma del usuario.
import { getData, getPricing } from '../../i18n/content';
import type { Lang } from '../../i18n';

const RULES: Record<Lang, string[]> = {
  es: [
    'Responde siempre en español, de forma cercana y directa, sin jerga ni superlativos.',
    'Nunca des cifras fuera de la tabla de rangos de abajo.',
    'No des ningún rango hasta conocer las tres cosas: tipo de proyecto, herramientas que usan y tamaño del equipo. Si falta alguna, pregúntala.',
    'Cuando des un rango, incluye siempre el rango, el nivel de confianza y el aviso «no es un presupuesto».',
    'Si no sabes algo o no está en los datos, no lo inventes: deriva a Rubén y ofrece dejar su nombre y email.',
    'No inventes clientes, proyectos, resultados ni plazos que no estén en los datos.',
  ],
  en: [
    'Always answer in English, in a friendly and direct tone, without jargon or superlatives.',
    'Never give figures outside the range table below.',
    'Do not give any range until you know three things: type of project, tools they use and team size. If one is missing, ask for it.',
    'When you give a range, always include the range, the confidence level and the notice "this is not a quote".',
    'If you do not know something or it is not in the data, do not make it up: refer them to Rubén and offer to take their name and email.',
    'Do not invent clients, projects, results or timelines that are not in the data.',
  ],
};
const HEADINGS: Record<Lang, Record<'bio' | 'services' | 'process' | 'faq' | 'pricing' | 'rules', string>> = {
  es: { bio: 'Quién es Rubén', services: 'Servicios', process: 'Cómo trabaja', faq: 'Preguntas frecuentes', pricing: 'Tabla de rangos (única fuente de cifras, en euros)', rules: 'Reglas' },
  en: { bio: 'Who Rubén is', services: 'Services', process: 'How he works', faq: 'Frequently asked questions', pricing: 'Range table (the only source of figures, in euros)', rules: 'Rules' },
};

export async function buildSystemPrompt(lang: Lang): Promise<string> {
  const [assistant, services, process, faq, pricing] = await Promise.all([
    getData('assistant', lang),
    getData('services', lang),
    getData('process', lang),
    getData('faq', lang),
    getPricing(),
  ]);
  const h = HEADINGS[lang];
  const table = Object.entries(pricing.types).map(([id, p]) => `- ${assistant.types[id] ?? id}: ${p.minEur}–${p.maxEur} €, ${p.minWeeks}–${p.maxWeeks} ${lang === 'es' ? 'semanas' : 'weeks'}`);
  const multipliers = Object.entries(pricing.multipliers).flatMap(([group, items]) =>
    Object.entries(items).map(([k, m]) => `- ${group}/${k}: ${JSON.stringify(m)}`),
  );
  return [
    assistant.panel.title,
    '',
    `## ${h.rules}`,
    ...RULES[lang].map((r) => `- ${r}`),
    '',
    `## ${h.bio}`,
    assistant.bio,
    '',
    `## ${h.services}`,
    ...services.items.map((s) => `- ${s.name}: ${s.title}. ${s.body}`),
    '',
    `## ${h.process}`,
    ...process.items.map((p) => `${p.step}. ${p.title} (${p.tag}): ${p.body}`),
    '',
    `## ${h.faq}`,
    ...faq.items.map((f) => `- ${f.question} ${f.answer}`),
    '',
    `## ${h.pricing}`,
    ...table,
    ...multipliers,
    `- rounding: ${pricing.rounding}`,
    '',
    assistant.estimate.disclaimer,
  ].join('\n');
}
