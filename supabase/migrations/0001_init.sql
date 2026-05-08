-- CRM Design — Initial schema
-- Single-tenant (uso pessoal). RLS enabled with permissive policies for the anon role.

create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  instagram text,
  stage text not null default 'novo_lead',
  source text,
  tags text[] not null default '{}',
  estimated_value numeric(12,2),
  probability int check (probability is null or (probability between 0 and 100)),
  notes text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_stage_position_idx on leads (stage, position);
create index if not exists leads_created_at_idx on leads (created_at desc);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  type text not null default 'nota',
  content text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists interactions_lead_idx on interactions (lead_id, occurred_at desc);

alter table leads enable row level security;
alter table interactions enable row level security;

drop policy if exists "leads public all" on leads;
drop policy if exists "interactions public all" on interactions;

create policy "leads public all" on leads for all using (true) with check (true);
create policy "interactions public all" on interactions for all using (true) with check (true);

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads
  for each row execute function touch_updated_at();
