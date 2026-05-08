# CRM Design

CRM de prospecção e pipeline de vendas para **designers**, com kanban arrastável,
perfil de leads, timeline de interações e importação em massa de CSV/XLS.

Identidade visual: amarelo `#ffaa00` em gradiente para laranja `#ff6a00`, sobre
preto e branco.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (Postgres, RLS, REST automático)
- **@dnd-kit** para drag-and-drop do kanban
- **Papaparse** + **xlsx** (SheetJS) para importação CSV/Excel
- **Recharts** para gráficos do dashboard

## Funcionalidades

- **Pipeline (kanban)** com 6 estágios: Novo Lead → Contato Feito → Proposta Enviada → Negociação → Fechado (Ganhou) → Perdido. Arraste cards entre colunas para mudar o estágio.
- **Perfil do lead** com dados de contato, valor estimado, probabilidade, fonte, tags e timeline cronológica de interações (notas, ligações, e-mails, reuniões, mensagens).
- **Lista de leads** com busca textual e filtros por estágio, fonte e tags.
- **Importação CSV / XLS / XLSX** com:
  - Detecção automática de cabeçalhos (`nome|email|telefone|empresa|...`)
  - Mapeamento manual de colunas
  - Pré-visualização das primeiras 10 linhas
  - Inserção em chunks de 500 registros
- **Dashboard** com KPIs: total de leads, valor em pipeline, ganhos no mês, taxa de conversão, e gráfico de barras por estágio.

## Setup

### 1. Criar projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor, execute o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — isso cria as tabelas `leads` e `interactions` com RLS permissivo (sem login, uso pessoal). Se você já rodou a 0001 antes do dia 8/mai, rode também [`0002_position_bigint.sql`](supabase/migrations/0002_position_bigint.sql) para evitar overflow do campo `position`.
3. Em **Project Settings → API**, copie a `URL` e a `anon public key`.

### 2. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com seus valores:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` — você será redirecionado para `/pipeline`.

## Estrutura

```
app/
  pipeline/             # Kanban arrastável
  leads/
    page.tsx            # Lista + filtros
    [id]/page.tsx       # Perfil do lead
    import/page.tsx     # Wizard de importação
  dashboard/            # KPIs + gráficos
components/
  Sidebar.tsx
  PipelineBoard.tsx
  LeadForm.tsx
  InteractionTimeline.tsx
  ImportWizard.tsx
  ui/                   # Modal, PageHeader, EmptyState, SetupNotice
lib/
  supabase.ts           # Cliente Supabase
  api.ts                # CRUD de leads e interações
  parsers.ts            # CSV (papaparse) + XLS (SheetJS)
  types.ts              # Tipos compartilhados
  constants.ts          # Estágios, fontes, mapping
  utils.ts              # cn(), formatCurrency, etc.
supabase/
  migrations/0001_init.sql
```

## Notas de segurança

A migration usa policies de RLS **permissivas** (`using (true)`) para o caso de uso
pessoal/single-tenant. Se você for hospedar publicamente ou compartilhar a URL
com terceiros, ajuste a auth — adicione `supabase.auth` e altere as policies para
filtrar por `auth.uid()`.

## Build de produção

```bash
npm run build
npm start
```

## Importando o seu primeiro CSV

Cabeçalhos reconhecidos automaticamente (case-insensitive, com ou sem acento):

| Campo | Cabeçalhos aceitos |
|---|---|
| `name` | nome, name, cliente, lead, contato |
| `email` | email, e-mail, mail |
| `phone` | telefone, phone, celular, whatsapp, tel |
| `company` | empresa, company, negocio, marca |
| `instagram` | instagram, ig, @ |
| `source` | fonte, source, origem, canal |
| `tags` | tags, categorias, rotulos |
| `estimated_value` | valor, value, ticket, preco |
| `probability` | probabilidade, probability, chance |
| `notes` | notas, observacoes, notes, obs |

Tags podem vir separadas por `,`, `;` ou `|`. Valores monetários aceitam vírgula
ou ponto como decimal.
