# Cooperativa de Luthiers — Monorepo

Este repositório contém o sistema completo da **Cooperativa de Luthiers**, desenvolvido como projeto de avaliação para a **2ª VA** da disciplina de **Programação Web II**
Ana Laura Mesquita 

O projeto adota uma arquitetura moderna de monorepo, estruturada com **pnpm workspaces** e orquestrada pelo **Turborepo**.

---

## 👥 Informações do Projeto

- **Tema:** Cooperativa de Luthiers (Tema 7)
- **Disciplina:** Programação Web I
- **Professor:** Guiliano Rangel
- **Integrantes da Equipe:**
  - Ana Laura Mesquita de Souza

---

## 📁 Estrutura do Monorepo

O monorepo está dividido em aplicações (`apps/`) e pacotes compartilhados (`packages/`):

```txt
├── apps/
│   ├── backend/           # API REST em NestJS 11 + TypeORM + SQLite
│   └── frontend/          # SPA em Angular 20 + TailwindCSS + Signals
├── packages/
│   ├── eslint-config/     # Padrões estáticos de linting compartilhados
│   ├── typescript-config/ # Configurações base do TypeScript
│   └── utils/             # DTOs, payloads e tipos compartilhados
├── pnpm-workspace.yaml    # Definição dos workspaces do pnpm
├── turbo.json             # Pipelines de execução do Turborepo
└── AGENT.md               # Guia de governança de IA para o repositório
```

---

## 🛠️ Tecnologias Utilizadas

### Monorepo & Infraestrutura
- **PNPM Workspaces** - Gerenciador de pacotes rápido e otimizado para monorepos.
- **Turborepo** - Orquestrador de tarefas para cache inteligente e execução concorrente (build, lint, test, dev).

### Backend
- **NestJS 11** - Framework Node.js progressivo para APIs eficientes e escaláveis.
- **TypeORM** - ORM para TypeScript integrado com banco de dados.
- **SQLite** - Banco de dados relacional leve em arquivo local.
- **class-validator & class-transformer** - Validação de dados (DTOs) no ponto de entrada da API.
- **Passport JWT** - Mecanismo de segurança de rotas.

### Frontend
- **Angular 20** - Framework SPA estruturado inteiramente com **Standalone Components** (sem NgModules).
- **TailwindCSS** - Framework utilitário de CSS para design ágil e responsivo.
- **Signals** - Controle de estado nativo, reativo e eficiente para gerenciar dados em memória.

---

## ⚙️ Variáveis de Ambiente

O backend aceita configurações por meio de variáveis de ambiente. Há um arquivo de exemplo em [apps/backend/.env.example](apps/backend/.env.example). 

As variáveis suportadas são:

| Variável | Descrição | Valor Padrão (Fallback) |
| :--- | :--- | :--- |
| `PORT` | Porta na qual o servidor HTTP do backend irá escutar. | `3000` |
| `JWT_SECRET` | Chave de segurança usada para assinar e validar tokens JWT. | `cooperativa-luthiers-secret-dev` |
| `ADMIN_EMAIL` | E-mail do usuário administrador padrão criado pelo seed. | `admin@cooperativaluthiers.com` |
| `ADMIN_PASSWORD`| Senha do usuário administrador padrão criado pelo seed. | `Admin@1234` |

---

## 🚀 Como Iniciar a Aplicação Pós-Clonagem

Siga o passo a passo detalhado abaixo para clonar, configurar e rodar o projeto localmente em sua máquina.

### Pré-requisitos
Certifique-se de ter instalado em seu ambiente:
- **Git**
- **Node.js** (versão `>= 20.0.0`)
- **PNPM** (versão `>= 9.0.0` recomendada)
  ```bash
  npm install -g pnpm
  ```

---

### Passo 1: Clonar o Repositório
Abra o terminal em seu diretório de preferência e execute o comando de clonagem:

```bash
git clone https://github.com/nana-rkive/Exercicio-03-Aplicando-OO-Reflexao.git
```

Em seguida, acesse a pasta raiz do projeto clonado:
```bash
cd Exercicio-03-Aplicando-OO-Reflexao
```

---

### Passo 2: Instalar as Dependências do Monorepo
Como o projeto utiliza **pnpm workspaces**, todas as dependências do monorepo (backend, frontend e pacotes compartilhados) são instaladas a partir da raiz com um único comando:

```bash
pnpm install
```

