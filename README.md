# Nimbus

> API REST de chamados (help desk) — projeto de estudo

A ideia do projeto é simular o help desk de uma empresa: uma pessoa abre um chamado
(ticket), que é visualizado por uma equipe de atendimento. A equipe atribui o trabalho
aos responsáveis e atualiza o status do chamado até a sua resolução.

Todo o acesso é controlado por autenticação JWT e por cargos (**member**, **officer** e
**admin**), para que cada pessoa visualize e altere apenas o que lhe é permitido.

## Funcionalidades

### Autenticação
- Login com email e senha, gerando um token JWT válido por 1 dia
- Limite de 5 tentativas de login por minuto, para evitar ataques de força bruta

### Usuários
- Cadastro público de novos usuários
- Consulta e edição do próprio perfil
- Gerenciamento de usuários pela equipe (listagem, alteração de cargo e exclusão)

### Chamados
- Abertura de chamados com título, descrição, prioridade e categoria
- Acompanhamento do status do chamado: **aberto**, **em andamento** e **fechado**
- Atribuição de um responsável para cada chamado
- Cada usuário visualiza apenas os seus próprios chamados
- A equipe de atendimento visualiza todos os chamados
- Comentários nos chamados, para o solicitante e a equipe conversarem
- Registro automático das alterações de cada chamado (campo alterado, valor anterior, novo valor, autor e data)

### Segurança
- Senhas armazenadas como hash (bcrypt) e nunca retornadas pela API, nem dentro de outros recursos
- Validação de todos os dados recebidos, rejeitando campos inesperados
- Ids validados como UUID antes de chegar ao banco (id inválido retorna `400`)
- Limite de 60 requisições por minuto (rate limiting)

### Documentação
- Documentação interativa com Swagger, onde é possível testar as rotas pelo navegador

## Cargos e permissões

O sistema possui três cargos:

- **Member**: usuário que abre chamados para pedir suporte
- **Officer**: atendente, responsável por acompanhar e resolver os chamados
- **Admin**: administrador do sistema, com acesso total

Officers e admins formam a **equipe de atendimento**.

| Ação | Member | Officer | Admin |
|---|:---:|:---:|:---:|
| Abrir chamados | ✅ | ✅ | ✅ |
| Visualizar os próprios chamados | ✅ | ✅ | ✅ |
| Visualizar todos os chamados | ❌ | ✅ | ✅ |
| Editar e excluir os próprios chamados | ✅ | ✅ | ✅ |
| Editar e excluir qualquer chamado | ❌ | ✅ | ✅ |
| Alterar status e responsável do chamado | ❌ | ✅ | ✅ |
| Comentar e ler comentários dos próprios chamados | ✅ | ✅ | ✅ |
| Comentar e ler comentários de qualquer chamado | ❌ | ✅ | ✅ |
| Consultar e editar o próprio perfil | ✅ | ✅ | ✅ |
| Listar e visualizar todos os usuários | ❌ | ✅ | ✅ |
| Editar outros usuários | ❌ | ❌ | ✅ |
| Alterar o cargo de usuários | ❌ | ❌ | ✅ |
| Excluir usuários | ❌ | ❌ | ✅ |

> Todo usuário novo é cadastrado como **member**. Apenas um admin pode alterar o cargo
> de outro usuário.

## Tecnologias

