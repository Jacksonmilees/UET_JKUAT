import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const port = parseInt(process.env.PORT || env.PORT || '5173', 10);
  return {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Fix for "can't access lexical declaration before initialization" error
      rollupOptions: {
        output: {
          // Split code more aggressively to prevent circular dependency issues
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom')) return 'react-dom';
              if (id.includes('react')) return 'react';
              if (id.includes('lucide-react')) return 'lucide';
              return 'vendor';
            }
            if (id.includes('/contexts/')) return 'contexts';
            if (id.includes('/services/')) return 'services';
            if (id.includes('/pages/')) return 'pages';
            if (id.includes('/components/')) return 'components';
          },
        },
      },
      // Use esbuild (default) but disable minification to test
      minify: 'esbuild',
      target: 'es2020',
    },
    server: {
      port: port,
      host: '0.0.0.0',
      strictPort: false,
    },
    preview: {
      port: port,
      host: '0.0.0.0',
      strictPort: false,
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://uetjkuat-54286e10a43b.herokuapp.com/api')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
