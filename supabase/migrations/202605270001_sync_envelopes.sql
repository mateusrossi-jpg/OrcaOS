-- FASE 3: CLOUD & SAAS - Event Store Replication
-- Esta tabela armazena a trilha imutável de eventos sincronizada entre dispositivos.

create table if not exists public.sync_envelopes (
  id uuid primary key default gen_random_uuid(),
  envelope_id text unique not null,
  event_id text not null,
  device_id text not null,
  user_id uuid references auth.users(id) not null,
  aggregate_id text not null,
  aggregate_type text not null,
  event_type text not null,
  payload jsonb not null,
  sequence bigint not null,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Índices para performance de replay e busca por agregado
create index if not exists sync_envelopes_user_id_idx on public.sync_envelopes(user_id);
create index if not exists sync_envelopes_aggregate_id_idx on public.sync_envelopes(aggregate_id);
create index if not exists sync_envelopes_sequence_idx on public.sync_envelopes(user_id, sequence);

-- RLS (Row Level Security)
alter table public.sync_envelopes enable row level security;

create policy "Users can only see their own sync events"
  on public.sync_envelopes for select
  using (auth.uid() = user_id);

create policy "Users can only insert their own sync events"
  on public.sync_envelopes for insert
  with check (auth.uid() = user_id);

-- Realtime Configuration
alter publication supabase_realtime add table public.sync_envelopes;
