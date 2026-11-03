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

### Segurança
- Senhas armazenadas como hash (bcrypt) e nunca retornadas pela API
- Validação de todos os dados recebidos, rejeitando campos inesperados
- Limite de 60 requisições por minuto (rate limiting)

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

### Ferramentas
- **[Postman](https://www.postman.com)**: coleção de requisições em `backend/nimbus.postman_collection.json`

## Como rodar o projeto

### Pré-requisitos
- Node.js 20 ou superior
- npm
- PostgreSQL

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/projeto-nimbus.git
cd projeto-nimbus/backend
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar o .env
Crie um arquivo `.env` dentro da pasta `backend` com as variáveis abaixo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=nimbus

JWT_SECRET=troque_por_uma_chave_secreta
PORT=3000
```

A `PORT` é opcional (o padrão é 3000). Sem o `JWT_SECRET` a aplicação não inicia.

### 4. Criar o banco de dados
As tabelas são criadas automaticamente pelo TypeORM, mas o banco precisa existir antes:

```sql
CREATE DATABASE nimbus;
```

### 5. Rodar a aplicação
```bash
npm run start:dev
```

A API fica disponível em `http://localhost:3000`.

### 6. Criar o primeiro admin
Todo cadastro entra como member, então o primeiro admin precisa ser definido direto no banco.
Cadastre um usuário pela rota `POST /user` e depois rode:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'seu@email.com';
```

O nome da tabela fica entre aspas porque `user` é uma palavra reservada no PostgreSQL.

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

A coleção do Postman em `backend/nimbus.postman_collection.json` também tem exemplos das rotas de chamados.

## Roadmap
- [ ] Testes unitários e e2e
- [ ] Seed para criar o primeiro admin
- [ ] Documentação com Swagger
- [ ] docker-compose com o PostgreSQL
- [ ] Migrations no lugar do `synchronize`
- [ ] Arquivo `.env.example`
- [ ] Paginação e filtros na listagem de chamados
- [ ] Comentários nos chamados
- [ ] Histórico de alterações do chamado
- [ ] Refresh token
- [ ] Notificações por email
- [ ] Frontend

## Autor
Feito por **João Pedro Pavanelo**.

- GitHub: [JoaoPedroPavanelo11](https://github.com/JoaoPedroPavanelo11)
- LinkedIn: [Joao Pedro Pavanelo](www.linkedin.com/in/joao-pedro-pavanelo-710a9834a)