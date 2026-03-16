import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/transacoes": "http://localhost:3000",
      "/saldo": "http://localhost:3000"
    }
  }
})
