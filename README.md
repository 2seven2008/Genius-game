# 🧠 GENIUS — Jogo de Memória Multiplayer

> O clássico jogo Simon Says / Genius reimaginado com multiplayer em tempo real, estética neon futurista e pronto para produção.

---

## 📸 Telas

| Início | Menu | Singleplayer | Multiplayer | Ranking | Configurações |
|--------|------|-------------|-------------|---------|---------------|
| Login/Registro | Stats do usuário | Board animado | Sala em tempo real | Top global | Preferências |

---

## 🛠 Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| **Next.js 14** (App Router) | Framework React com SSR/SSG |
| **TypeScript** | Tipagem estática |
| **TailwindCSS** | Estilização utilitária |
| **Framer Motion** | Animações e transições |
| **Socket.IO Client** | Comunicação em tempo real |
| **Zustand** | Gerenciamento de estado global |
| **Axios** | Requisições HTTP com interceptors |
| **React Hot Toast** | Notificações |
| **Lucide React** | Ícones |
| **Web Audio API** | Sons do jogo (sem dependências externas) |

### Backend
| Tecnologia | Uso |
|---|---|
| **Node.js + Express** | Servidor HTTP |
| **TypeScript** | Tipagem estática |
| **Socket.IO** | WebSockets para multiplayer |
| **Prisma ORM** | Acesso ao banco com type-safety |
| **PostgreSQL** | Banco de dados relacional |
| **JWT** | Autenticação com access + refresh token |
| **bcryptjs** | Hash de senhas |
| **Zod** | Validação de schemas |
| **Winston** | Logging estruturado |
| **Helmet + CORS** | Segurança HTTP |
| **express-rate-limit** | Proteção contra flood |

---

## 📁 Estrutura do Projeto

```
genius-game/
├── frontend/
│   └── src/
│       ├── app/                    # Next.js App Router (páginas)
│       │   ├── page.tsx            # Landing / Login
│       │   ├── home/page.tsx       # Menu principal
│       │   ├── singleplayer/page.tsx
│       │   ├── multiplayer/page.tsx
│       │   ├── ranking/page.tsx
│       │   └── settings/page.tsx
│       ├── components/
│       │   ├── game/               # GeniusBoard, ScoreDisplay
│       │   ├── ui/                 # NeonButton, NeonInput, Card, GeniusLogo
│       │   └── layout/             # withAuth HOC
│       ├── features/               # Telas completas por domínio
│       │   ├── auth/               # LandingScreen, HomeScreen
│       │   ├── game/               # SingleplayerScreen
│       │   ├── multiplayer/        # MultiplayerScreen
│       │   ├── ranking/            # RankingScreen
│       │   └── settings/           # SettingsScreen
│       ├── hooks/                  # useSound, useSocket, useSingleplayer
│       ├── contexts/               # Zustand auth store
│       ├── services/               # api.ts (axios), socket.ts, sound.ts
│       ├── types/                  # Tipos TypeScript globais
│       └── utils/                  # cn() helper
│
└── backend/
    ├── prisma/
    │   └── schema.prisma           # Modelos: User, Room, Match, Ranking
    └── src/
        ├── index.ts                # Entry point (Express + Socket.IO)
        ├── controllers/            # AuthController, RoomController, ScoreController
        ├── routes/                 # auth, room, score routes
        ├── services/               # AuthService, RoomService, ScoreService
        ├── repositories/           # UserRepository, RoomRepository
        ├── sockets/                # game.socket.ts (lógica multiplayer)
        ├── middlewares/            # auth.middleware.ts, error.middleware.ts
        ├── database/               # Prisma client singleton
        ├── utils/                  # logger, jwt, helpers
        └── types/                  # Tipos TypeScript do backend
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (ou via Docker)
- npm ou yarn

### 1. Banco de Dados (Docker opcional)

```bash
docker run --name genius-db \
  -e POSTGRES_USER=genius \
  -e POSTGRES_PASSWORD=genius123 \
  -e POSTGRES_DB=genius_db \
  -p 5432:5432 -d postgres:15
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configs (DATABASE_URL, JWT_SECRET, etc.)

# Gerar cliente Prisma e migrar banco
npm run prisma:generate
npm run prisma:push

# Iniciar em desenvolvimento
npm run dev
```

O backend estará em: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Iniciar em desenvolvimento
npm run dev
```

O frontend estará em: `http://localhost:3000`

---

## 🌐 Deploy em Produção

### Frontend → Vercel

