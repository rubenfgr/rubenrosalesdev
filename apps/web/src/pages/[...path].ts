// Ruta comodín bajo demanda: solo recibe lo que no coincide con ninguna página. Aplica las redirecciones
// del portal anterior y, si no hay regla, muestra la 404 del sitio.
import type { APIRoute } from 'astro';
import { legacyTarget } from '../lib/redirects';

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect }) => {
  const target = legacyTarget(url.pathname);
  if (target) return redirect(`${target}${url.search}`, 301);
  // La 404 es una página estática: se lee del propio servidor (sin salir a internet) y se devuelve con el código correcto.
  const page = await fetch(`http://127.0.0.1:${process.env.PORT ?? 4321}/404.html`);
  return new Response(page.ok ? await page.text() : 'Not found', { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
