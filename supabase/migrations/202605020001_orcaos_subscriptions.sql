create table if not exists public.orcaos_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  user_id text,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orcaos_subscriptions_plan_check check (plan in ('free', 'pro')),
  constraint orcaos_subscriptions_status_check check (status in ('active', 'trial', 'past_due', 'canceled', 'inactive'))
);

create index if not exists orcaos_subscriptions_user_id_idx
  on public.orcaos_subscriptions(user_id);

create index if not exists orcaos_subscriptions_email_idx
  on public.orcaos_subscriptions(email);

alter table public.orcaos_subscriptions enable row level security;

create or replace function public.set_orcaos_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orcaos_subscriptions_updated_at
  on public.orcaos_subscriptions;

create trigger set_orcaos_subscriptions_updated_at
before update on public.orcaos_subscriptions
for each row
execute function public.set_orcaos_subscriptions_updated_at();
