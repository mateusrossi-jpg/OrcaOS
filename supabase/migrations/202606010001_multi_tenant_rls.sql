-- FASE 3: SPRINT P0 - MULTI-TENANT RLS AND TENANCY
-- Esta migração atualiza a tabela public.sync_envelopes e estabelece as políticas de RLS baseadas em company_id e workspace_id.

-- 1. Adicionar colunas de Tenancy se não existirem
alter table public.sync_envelopes add column if not exists company_id uuid;
alter table public.sync_envelopes add column if not exists workspace_id uuid;

-- 2. Índices de Tenancy compostos para otimização de consultas e pull
create index if not exists sync_envelopes_company_id_sequence_idx on public.sync_envelopes(company_id, sequence);
create index if not exists sync_envelopes_company_workspace_idx on public.sync_envelopes(company_id, workspace_id);

-- 3. Função Auxiliar para extrair o company_id e o workspace_id do JWT de autenticação de forma rápida
create or replace function public.auth_company()
returns uuid as $$
    select nullif(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'company_id', '')::uuid;
$$ language sql stable security definer;

create or replace function public.auth_workspace()
returns uuid as $$
    select nullif(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'workspace_id', '')::uuid;
$$ language sql stable security definer;

-- 4. Dropar políticas de isolamento por usuário antigas se existirem
drop policy if exists "Users can only see their own sync events" on public.sync_envelopes;
drop policy if exists "Users can only insert their own sync events" on public.sync_envelopes;
drop policy if exists "tenant_isolation_policy" on public.sync_envelopes;

-- 5. Criar Políticas RLS de Multiempresa para sync_envelopes (Imutabilidade de logs)
create policy "tenant_select_sync_envelopes" on public.sync_envelopes
    for select to authenticated
    using (company_id = public.auth_company());

create policy "tenant_insert_sync_envelopes" on public.sync_envelopes
    for insert to authenticated
    with check (company_id = public.auth_company());

-- 6. Trigger PostgreSQL no servidor para sobrescrever e forçar gravação das chaves do JWT
create or replace function public.force_tenant_envelope_owner()
returns trigger as $$
begin
    new.company_id := public.auth_company();
    new.user_id := auth.uid();
    
    -- Se o workspace_id for enviado vazio ou nulo, tenta extrair do JWT como fallback
    if new.workspace_id is null then
        new.workspace_id := public.auth_workspace();
    end if;
    
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists before_insert_force_tenant on public.sync_envelopes;
create trigger before_insert_force_tenant
    before insert on public.sync_envelopes
    for each row
    execute function public.force_tenant_envelope_owner();
