import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TinyClaw',
      fileName: (format) => `tinyclaw-widget.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: { exports: 'named' },
    },
    cssCodeSplit: false,
    minify: true,
    sourcemap: true,
  },
});
