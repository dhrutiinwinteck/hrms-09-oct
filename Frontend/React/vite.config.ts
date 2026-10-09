/**
 * Vite Configuration File
 * Configures the development server and build settings
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: true,
    port: 5173,
    open: 'http://192.168.1.5:5173/login',
    strictPort: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
});