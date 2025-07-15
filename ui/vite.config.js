import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set base for subdomain deployment (nationalsites.carlknutson.com)
export default defineConfig({
  plugins: [react()],
  base: '/', // For root of custom domain
  server: {
    open: true,
  },
});
