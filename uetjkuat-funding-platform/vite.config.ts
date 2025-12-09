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
          // Ensure proper module ordering to prevent circular dependency issues
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lucide': ['lucide-react'],
          },
        },
      },
      // Use terser for more reliable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          // Prevent aggressive optimizations that can cause hoisting issues
          toplevel: false,
          hoist_funs: false,
          hoist_vars: false,
        },
        mangle: {
          toplevel: false,
        },
      },
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
