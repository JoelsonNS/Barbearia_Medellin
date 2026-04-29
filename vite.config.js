import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        servicos: resolve(__dirname, "servicos.html"),
        agenda: resolve(__dirname, "agenda.html"),
        pagamento: resolve(__dirname, "pagamento.html"),
        confirmacao: resolve(__dirname, "confirmacao.html"),
      },
    },
  },
});
