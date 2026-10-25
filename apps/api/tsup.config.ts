import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/db/migrate.ts'],
  format: ['esm'],
  target: 'node24',
  clean: true,
  // Todo va empaquetado (incluido @rr/shared, que es TypeScript sin compilar): la imagen no necesita node_modules.
  noExternal: [/.*/],
});
