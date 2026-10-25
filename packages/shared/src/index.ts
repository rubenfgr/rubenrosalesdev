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
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

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
});
export type Lead = z.infer<typeof leadSchema>;
