import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Use the IPv4 address directly to stop the ::1 (IPv6) errors
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        // Keep rewrite ONLY if your backend routes DON'T start with /api
        // Based on your terminal, they seem to expect /api/auth/login, etc.
        // So let's try WITHOUT rewrite first.
      },
      // Catch paths that don't start with /api
      '^/(feed|friends|profile|announcements|status|login|auth)': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    historyApiFallback: true,
  },
});