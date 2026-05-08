# CRM Jurídico

CRM de prospecção e gestão de carteira para **advogados e escritórios de advocacia**,
com pipeline arrastável, perfil de cliente potencial, histórico de contatos e
importação em massa de planilhas.

Identidade visual: **azul-marinho `#0b2545`**, **preto** e **dourado `#c9a14a`** —
uma paleta sóbria, alinhada ao posicionamento institucional do mercado jurídico.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (Postgres, RLS, REST automático)
- **@dnd-kit** para drag-and-drop do kanban
- **Papaparse** + **xlsx** (SheetJS) para importação CSV/Excel
- **Recharts** para gráficos do dashboard

## Funcionalidades

- **Pipeline (kanban)** com 6 estágios concebidos para o ciclo comercial jurídico:
  Prospecção → Contato Inicial → Reunião / Diagnóstico → Proposta de Honorários →
  Cliente Ativo → Arquivado. Arraste os cartões entre as colunas para atualizar
  o estágio.
- **Cadastro do cliente potencial** com razão social, CNPJ, contato responsável,
  perfil online (LinkedIn / site), origem, áreas de atuação (tags), honorários
  estimados, probabilidade de contratação e histórico cronológico de contatos
  (anotações, ligações, reuniões, e-mails, mensagens).
- **Carteira de cadastros** com busca textual e filtros por estágio, origem
  (Indicação, LinkedIn, OAB, etc.) e áreas de atuação.
- **Importação CSV / XLS / XLSX** com:
  - Detecção automática de cabeçalhos em PT/EN
  - Mapeamento manual de colunas
  - Pré-visualização das primeiras 10 linhas
  - Inserção em chunks de 500 registros
- **Dashboard** com KPIs: cadastros na carteira, honorários em prospecção,
  contratos firmados no mês, taxa de conversão, e gráfico de barras por estágio.

## Setup

### 1. Criar projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor, execute o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — isso cria as tabelas `leads` e `interactions` com RLS permissivo (uso pessoal). Se você já rodou a 0001 antes do dia 8/mai, rode também [`0002_position_bigint.sql`](supabase/migrations/0002_position_bigint.sql) e [`0003_legal_pipeline.sql`](supabase/migrations/0003_legal_pipeline.sql) para ajustar o tipo do campo `position` e migrar os estágios para o vocabulário jurídico.
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

## Pipeline jurídico — estágios

| Estágio | Descrição |
|---|---|
| **Prospecção** | Empresa identificada como possível cliente, ainda sem contato. |
| **Contato Inicial** | Primeiro contato realizado (e-mail, ligação, mensagem). |
| **Reunião / Diagnóstico** | Reunião agendada ou realizada para entender a demanda. |
| **Proposta de Honorários** | Proposta comercial enviada para análise do cliente. |
| **Cliente Ativo** | Contrato assinado — cliente em atendimento. |
| **Arquivado** | Negociação encerrada sem contratação. |

## Estrutura

```
app/
  pipeline/             # Kanban arrastável
  leads/
    page.tsx            # Lista da carteira + filtros
    [id]/page.tsx       # Cadastro completo do cliente potencial
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
  api.ts                # CRUD de cadastros e contatos
  parsers.ts            # CSV (papaparse) + XLS (SheetJS)
  types.ts              # Tipos compartilhados
  constants.ts          # Estágios, origens, mapping
  utils.ts              # cn(), formatCurrency, etc.
supabase/
  migrations/0001_init.sql
  migrations/0002_position_bigint.sql
  migrations/0003_legal_pipeline.sql
```

## Notas de segurança

A migration usa policies de RLS **permissivas** (`using (true)`) para o caso de uso
pessoal/single-tenant. Se você for hospedar publicamente ou compartilhar a URL
com terceiros (em especial dados de clientes potenciais cobertos por sigilo
profissional), ajuste a auth — adicione `supabase.auth` e altere as policies para
filtrar por `auth.uid()`.

## Build de produção

```bash
npm run build
npm start
```

## Importação de planilhas

Cabeçalhos reconhecidos automaticamente (case-insensitive, com ou sem acento):

| Campo | Cabeçalhos aceitos |
|---|---|
| `name` | nome, name, cliente, lead, contato, razão social, responsável |
| `email` | email, e-mail, mail |
| `phone` | telefone, phone, celular, whatsapp, tel |
| `company` | empresa, company, escritório, marca, cnpj |
| `instagram` | instagram, ig, @, linkedin, site, url |
| `source` | fonte, source, origem, canal |
| `tags` | tags, categorias, áreas, atuação |
| `estimated_value` | valor, value, ticket, preço, honorários |
| `probability` | probabilidade, probability, chance |
| `notes` | notas, observações, notes, obs |

Tags / áreas de atuação podem vir separadas por `,`, `;` ou `|`. Valores monetários
aceitam vírgula ou ponto como decimal.
