import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: 'Toolbox',
    description:
      'Format JSON and XML responses in place with searchable trees and an optional jq workspace.',
    permissions: ['storage', 'tabs'],
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
    },
    browser_specific_settings: {
      gecko: {
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
});
