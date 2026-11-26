import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

// @app/theme-engine is shared by Backend and Frontend. Depending on how the repos are laid out it lives either in
// <root>/packages/theme-engine (monorepo, next to frontend/) or inside the backend repo
// (<root>/School_id_cards/packages/theme-engine). Use whichever exists, so the app builds in both layouts.
const THEME_ENGINE_CANDIDATES = [
  path.resolve(here, '../packages/theme-engine'),
  path.resolve(here, '../School_id_cards/packages/theme-engine'),
  path.resolve(here, '../backend/packages/theme-engine'),
];
const themeEngineDir = THEME_ENGINE_CANDIDATES.find((dir) => fs.existsSync(path.join(dir, 'index.js')));
const themeEngineAlias = themeEngineDir ? { '@app/theme-engine': path.join(themeEngineDir, 'index.js') } : {};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: themeEngineAlias,
  },
  server: {
    port: 5173,
    open: false,
    // theme-engine can sit outside the project folder — let the dev server serve it
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), ...THEME_ENGINE_CANDIDATES],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    testTimeout: 15000,
  },
});
