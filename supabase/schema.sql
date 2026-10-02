-- =====================================================================
-- FinTrack: esquema do banco
-- Execute no SQL Editor do Supabase
-- =====================================================================

-- 1) TABELAS -----------------------------------------------------------

create table if not exists public.categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  type  text not null check (type in ('income', 'expense')),
  icon  text not null,   -- nome do ícone (Ionicons)
  color text not null,   -- cor em hexadecimal

  unique (name, type),   -- evita categorias duplicadas
  unique (id, type)      -- necessário para a FK composta abaixo
);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  category_id uuid not null,
  type        text not null check (type in ('income', 'expense')),
  description text not null check (char_length(description) between 2 and 80),
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null default current_date,
  created_at  timestamptz not null default now(),

  -- garante que o tipo da transação seja o mesmo da categoria
  foreign key (category_id, type)
    references public.categories (id, type)
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- 2) SEGURANÇA: ROW LEVEL SECURITY -------------------------------------

alter table public.categories   enable row level security;
alter table public.transactions enable row level security;

-- Categorias: somente leitura para usuários logados
drop policy if exists "Categorias: leitura para usuários logados" on public.categories;
create policy "Categorias: leitura para usuários logados"
  on public.categories for select to authenticated
  using (true);

-- Transações: cada usuário acessa apenas as próprias
drop policy if exists "Transações: ler as próprias" on public.transactions;
create policy "Transações: ler as próprias"
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Transações: criar as próprias" on public.transactions;
create policy "Transações: criar as próprias"
  on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Transações: editar as próprias" on public.transactions;
create policy "Transações: editar as próprias"
  on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Transações: excluir as próprias" on public.transactions;
create policy "Transações: excluir as próprias"
  on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3) PERMISSÕES DE ACESSO PELA API -------------------------------------

grant select on public.categories to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;

-- 4) CATEGORIAS INICIAIS -----------------------------------------------

insert into public.categories (name, type, icon, color) values
  -- Despesas
  ('Alimentação',   'expense', 'restaurant',          '#F97316'),
  ('Transporte',    'expense', 'bus',                 '#3B82F6'),
  ('Moradia',       'expense', 'home',                '#8B5CF6'),
  ('Saúde',         'expense', 'medkit',              '#EF4444'),
  ('Lazer',         'expense', 'game-controller',     '#EC4899'),
  ('Educação',      'expense', 'school',              '#0EA5E9'),
  ('Compras',       'expense', 'cart',                '#F59E0B'),
  ('Contas',        'expense', 'receipt',             '#64748B'),
  ('Outros',        'expense', 'ellipsis-horizontal', '#94A3B8'),
  -- Receitas
  ('Salário',       'income',  'cash',                '#16A34A'),
  ('Freelance',     'income',  'briefcase',           '#0D9488'),
  ('Investimentos', 'income',  'trending-up',         '#65A30D'),
  ('Presentes',     'income',  'gift',                '#DB2777'),
  ('Outros',        'income',  'ellipsis-horizontal', '#94A3B8')
on conflict (name, type) do nothing;