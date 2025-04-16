import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server/index.ts'),
      name: 'rakuten-hotel-mcp',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@modelcontextprotocol/sdk', 'axios', 'dotenv'],
      output: {
        globals: {
          '@modelcontextprotocol/sdk': 'mcpSdk',
          axios: 'axios',
          dotenv: 'dotenv',
        },
      },
    },
    outDir: 'build',
  },
});
