# Game Server Manager

## Objetivo

Criar um painel web local para gerenciamento de servidores dedicados de jogos rodando em uma máquina Windows 10 pessoal.

O sistema deve ser:
- leve
- modular
- extensível
- realtime
- otimizado para baixo consumo de recursos

Inicialmente os jogos suportados serão:
- Palworld
- Enshrouded
- Windrose

Os servidores já estão instalados via SteamCMD.

---

# Funcionalidades

O sistema deve permitir:

- iniciar servidores
- parar servidores
- reiniciar servidores
- forçar encerramento de processos
- atualizar servidores via SteamCMD
- realizar backups automáticos
- editar configurações dos jogos
- visualizar logs realtime
- visualizar métricas do sistema
- visualizar players online
- executar tarefas agendadas
- detectar crash de servidores
- auto restart opcional
- visualizar uso de CPU/RAM por servidor

---

# Objetivos Arquiteturais

## Prioridades

- baixo consumo de recursos
- simplicidade operacional
- arquitetura modular
- facilidade para adicionar novos jogos
- realtime via websocket
- typescript fullstack
- código compatível com Windows 10
- funcionamento local/offline
- desacoplamento entre módulos
- extensibilidade futura

---

# Stack Tecnológica

## Frontend

- Angular
- TailwindCSS
- Angular Material
- RxJS
- Socket.io client

## Backend

- Node.js
- NestJS
- Socket.io
- SQLite
- Prisma ORM

---

# Bibliotecas

## Sistema
- systeminformation

## Processos
- child_process
- tree-kill

## Query de jogos
- gamedig

## Configuração
- ini
- fs-extra

## Compressão
- archiver

## Agendamentos
- node-cron

## Logging
- pino

---

# Estrutura do Projeto

Monorepo.

```txt
/apps
  /frontend
  /backend

/packages
  /shared

/storage
  /servers
  /backups
  /logs
  /database
```

---

# Estrutura Backend

```txt
backend/src

  /modules
    /servers
    /metrics
    /configs
    /scheduler
    /backups
    /steamcmd
    /logs
    /websocket
    /settings
    /games

  /shared
    /filesystem
    /events
    /types
    /utils
```

---

# Arquitetura Event Driven Interna

O backend deve utilizar EventEmitter interno para desacoplar módulos.

Eventos internos:
- server.started
- server.stopped
- server.crashed
- server.updated
- backup.created
- metrics.updated
- logs.received

Objetivo:
- evitar acoplamento
- simplificar websocket
- facilitar automações
- melhorar manutenção

---

# Arquitetura de Jogos

Cada jogo deve implementar uma interface comum.

```ts
export interface GameProvider {
  start(): Promise<void>

  stop(): Promise<void>

  restart(): Promise<void>

  kill(): Promise<void>

  update(): Promise<void>

  backup(): Promise<void>

  queryStatus(): Promise<GameServerStatus>

  readConfig(): Promise<any>

  writeConfig(data: any): Promise<void>

  getLogs(): Promise<string[]>
}
```

---

# Providers Iniciais

Implementar:
- PalworldProvider
- EnshroudedProvider
- WindroseProvider

Cada provider deve conhecer:
- diretório do servidor
- executável
- argumentos
- portas
- arquivos de configuração
- appId SteamCMD
- paths de save
- método de query players
- parser de configuração
- comandos de start/stop

---

# Estrutura dos Jogos

```txt
/games

  /palworld
    palworld.provider.ts
    palworld.config-schema.ts
    palworld.config-adapter.ts

  /enshrouded
    enshrouded.provider.ts

  /windrose
    windrose.provider.ts
```

---

# Status dos Servidores

```ts
export type ServerStatus =
  | 'offline'
  | 'starting'
  | 'online'
  | 'stopping'
  | 'updating'
  | 'backing_up'
  | 'crashed'
```

---

# Process Metadata

```ts
export type ManagedProcess = {
  pid: number

  startedAt: Date

  restartCount: number

  lastExitCode?: number

  cpuUsage?: number

  ramUsage?: number
}
```

---

# Reconciliação de Estado

Ao iniciar o backend, o sistema deve:
- escanear processos conhecidos
- detectar servidores já rodando
- reconciliar estado interno
- recuperar métricas
- restaurar websocket state

Objetivo:
- evitar inconsistência após restart da aplicação

