# Sistema de agendamento para barbearia

## Visão geral

Projeto front-end estático em Vite, com páginas de agendamento, login e confirmação.
A estrutura foi organizada para manter:

- separação clara entre páginas, estilos, scripts e ativos;
- navegação simples sem dependências desnecessárias;
- backend Supabase isolado em `supabase/`.

## Estrutura do projeto

- `pages/`
  - `pages/index.html`, `pages/login.html`, `pages/servicos.html`, `pages/agenda.html`, `pages/pagamento.html`, `pages/confirmacao.html`
  - páginas principais do site.
- `styles/`
  - CSS separados por página e `main.css` global.
- `scripts/`
  - JavaScript separados por página.
- `public/assets/favicon/`
  - favicon e ícones estáticos.
- `public/assets/img/`
  - imagens do site e fotos dos serviços.
- `supabase/functions/`
  - funções serverless ou lógica de backend.
- `supabase/migrations/`
  - scripts de migração de banco de dados.
- `.env.example`
  - exemplo de variáveis de ambiente.
- `package.json` e `vite.config.js`
  - configuração de build e scripts de desenvolvimento.

### Exemplo de árvore de diretórios

```
/pages
  index.html
  login.html
  servicos.html
  agenda.html
  pagamento.html
  confirmacao.html
/styles
  main.css
  index.css
  login.css
  servicos.css
  agenda.css
  pagamento.css
  confirmacao.css
/scripts
  index.js
  login.js
  servicos.js
  agenda.js
  pagamento.js
  confirmacao.js
/public/assets/favicon
  favicon-32x32.png
  favicon.ico
/public/assets/img
  corte_1.jpeg
  corte_2.jpeg
  corte_3.jpeg
  ...
/supabase/functions
/supabase/migrations
.env.example
package.json
vite.config.js
```

## Como usar

1. Instalar dependências:

```bash
npm install
```

2. Rodar em desenvolvimento:

```bash
npm run dev
```

3. Build de produção:

```bash
npm run build
```

4. Preview do build:

```bash
npm run preview
```

## Padrões de organização

- páginas HTML ficam em `pages/`
- arquivos de estilo ficam em `styles/`
- scripts de página ficam em `scripts/`
- imagens e favicon ficam em `public/assets/`
- código de backend e migrações continuam em `supabase/`

Essa organização facilita manutenção, revisão de código e futuras evoluções.

## Nota sobre Supabase

A função `supabase/functions/enviar-lembrete` está preservada para possível uso futuro.
Hoje o fluxo principal de lembrete é feito pelo cliente na tela de confirmação, via:

- `scripts/confirmacao.js`
  - Geração de `.ics` no iPhone/iPad;
  - abertura de evento no Google Calendar em Android/desktop.

## Correção comum

Se aparecer o erro:

```text
Could not find the 'lembrete_enviado' column of 'agendamentos' in the schema cache
```

significa que a tabela `agendamentos` não possui a coluna `lembrete_enviado`.

Para corrigir:

1. Abra o Supabase Dashboard.
2. Vá em **SQL Editor**.
3. Execute `supabase/migrations/20260515_fix_agendamentos_lembrete.sql`.
4. Recarregue `servicos.html`.

## Fluxo de branches

- `main`: branch principal e estável.
- `feature/*`: desenvolvimento de novas funcionalidades.
- `fix/*`: correções de bugs.
- `hotfix/*`: correções urgentes.

Regras básicas:

- desenvolver em branch própria;
- commits pequenos e claros;
- testar antes de integrar;
- não comitar direto em `main`.

## Deploy

Para orientação de publicação e validação, veja `deploy.md`.

## Checklist de deploy

1. Confirmar que todos os arquivos estão no repositório e sem arquivos temporários.
2. Garantir que `public/assets/` contém o favicon e as imagens usadas pelo site.
3. Rodar `npm run build` e verificar se não ocorrem erros.
4. Testar o site local de preview com `npm run preview`.
5. Validar URLs de favicon, imagens e scripts nas páginas principais.
6. Atualizar `supabase/migrations/` no ambiente de banco se necessário.
7. Usar `git push` na branch correta e abrir PR para revisão.
