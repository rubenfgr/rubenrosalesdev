import type { Contact } from '@rr/shared';
import type { Knowledge } from '@rr/shared/knowledge';

/** Texto del email a Rubén (en español): mismo formato que enviaba la web. */
export function contactEmailText(c: Contact, k: Knowledge): string {
  const label = (map: Record<string, string>, key: string) => (key ? (map[key] ?? key) : '');
  const goals = c.goals.map((g) => k.contactEs.goals[g] ?? g);
  return [
    `Nombre: ${c.name}`,
    `Email: ${c.email}`,
    `Empresa: ${c.company || '-'}`,
    `Modo: ${c.mode}`,
    `Idioma de la web: ${c.lang}`,
    `Preferencia: ${c.preference === 'call' ? `llamada (${c.phone || 'sin teléfono'})` : 'email'}`,
    `Objetivos: ${goals.join(', ') || '-'}`,
    `Equipo: ${label(k.contactEs.sizes, c.size) || '-'}`,
    `Plazo: ${label(k.contactEs.whens, c.when) || '-'}`,
    `Programas: ${c.tools.join(', ') || '-'}`,
    '',
    c.message,
  ].join('\n');
}
