import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Toolbox',
    description: 'A structured JSON viewer for browser responses.',
    permissions: ['storage', 'tabs'],
  },
});
