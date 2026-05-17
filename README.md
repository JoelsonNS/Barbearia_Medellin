# Sistema de agendamento para barbearia

## Corrigir erro ao confirmar agendamento

Se ao clicar em **Confirmar Agendamento** aparecer o erro:

```text
Could not find the 'lembrete_enviado' column of 'agendamentos' in the schema cache
```

significa que o JavaScript esta tentando salvar um campo chamado
`lembrete_enviado`, mas essa coluna ainda nao existe na tabela
`agendamentos` do Supabase.

Para corrigir:

1. Abra o Supabase Dashboard do projeto.
2. Va em **SQL Editor**.
3. Execute o arquivo `supabase/migrations/20260515_fix_agendamentos_lembrete.sql`.
4. Recarregue a pagina `servicos.html` e tente confirmar novamente.

Esse campo e usado pelo lembrete de WhatsApp para marcar se o cliente ja
recebeu a mensagem antes do horario agendado.

## Fluxo de Branches

Atualmente o projeto utiliza um fluxo simples com a `main` como branch principal e branches separadas para cada funcionalidade ou correção.

### Regras

- Desenvolver sempre em uma branch própria
- Fazer commits pequenos e descritivos
- Testar antes de integrar
- Nao comitar direto na `main`

### Estrutura atual

- `main`: versao principal e estavel do projeto
- `feature/*`: desenvolvimento de novas funcionalidades
- `fix/*`: correcao de bugs
- `hotfix/*`: correcao urgente

### Padrao de nomes das branches

- `feature/STAYPROJ-102`: branch para nova funcionalidade vinculada a uma task
- `fix/nome-do-ajuste`: branch para correcao comum
- `hotfix/nome-do-ajuste`: branch para correcao urgente

### Exemplos

- `feature/login`
- `feature/agenda`
- `feature/STAYPROJ-102`
- `fix/correcao-login`
- `hotfix/erro-agendamento`

### Fluxo de trabalho

1. Criar uma branch a partir da `main`
2. Desenvolver a funcionalidade ou correcao na branch criada
3. Fazer commits pequenos e com mensagens claras
4. Testar antes de integrar
5. Fazer merge na `main` somente quando estiver estavel

> Observacao: por enquanto o projeto nao utiliza as branches `develop` e `homolog`. Se elas forem criadas no futuro, este fluxo pode ser expandido.
