import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const REPO_NAME = 'Leitor-de-Pedidos'; 

export default defineConfig({
  plugins: [react()],
  
  root: REPO_NAME,

  base: `/${REPO_NAME}/`,

  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },

  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
});
