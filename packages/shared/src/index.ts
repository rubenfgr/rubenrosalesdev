// Contratos compartidos entre la web y la API: se validan con Zod en los dos lados.
import { z } from 'zod';

export const langSchema = z.enum(['es', 'en']);
export type Lang = z.infer<typeof langSchema>;

/** Un mensaje de la conversación con el asistente. */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** Petición de turno al asistente: idioma de la página, historial reciente y contexto de la estimación. */
export const chatRequestSchema = z.object({
  lang: langSchema,
  conversationId: z.uuid().optional(),
  messages: z.array(chatMessageSchema).min(1).max(20),
  /** El visitante aceptó guardar la conversación (D-3/D-4). Sin `true`, la conversación es efímera y no se guarda nada. */
  consent: z.boolean().optional(),
  /** Respuestas ya conocidas de la estimación (ids de assistant.json / pricing.json). */
  ctx: z
    .object({ type: z.string().max(40).optional(), systems: z.string().max(40).optional(), team: z.string().max(40).optional() })
    .optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Eventos SSE de `POST /api/v1/chat`: `delta` (texto), `done` (fin) y `error`. */
export const chatDeltaEventSchema = z.object({ text: z.string() });
export const chatDoneEventSchema = z.object({
  conversationId: z.uuid(),
  source: z.enum(['rule', 'cache', 'llm']),
  estimate: z
    .object({
      minEur: z.number(),
      maxEur: z.number(),
      minWeeks: z.number(),
      maxWeeks: z.number(),
      confidence: z.enum(['low', 'medium', 'high']),
    })
    .optional(),
});
export const chatErrorEventSchema = z.object({ error: z.string() });
export type ChatDoneEvent = z.infer<typeof chatDoneEventSchema>;

export const chatResponseSchema = z.object({
  conversationId: z.uuid(),
  text: z.string(),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;

/** Envío del resumen del asistente o del formulario de contacto. */
export const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  consent: z.literal(true),
  lang: langSchema,
  conversationId: z.uuid().optional(),
  summary: z.array(z.string().max(300)).max(20).default([]),
  /** Antispam: campo señuelo (debe ir vacío) y momento en que se abrió el formulario (ms desde epoch). */
  website: z.string().max(200).optional(),
  startedAt: z.number(),
});
export type Lead = z.infer<typeof leadSchema>;

export * from './assistant/engine';