```bash
# Na raiz do projeto frontend
vercel

# Configurar variáveis de ambiente no painel Vercel:
# NEXT_PUBLIC_API_URL = https://seu-backend.railway.app
# NEXT_PUBLIC_SOCKET_URL = https://seu-backend.railway.app
```

### Backend → Railway

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione PostgreSQL como serviço
3. Faça deploy do backend apontando para a pasta `/backend`
4. Configure as variáveis de ambiente no painel
5. Execute as migrations: `npx prisma migrate deploy`

### Backend → Render

1. Crie um Web Service no [Render](https://render.com)
2. Build Command: `npm install && npm run prisma:generate && npm run build`
3. Start Command: `npm start`
4. Adicione PostgreSQL como serviço externo
5. Configure variáveis de ambiente

### Variáveis de Ambiente em Produção

**Backend:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/genius_db
PORT=3001
NODE_ENV=production
JWT_SECRET=chave-super-secreta-32-chars-minimo
JWT_REFRESH_SECRET=outra-chave-super-secreta
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=https://seu-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
NEXT_PUBLIC_SOCKET_URL=https://seu-backend.railway.app
```

---

## 🎮 Funcionalidades

### Singleplayer
- ✅ Sequência aleatória crescente
- ✅ Pontuação por nível (`nível × 100 pontos`)
- ✅ Velocidade progressiva (de 800ms a 300ms)
- ✅ Animação de iluminação dos quadrantes
- ✅ Sons individuais por cor (Web Audio API)
- ✅ Efeito de shake ao errar
- ✅ Salvar recorde no banco
- ✅ Contador de nível visual

### Multiplayer
- ✅ Criar sala (pública ou privada)
- ✅ Entrar por código ou lista pública
- ✅ Sistema de lobby com jogadores conectados
- ✅ Host pode iniciar a partida
- ✅ Sincronização via Socket.IO
- ✅ Rodadas compartilhadas — cada jogador repete a sequência
- ✅ Quem errar é eliminado
- ✅ Último sobrevivente vence
- ✅ Placar ao vivo
- ✅ Transferência de host se host sair
- ✅ Tratamento de desconexão
- ✅ Reset automático da sala após partida

### Autenticação
- ✅ Criar conta (email + senha)
- ✅ Login com JWT + Refresh Token
- ✅ Jogar como Visitante (sem conta)
- ✅ Persistência de sessão via cookies
- ✅ Auto-refresh de token expirado

### Ranking
- ✅ Top jogadores por Vitórias
- ✅ Top jogadores por Score
- ✅ Destaque visual para top 3
- ✅ Paginação (20 por padrão)

---

## 🔌 Socket.IO Events

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `create_room` | Client → Server | Criar nova sala |
| `join_room` | Client → Server | Entrar em sala existente |
| `leave_room` | Client → Server | Sair da sala |
| `start_match` | Client → Server | Host inicia partida |
| `sequence_shown` | Client → Server | Host confirma fim da animação |
| `player_input` | Client → Server | Jogador envia sua sequência |
| `room_created` | Server → Client | Confirmação de criação |
| `room_updated` | Server → Room | Jogadores do lobby mudaram |
| `match_started` | Server → Room | Partida iniciada com sequência |
| `your_turn` | Server → Room | Vez de um jogador específico |
| `next_round` | Server → Room | Próximo nível começando |
| `player_failed` | Server → Room | Jogador errou |
| `player_correct` | Server → Room | Jogador acertou |
| `match_ended` | Server → Room | Fim de partida com vencedor |
| `room_reset` | Server → Room | Sala resetada para novo jogo |
| `public_rooms_update` | Server → All | Lista de salas públicas atualizada |

---

## 🗄 Modelos de Banco (Prisma)

```prisma
User      # id, username, email, password, wins, matches, highScore
Room      # id, code, isPublic, maxPlayers, status, hostId
Match     # id, mode, status, roomId, winnerId
MatchPlayer # matchId, userId, score, maxLevel
Ranking   # userId, score, streak, category
```

---

## 🔒 Segurança

- Senhas com bcrypt (salt rounds: 12)
- JWT com expiração configurável
- Rate limiting nas rotas da API
- Validação de entrada com Zod
- Helmet para headers HTTP seguros
- CORS configurado por domínio
- Sanitização automática pelo ORM

---

## 📱 PWA

O frontend inclui `manifest.json` para instalação como PWA em dispositivos móveis.

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT — use livremente em projetos pessoais e comerciais.
