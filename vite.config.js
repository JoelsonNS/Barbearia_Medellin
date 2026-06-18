import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "pages/login.html"),
        servicos: resolve(__dirname, "pages/servicos.html"),
        agenda: resolve(__dirname, "pages/agenda.html"),
        pagamento: resolve(__dirname, "pages/pagamento.html"),
        confirmacao: resolve(__dirname, "pages/confirmacao.html"),
      },
    },
  },
});
