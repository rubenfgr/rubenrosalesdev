import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';
import { errorBody } from './errors';

/** Valida la entrada con un esquema de @rr/shared; si no cumple, 400 `invalid_request` (sin devolver el contenido). */
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) return c.json(errorBody('invalid_request'), 400);
  });
