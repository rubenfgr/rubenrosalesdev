// Contenido de la web empaquetado para la API (lo genera scripts/export-knowledge.mjs desde apps/web/src/content).
import type { Pricing } from './assistant/engine';
import data from '../generated/knowledge.json';
import type { Lang } from './index';

interface Say {
  say: string[];
  step: string;
}

/** Parte de `assistant/{es,en}.json` que usa la API. */
export interface AssistantKnowledge {
  panel: { title: string };
  bio: string;
  rules: { pattern: string; action: string }[];
  actions: Record<string, Say>;
  types: Record<string, string>;
  systems: Record<string, string>;
  team: Record<string, string>;
  estimate: { levels: Record<'low' | 'medium' | 'high', string>; weeks: string; disclaimer: string };
}

export interface Knowledge {
  services: Record<Lang, { items: { id: string; name: string; title: string; body: string }[] }>;
  process: Record<Lang, { items: { id: string; step: string; tag: string; title: string; body: string }[] }>;
  faq: Record<Lang, { items: { id: string; question: string; answer: string }[] }>;
  assistant: Record<Lang, AssistantKnowledge>;
  pricing: Pricing;
}

export const knowledge = data as unknown as Knowledge;
