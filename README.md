# Game Server Manager

Painel web local para gerenciamento de servidores dedicados de jogos rodando em máquina Windows 10 pessoal.

## Stack

- **Frontend**: Angular 18, TailwindCSS, Angular Material, Socket.io Client
- **Backend**: NestJS, Prisma ORM, SQLite, Socket.io
- **Monorepo**: pnpm workspaces

## Jogos Suportados

- Palworld
- Enshrouded
- Windrose

## Funcionalidades

- Iniciar / Parar / Reiniciar servidores
- Forçar encerramento de processos
- Atualizar servidores via SteamCMD
- Backups automáticos compactados
- Editor de configurações via interface web
- Logs em realtime via WebSocket
- Métricas do sistema (CPU, RAM, Disco, Rede)
- Players online via GameDig
- Scheduler (cron jobs) para restart, backup, update
- Detecção de crash com auto-restart
- Arquitetura event-driven interna

## Estrutura

```
/apps
  /frontend     # Angular 18
  /backend      # NestJS
/packages
  /shared       # Tipos e DTOs compartilhados
/storage
  /servers
  /backups
  /logs
  /database
```

## Setup

```bash
# Instalar dependências
pnpm install

# Build shared package
pnpm build:shared

# Gerar Prisma client e push schema
cd apps/backend
npx prisma generate
npx prisma db push

# Dev
pnpm dev:backend    # Backend em http://localhost:3000
pnpm dev:frontend   # Frontend em http://localhost:4200
```

## Environment Variables

```env
PORT=3000
DATABASE_URL="file:./dev.db"
STORAGE_PATH="../../storage"
LOG_LEVEL="info"
STEAMCMD_PATH="steamcmd"
```

## API Endpoints

| Method | Endpoint | Descrição |
|--------|---------|-----------|
| GET | /api/servers | Listar servidores |
| GET | /api/servers/:id | Detalhes do servidor |
| POST | /api/servers/:id/start | Iniciar servidor |
| POST | /api/servers/:id/stop | Parar servidor |
| POST | /api/servers/:id/restart | Reiniciar servidor |
| POST | /api/servers/:id/kill | Forçar encerramento |
| POST | /api/servers/:id/update | Atualizar via SteamCMD |
| GET | /api/servers/:id/config | Obter configuração |
| PUT | /api/servers/:id/config | Atualizar configuração |
| GET | /api/servers/:id/backups | Listar backups |
| POST | /api/servers/:id/backups | Criar backup |
| GET | /api/metrics/system | Métricas do sistema |
| GET | /api/servers/:serverId/schedules | Listar schedules |
| POST | /api/servers/:serverId/schedules | Criar schedule |

## WebSocket Events

| Evento | Descrição |
|--------|-----------|
| metrics:update | Atualização de métricas do sistema |
| server:status | Mudança de status do servidor |
| server:logs | Logs em realtime |
| server:players | Atualização de players online |
