
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Evita que `process.env` crashee en el navegador sin filtrar las variables
    // del entorno de build al bundle público (Vite sigue reemplazando NODE_ENV).
    // Las variables para el frontend se exponen con el prefijo VITE_.
    'process.env': '{}'
  },
  server: {
    port: 3000
  }
});
