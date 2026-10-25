import { z } from 'astro/zod';
import services from './services.json';
import { serviceSchema } from './schema';

export type { Service } from './schema';
export const servicesData = z.array(serviceSchema).parse(services);
export { servicesData as services };
