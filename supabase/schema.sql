-- オシカレ Supabase スキーマ
-- Supabase SQL Editorで実行してください

-- 推しテーブル
create table public.oshi (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  artist_name text not null,
  itunes_id   text,
  mb_id       text,
  image_url   text,
  color       text default '#f472b6',
  created_at  timestamptz default now()
);

-- イベントテーブル (ライブ・リリース共通)
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  oshi_id     uuid not null references public.oshi(id) on delete cascade,
  type        text not null check (type in ('live', 'release')),
  title       text not null,
  event_date  date not null,
  url         text,
  venue       text,
  created_at  timestamptz default now()
);

-- ユーザースケジュール (メモ・リマインダー)
create table public.user_schedules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_id    uuid not null references public.events(id) on delete cascade,
  memo        text,
  reminder_at timestamptz,
  created_at  timestamptz default now(),
  unique (user_id, event_id)
);

-- インデックス
create index on public.oshi(user_id);
create index on public.events(oshi_id);
create index on public.events(event_date);
create index on public.user_schedules(user_id);

-- RLS 有効化
alter table public.oshi enable row level security;
alter table public.events enable row level security;
alter table public.user_schedules enable row level security;

-- RLS ポリシー: oshi
create policy "自分の推しのみ参照" on public.oshi
  for select using (auth.uid() = user_id);
create policy "自分の推しのみ作成" on public.oshi
  for insert with check (auth.uid() = user_id);
create policy "自分の推しのみ更新" on public.oshi
  for update using (auth.uid() = user_id);
create policy "自分の推しのみ削除" on public.oshi
  for delete using (auth.uid() = user_id);

-- RLS ポリシー: events (自分の推しに紐づくもの)
create policy "自分の推しのイベント参照" on public.events
  for select using (
    exists (
      select 1 from public.oshi
      where oshi.id = events.oshi_id
        and oshi.user_id = auth.uid()
    )
  );
create policy "自分の推しのイベント作成" on public.events
  for insert with check (
    exists (
      select 1 from public.oshi
      where oshi.id = events.oshi_id
        and oshi.user_id = auth.uid()
    )
  );
create policy "自分の推しのイベント更新" on public.events
  for update using (
    exists (
      select 1 from public.oshi
      where oshi.id = events.oshi_id
        and oshi.user_id = auth.uid()
    )
  );
create policy "自分の推しのイベント削除" on public.events
  for delete using (
    exists (
      select 1 from public.oshi
      where oshi.id = events.oshi_id
        and oshi.user_id = auth.uid()
    )
  );

-- RLS ポリシー: user_schedules
create policy "自分のスケジュールのみ" on public.user_schedules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
