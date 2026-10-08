import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => ({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  plugins: [react()],
  base: command === 'build' ? (loadEnv(mode, process.cwd()).VITE_BASE_PATH || '/') : '/',
}))
