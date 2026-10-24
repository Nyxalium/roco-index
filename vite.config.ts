import { defineConfig } from 'vite';

export default defineConfig({
  server: { watch: { ignored: ['**/research/**'] } },
  build: {
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        // RSC directives have no meaning in this entirely client-rendered app.
        if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('use client')) return;
        defaultHandler(level, log);
      },
      output: {
        codeSplitting: {
          groups: [{ name: 'diorama', test: /node_modules\/three\// }, { name: 'vendor', test: /node_modules\/(?!three\/)/ }],
        },
      },
    },
  },
});
