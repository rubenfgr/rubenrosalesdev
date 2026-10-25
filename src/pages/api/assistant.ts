// Asistente con LLM. Desactivado por defecto: solo responde si ASSISTANT_LLM_ENABLED=1 y hay clave y modelo.
// El system prompt se construye con los mismos datos que la web, en el idioma del usuario (src/lib/assistant/prompt.ts).
// Usa la API de mensajes de Anthropic por HTTP; el modelo se define con ASSISTANT_LLM_MODEL.
import type { APIRoute } from 'astro';
import { ASSISTANT_LLM_API_KEY, ASSISTANT_LLM_ENABLED, ASSISTANT_LLM_MODEL } from 'astro:env/server';
import { locales, type Lang } from '../../i18n';
import { buildSystemPrompt } from '../../lib/assistant/prompt';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request, url }) => {
  if (ASSISTANT_LLM_ENABLED !== '1' || !ASSISTANT_LLM_API_KEY || !ASSISTANT_LLM_MODEL) return json(503, { error: 'disabled' });

  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json(403, { error: 'forbidden' });

  let body: { lang?: string; messages?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid' });
  }
  const lang = (locales as readonly string[]).includes(body.lang ?? '') ? (body.lang as Lang) : 'es';
  const messages = (body.messages ?? [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages[messages.length - 1]!.role !== 'user') return json(400, { error: 'invalid' });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ASSISTANT_LLM_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: ASSISTANT_LLM_MODEL, max_tokens: 600, system: await buildSystemPrompt(lang), messages }),
  });
  if (!res.ok) {
    console.error('assistant: fallo del proveedor', res.status);
    return json(502, { error: 'unavailable' });
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim();
  return json(200, { text });
};
