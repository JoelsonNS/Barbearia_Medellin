# Sistema de agendamento para barbearia

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
