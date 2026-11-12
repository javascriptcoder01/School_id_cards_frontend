import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    open: false,
    // @app/theme-engine (file:../packages/theme-engine) project folder ke bahar hai — dev server use serve kar sake
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '../packages/theme-engine'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    testTimeout: 15000,
  },
});
