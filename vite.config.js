import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Hanbin-Track/', // ISSO AQUI É ESSENCIAL PARA AS IMAGENS FUNCIONAREM NO GITHUB
})