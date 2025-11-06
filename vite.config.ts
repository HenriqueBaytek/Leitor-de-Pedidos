import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Substitua 'NOME_DO_SEU_REPOSITORIO' pelo nome exato do seu repositório no GitHub
const REPO_NAME = 'leitor-de-pedidos'; 

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
});
