import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the system/Vercel and local files
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Map API_KEY or GEMINI_API_KEY to process.env.API_KEY for the @google/genai SDK
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || "")
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});