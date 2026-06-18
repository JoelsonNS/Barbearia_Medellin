# Checklist de deploy

Esse documento lista os passos principais para validar e publicar o projeto.

## Antes do deploy

1. Verificar se o projeto está no repositório sem arquivos temporários.
2. Confirmar que o diretório `public/assets/` contém os ícones e imagens usadas pelo site.
3. Validar a estrutura principal:
   - `pages/index.html`
   - `pages/login.html`
   - `pages/servicos.html`
   - `pages/agenda.html`
   - `pages/pagamento.html`
   - `pages/confirmacao.html`
   - `styles/`
   - `scripts/`
   - `supabase/`
4. Garantir que `.env.example` esteja atualizado com as variáveis de ambiente relevantes.
5. Verificar se `package.json` e `vite.config.js` estão corretos para o ambiente de build.

## Build e validação local

1. Instalar dependências:

```bash
npm install
```

2. Rodar em modo de desenvolvimento para teste rápido:

```bash
npm run dev
```

3. Gerar build de produção:

```bash
npm run build
```

4. Verificar se não há erros no processo de build.

5. Iniciar preview do build:

```bash
npm run preview
```

6. Acessar o site no browser e testar as páginas principais:
   - `index.html`
   - `servicos.html`
   - `agenda.html`
   - `pagamento.html`
   - `confirmacao.html`
   - `login.html`

7. Testar se as imagens, favicon e scripts carregam corretamente.

## Supabase e banco de dados

1. Confirmar se as migrações necessárias estão aplicadas.
2. Se precisar corrigir o campo `lembrete_enviado`, executar:

```bash
# usar o SQL Editor do Supabase ou via CLI
supabase db reset  # apenas se for apropriado ao ambiente
```

3. Verificar se as funções em `supabase/functions/` estão sincronizadas com o ambiente.

## Publicação

1. Fazer commit das mudanças em uma branch apropriada.
2. Abrir pull request para revisão.
3. Após aprovação, fazer merge na branch `main`.
4. Publicar o site no serviço desejado (Vercel, Netlify, Supabase Hosting, etc.).
5. Testar o site publicado e validar URLs de ativos.

## Pós-deploy

1. Verificar se as páginas estão carregando sem erros de console.
2. Validar links internos e formulários de agendamento.
3. Confirmar que o favicon e as imagens do serviço foram carregadas.