> [!TIP]
> **Dica para usuários de Windows (PowerShell):** Se o terminal exibir erro de permissão para rodar scripts do pnpm (`PSSecurityException`), libere a execução na sessão atual com o comando:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```
> Ou utilize `pnpm.cmd install` / execute pelo Prompt de Comando (`cmd`).

---

### Passo 3: Configurar as Variáveis de Ambiente (Opcional)
O backend possui mecanismos de fallback automáticos e cria um banco SQLite local automaticamente no primeiro start. 

Caso queira personalizar credenciais ou portas, crie o arquivo `.env` a partir do modelo de exemplo:
- **No Linux/macOS:**
  ```bash
  cp apps/backend/.env.example apps/backend/.env
  ```
- **No Windows (PowerShell):**
  ```powershell
  Copy-Item apps/backend/.env.example apps/backend/.env
  ```

---

### Passo 4: Executar a Aplicação

#### Opção A: Executar Backend e Frontend Simultaneamente (Recomendado)
A partir da raiz do monorepo, utilize o **Turborepo** para subir todo o ecossistema em paralelo com um único comando:

```bash
pnpm dev
```

#### Opção B: Executar em Terminais Separados
Se preferir visualizar os logs de cada aplicação isoladamente, abra dois terminais na raiz:
- **Terminal 1 (Backend NestJS):**
  ```bash
  pnpm --filter backend dev
  ```
- **Terminal 2 (Frontend Angular):**
  ```bash
  pnpm --filter frontend dev
  ```

---

### Passo 5: Acessar a Aplicação e Credenciais de Acesso

Após inicializar os servidores, acesse os seguintes endereços no navegador:

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend (Web App)** | [http://localhost:4200](http://localhost:4200) | Interface do usuário em Angular 20 |
| **Backend (API REST)** | [http://localhost:3000](http://localhost:3000) | Servidor da API em NestJS 11 |
| **Swagger UI** | [http://localhost:3000/api](http://localhost:3000/api) | Documentação interativa dos endpoints da API |

#### 🔑 Credenciais do Usuário Administrador (Seed Automático):
O backend executa um seed automático na inicialização criando o usuário administrador padrão:
- **E-mail:** `admin@cooperativaluthiers.com`
- **Senha:** `Admin@1234`

---

## 🧪 Execução de Testes e Linting

Todas as tarefas são centralizadas e otimizadas via Turborepo a partir do diretório raiz:

### Executar a suíte de testes de todo o monorepo (Backend + Frontend)
```bash
pnpm test
```

### Executar a verificação de código estática (Linter)
```bash
pnpm lint
```

### Gerar os pacotes de distribuição para produção
```bash
pnpm build
```

---

## 🔒 Arquitetura de Segurança & Fluxo de Auth

O sistema implementa autenticação via JWT com as seguintes características críticas:

1. **JWT Strictly In-Memory (Frontend):**
   Conforme especificado na avaliação para mitigar riscos de segurança (como ataques XSS), o token JWT **nunca** é persistido no `localStorage` ou `sessionStorage`. Ele é armazenado estritamente na memória volátil utilizando um **Signal** no `AuthService`. Ao atualizar a página (F5), a sessão é intencionalmente encerrada e novo login é exigido.
2. **HTTP Interceptor:**
   Anexa automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as chamadas HTTP e intercepta erros `401 Unauthorized`, limpando a sessão e redirecionando o usuário para `/login`.
3. **Database Seed Idempotente:**
   Na inicialização, o backend executa um seed automático para garantir que a conta administrativa padrão exista no banco de dados.

---

## 💼 Regras de Negócio Implementadas

Abaixo estão listadas as 11 regras de negócio validadas e testadas ativamente:

### Entidade Luthier (Pai)
1. **Campos Obrigatórios:** Todos os campos do cadastro de luthier são obrigatórios.
2. **Mínimo de Bancadas:** O número de bancadas (`bancadasNum`) deve ser no mínimo 2.
3. **Bancadas Inteiras:** O número de bancadas deve ser um número inteiro.
4. **Nome Completo:** O campo `nomeMestre` deve conter obrigatoriamente nome e sobrenome.
5. **Data Limite:** A data de abertura da oficina (`dataAbertura`) não pode ser futura.
6. **Data Mínima:** A data de abertura da oficina não pode ser anterior a 1900.

### Entidade Instrumento (Filho)
7. **Integridade de FK:** O `luthierId` referenciado na entrada do instrumento deve existir no sistema.
8. **Validação de Cronologia:** A data de entrada do instrumento (`dataEntrada`) não pode ser anterior à data de abertura da oficina do luthier responsável.
9. **Limite de Custo:** O custo do reparo (`custoReparo`) deve estar estritamente entre R$ 0 e R$ 50.000.
10. **Condicional de Conclusão:** Se o reparo for marcado como concluído (`reparoConcluido = true`), o custo do reparo deve ser estritamente maior que zero.
11. **Modelo Único em Reparo:** Não é permitido duplicar o `modeloMadeira` de instrumento em reparo simultâneo na mesma oficina (para o mesmo luthier).
