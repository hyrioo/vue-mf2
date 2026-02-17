import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vueJsx()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts')
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue']
    }
  }
});
