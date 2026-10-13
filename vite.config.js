import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 8000,
  },
  build: {
    lib: {
      entry: 'auth-client.js',
      formats: ['es'],
      fileName: () => 'auth-client.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    copyPublicDir: false,
  },
});