---

# Banco de Dados

Utilizar SQLite.

---

# Tabelas

## servers

```ts
id
name
game
status
path
exePath
configPath
savePath
steamAppId
queryPort
gamePort
lastStartAt
lastCrashAt
lastBackupAt
lastUpdateAt
createdAt
updatedAt
```

---

## schedules

```ts
id
serverId
type
cronExpression
enabled
payload
lastRunAt
nextRunAt
createdAt
```

---

## backups

```ts
id
serverId
path
size
createdAt
```

---

## settings

```ts
id
key
value
```

---

# REST API

## Servers

```http
GET /servers

GET /servers/:id

POST /servers/:id/start

POST /servers/:id/stop

POST /servers/:id/restart

POST /servers/:id/kill

POST /servers/:id/update
```

---

## Configs

```http
GET /servers/:id/config

PUT /servers/:id/config
```

---

## Backups

```http
GET /servers/:id/backups

POST /servers/:id/backup
```

---

## Metrics

```http
GET /metrics/system
```

---

# DTO Pattern

Utilizar DTOs obrigatoriamente para:
- requests
- websocket payloads
- config updates
- scheduler jobs

Objetivo:
- validação
- tipagem
- padronização

---

# Gerenciamento de Processos

O sistema deve gerenciar processos Windows localmente.

Utilizar:
- child_process.spawn

O sistema deve:
- armazenar PID
- detectar crash
- reiniciar automaticamente opcionalmente
- limitar tentativas de restart
- evitar restart loop infinito
- capturar stdout/stderr
- transmitir logs via websocket

---

# Uso de CPU/RAM por Servidor

O uso de CPU e RAM por servidor deve ser calculado utilizando:
- PID principal do processo
- processos filhos opcionais

---

# Controle de Servidores

## Funcionalidades

- start
- stop
- restart
- force kill
- update
- backup

---

# Fluxo Restart

1. salvar estado
2. parar servidor
3. aguardar encerramento
4. iniciar novamente

---

# Atualização SteamCMD

Implementar atualização automática.

Exemplo:

```bash
steamcmd +login anonymous +app_update APP_ID validate +quit
```

Cada jogo possui APP_ID próprio.

O sistema deve:
- exibir logs da atualização
- detectar falha
- armazenar data da última atualização

---

# Métricas do Sistema

Utilizar:
- systeminformation

---

# Dashboard deve exibir

## Sistema
- uso CPU
- uso RAM
- uso disco
- temperatura
- uptime
- processos ativos

## Rede
- IP local
- IP externo
- tráfego rede

## Servidores
- status
- uptime
- players online
- cpu usage
- ram usage

---

# Frequência Atualização

Realtime via websocket.

## Atualização
- 1 segundo para métricas críticas
- 5 segundos para métricas leves

Evitar polling REST.

---

# Histórico de Métricas

Métricas históricas devem possuir:
- retenção configurável
- limpeza automática

Objetivo:
- evitar crescimento infinito do banco

---

# Players Online

Utilizar:
- gamedig

O sistema deve tentar utilizar:
- Steam Query
- A2S
- query protocol do jogo

Retornar:
- quantidade players
- max players
- nomes players
- ping
- mapa

Se jogo não suportar query:
- retornar indisponível

---

# Configuração dos Jogos

## Objetivo

Editar configurações via interface web.

---

# Regras Obrigatórias

NÃO utilizar regex simples para editar arquivos.

Fluxo obrigatório:
1. ler arquivo
2. parsear
3. converter objeto
4. editar
5. serializar novamente

---

# Formatos Suportados

## INI
Utilizar:
- ini

## JSON
Utilizar parser nativo.

## CFG
Implementar parser custom simples.

---

# Config Schema

Cada jogo deve possuir schema próprio.

Exemplo:

```ts
export const PalworldConfigSchema = {
  serverName: {
    type: 'string',
    label: 'Server Name'
  },

  serverPassword: {
    type: 'string',
    label: 'Password'
  },

  maxPlayers: {
    type: 'number',
    min: 1,
    max: 32
  }
}
```

---

# Config Adapter

Cada jogo deve possuir adapter responsável por:
- leitura
- serialização
- validação
- persistência

Separar:
- schema UI
- adapter de filesystem

---

# Frontend Config Editor

O frontend deve renderizar forms dinamicamente baseado no schema.

