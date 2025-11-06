import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Substitua 'NOME_DO_SEU_REPOSITORIO' pelo nome exato do seu repositório no GitHub
const REPO_NAME = 'Leitor-de-Pedidos'; 

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
  // Esta seção é a chave!
  // Ela diz ao Vite para substituir a string 'process.env.API_KEY'
  // pelo valor da variável de ambiente VITE_GEMINI_API_KEY durante o build.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY)
  }
});
