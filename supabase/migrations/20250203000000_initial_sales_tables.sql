-- 売上レコード（CSV取り込み1件1行）
create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  table_name text not null default '',
  staff text not null default '',
  payment_method text not null default '',
  date_time timestamptz not null,
  date_string text not null default '',
  type text not null default '',
  subtotal int not null default 0,
  discount int not null default 0,
  coupon_discount int not null default 0,
  tax int not null default 0,
  tax10 int not null default 0,
  tax8 int not null default 0,
  received_amount int not null default 0,
  "change" int not null default 0,
  payment_amount int not null default 0,
  customer_count int not null default 1,
  menu_items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- 目標（日次・週次・月次、type で1行ずつ）
create table if not exists public.sales_targets (
  id uuid primary key default gen_random_uuid(),
  type text not null unique check (type in ('daily', 'weekly', 'monthly')),
  amount int not null default 0,
  period text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 初期目標を投入
insert into public.sales_targets (type, amount)
values ('daily', 30000), ('weekly', 180000), ('monthly', 800000)
on conflict (type) do nothing;

-- RLS: 匿名でも読み書き可能（本番では認証＋RLSで制限推奨）
alter table public.sales_records enable row level security;
alter table public.sales_targets enable row level security;

create policy "Allow all for sales_records"
  on public.sales_records for all
  using (true)
  with check (true);

create policy "Allow all for sales_targets"
  on public.sales_targets for all
  using (true)
  with check (true);