---

# Sistema de Backups

## Objetivo

Criar backups automáticos compactados.

---

# Fluxo

1. pausar save opcionalmente
2. compactar save folder
3. armazenar zip
4. registrar no banco
5. limpar backups antigos

---

# Estrutura de Backups

```txt
/storage/backups

  /palworld
    /2026-05-15_06-00.zip
```

---

# Scheduler

Utilizar:
- node-cron

---

# Funcionalidades

## Restart automático
Exemplo:
- reiniciar todos dias 06:00

## Backup automático
Exemplo:
- diário
- semanal

## Auto update
Opcional.

## Health check

Verificar:
- processo morreu
- memória excessiva
- servidor offline

---

# Prioridade de Jobs

O scheduler deve impedir conflitos.

Exemplos:
- backup não pode rodar durante update
- restart não pode ocorrer durante backup
- update não pode ocorrer durante restart

---

# Auto Recovery

O sistema deve:
- detectar crash
- reiniciar automaticamente
- limitar tentativas de restart
- evitar restart loop infinito

---

# Logs

Capturar:
- stdout
- stderr

---

# Logs Realtime

Logs realtime devem utilizar:
- buffer memória temporário
- stream incremental websocket

---

# Logs Persistidos

Logs persistidos devem utilizar:
- arquivo rotativo opcional
- retenção configurável

Estrutura:

```txt
/storage/logs

  /palworld
    latest.log
    2026-05-15.log
```

---

# WebSocket

Utilizar Socket.io.

---

# Eventos

## metrics:update
Atualiza métricas.

## server:status
Atualiza status servidor.

## server:logs
Transmitir logs.

## server:players
Atualizar players online.

---

# Frontend

---

# Telas

## Dashboard

Exibir:
- métricas sistema
- status servidores
- players online
- uso recursos

---

## Server Details

Exibir:
- logs realtime
- controls
- configs
- backups

---

## Config Editor

Renderizar forms dinâmicos.

---

## Scheduler

Gerenciar cronjobs.

---

# Dashboard UI

## Cards Sistema
- CPU
- RAM
- Disco
- Temperatura

## Cards Servidores
- status
- players
- uptime
- botões ações

---

# Configuração Inicial

Criar:
- setup wizard simples
- cadastro manual paths servidores
- auto-discovery opcional

O sistema pode tentar detectar:
- instalações SteamCMD
- executáveis conhecidos
- diretórios padrão

---

# Requisitos de Performance

O sistema deve:
- consumir pouca RAM
- evitar loops pesados
- evitar polling excessivo
- utilizar websocket
- evitar bibliotecas extremamente pesadas

Objetivo:
- backend abaixo de 300MB RAM
- frontend leve
- impacto mínimo nos servidores

---

# Segurança

Inicialmente:
- sistema local
- sem autenticação obrigatória

Arquitetura deve permitir futuramente:
- login
- JWT
- múltiplos usuários

---

# Environment Variables

```env
PORT=
DATABASE_PATH=
STORAGE_PATH=
LOG_LEVEL=
```

---

# Convenções

## Typescript Strict
Obrigatório.

## ESLint
Obrigatório.

## Prettier
Obrigatório.

---

# Arquitetura

Preferir:
- services
- adapters
- providers
- interfaces
- DTOs

Evitar:
- lógica gigante em controllers
- acoplamento entre jogos
- filesystem espalhado pelo projeto

---

# Roadmap

## MVP

### Fase 1
- estrutura backend
- websocket
- dashboard
- start/stop/restart
- métricas sistema

### Fase 2
- logs realtime
- players online
- SteamCMD update

### Fase 3
- config editor
- backups
- scheduler

### Fase 4
- auto restart crash
- health checks
- notificações

### Fase 5
- autenticação
- acesso remoto
- multi-host

---

# Não Fazer Inicialmente

NÃO implementar:
- kubernetes
- docker swarm
- redis
- rabbitmq
- microservices
- grafana
- prometheus

O sistema é:
- single machine
- local
- lightweight

---

# Objetivo Final

O sistema deve funcionar como um painel local leve de gerenciamento de servidores dedicados de jogos para uso pessoal, semelhante a:
- Pterodactyl
- AMP

Porém simplificado, modular e otimizado para:
- Windows 10
- SteamCMD
- uso pessoal
- baixo consumo de recursos