### Base
- **[Node.js](https://nodejs.org)** + **[TypeScript](https://www.typescriptlang.org)**
- **[NestJS 12](https://nestjs.com)**: framework do backend, organizado em módulos (auth, user, tickets)

### Banco de dados
- **[PostgreSQL](https://www.postgresql.org)**: banco de dados relacional
- **[TypeORM](https://typeorm.io)**: ORM que mapeia as entidades para tabelas e gerencia as relações entre usuários e chamados

### Autenticação e segurança
- **[Passport](https://www.passportjs.org) + JWT**: autenticação via token Bearer
- **[bcrypt](https://www.npmjs.com/package/bcrypt)**: hash das senhas
- **[@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting)**: limite de requisições (rate limiting)
- **[class-validator](https://github.com/typestack/class-validator)** + **class-transformer**: validação e normalização dos dados de entrada

### Qualidade de código
- **[Vitest](https://vitest.dev)**: testes
- **[oxlint](https://oxc.rs)**: linter
- **[Prettier](https://prettier.io)**: formatação

### Documentação
- **[Swagger](https://docs.nestjs.com/openapi/introduction)** (`@nestjs/swagger`): documentação interativa gerada a partir dos controllers e DTOs

### Ferramentas
- **[Docker](https://www.docker.com)**: PostgreSQL via docker-compose
- **[Postman](https://www.postman.com)**: coleção de requisições em `backend/nimbus.postman_collection.json`

## Como rodar o projeto

### Pré-requisitos
- Node.js 20 ou superior
- npm
- Docker (ou um PostgreSQL instalado localmente)

### 1. Clonar o repositório
```bash
git clone https://github.com/JoaoPedroPavanelo11/projeto-nimbus.git
cd projeto-nimbus
```

### 2. Subir o banco de dados
```bash
docker compose up -d
```

Isso sobe um PostgreSQL na porta `5433` com o banco `nimbus` já criado. A porta é `5433`
(e não a padrão `5432`) para não conflitar com um PostgreSQL que já esteja instalado na máquina.

Se preferir usar um PostgreSQL instalado localmente, crie o banco com `CREATE DATABASE nimbus;`
e ajuste o `DB_PORT` no `.env`.

### 3. Instalar as dependências
```bash
cd backend
npm install
```

### 4. Configurar o .env
Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o PostgreSQL (o padrão bate com o docker-compose) |
| `JWT_SECRET` | Chave usada para assinar os tokens. Sem ela a aplicação não inicia |
| `PORT` | Porta da API (opcional, padrão 3000) |
| `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA` | Dados do primeiro admin, usados pelo seed |

### 5. Rodar a aplicação
```bash
npm run start:dev
```

A API fica disponível em `http://localhost:3000`. As tabelas são criadas automaticamente pelo TypeORM.

A documentação interativa (Swagger) fica em **`http://localhost:3000/docs`**. Para testar as
rotas protegidas por lá, faça o login em `POST /auth/login`, copie o `access_token` e cole no
botão **Authorize**.

### 6. Criar o primeiro admin
Todo cadastro entra como member, então o primeiro admin é criado pelo seed, usando as
variáveis `ADMIN_*` do `.env`:

```bash
npm run seed
```

Se já existir um usuário com esse email, o seed não faz nada. Rodar de novo não cria duplicatas.

## Rotas da API

As rotas autenticadas precisam do token no header:

```
Authorization: Bearer <token>
```

### Autenticação
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/login` | Público | Faz login e retorna o token JWT |

### Usuários
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/user` | Público | Cadastra um novo usuário |
| GET | `/user/me` | Autenticado | Retorna o perfil do usuário logado |
| GET | `/user` | Officer, Admin | Lista todos os usuários |
| GET | `/user/:id` | Próprio usuário, Officer, Admin | Busca um usuário pelo id |
| PATCH | `/user/:id` | Próprio usuário, Admin | Atualiza os dados de um usuário |
| DELETE | `/user/:id` | Admin | Exclui um usuário |

### Chamados
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/tickets` | Autenticado | Abre um chamado |
| GET | `/tickets` | Autenticado | Lista os chamados (member vê apenas os seus) |
| GET | `/tickets/:id` | Dono do chamado, Officer, Admin | Busca um chamado pelo id |
| PATCH | `/tickets/:id` | Dono do chamado, Officer, Admin | Atualiza um chamado |
| DELETE | `/tickets/:id` | Dono do chamado, Officer, Admin | Exclui um chamado |
| POST | `/tickets/:id/comments` | Dono do chamado, Officer, Admin | Adiciona um comentário no chamado |
| GET | `/tickets/:id/comments` | Dono do chamado, Officer, Admin | Lista os comentários do chamado, do mais antigo para o mais novo |

### Valores aceitos
- `priority`: `low`, `medium` (padrão) e `high`
- `status`: `open` (padrão), `in_progress` e `closed`
- `role`: `member` (padrão), `officer` e `admin`

## Exemplos de uso

### Cadastro
`POST /user`
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "123456"
}
```

A senha precisa ter no mínimo 6 caracteres.

### Login
`POST /auth/login`
```json
{
  "email": "maria@email.com",
  "senha": "123456"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Abrir um chamado
`POST /tickets`
```json
{
  "title": "Computador não liga",
  "description": "O computador da recepção não liga desde ontem.",
  "priority": "high",
  "category": "hardware"
}
```

Os campos `priority` e `category` são opcionais.

### Atualizar status e responsável (officer ou admin)
`PATCH /tickets/:id`
```json
{
  "status": "in_progress",
  "assignedToId": "id-do-responsavel"
}
```

Para remover o responsável, envie `"assignedToId": null`.

### Comentar em um chamado
`POST /tickets/:id/comments`
```json
{
  "content": "Já verificou se o cabo de energia está conectado?"
}
```

O texto pode ter até 2000 caracteres. O autor do comentário é sempre o usuário do token, e não
pode ser informado no corpo da requisição.

A coleção do Postman em `backend/nimbus.postman_collection.json` também tem exemplos das rotas de chamados.

## Roadmap
- [ ] Testes unitários e e2e
- [x] Seed para criar o primeiro admin
- [x] Documentação com Swagger
- [x] docker-compose com o PostgreSQL
- [ ] Migrations no lugar do `synchronize`
- [x] Arquivo `.env.example`
- [ ] Paginação e filtros na listagem de chamados
- [x] Comentários nos chamados
- [ ] Histórico de alterações do chamado (alterações já são gravadas; falta a rota de consulta)
- [ ] Refresh token
- [ ] Notificações por email
- [ ] Frontend

## Autor
Feito por **João Pedro Pavanelo**.

- GitHub: [JoaoPedroPavanelo11](https://github.com/JoaoPedroPavanelo11)
- LinkedIn: [Joao Pedro Pavanelo](www.linkedin.com/in/joao-pedro-pavanelo-710a9834a)