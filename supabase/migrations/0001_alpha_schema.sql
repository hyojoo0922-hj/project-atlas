-- Atlas Alpha — Supabase schema (DEPLOY & PERSISTENCE SPRINT #001)
-- 적용: Supabase Dashboard → SQL Editor 에 전체 실행.
-- 구조:
--   (A) alpha_state  : 운영 스냅샷(단일 행 JSONB) — 현재 앱이 사용하는 영속 저장소.
--   (B) 정규화 엔티티 테이블 : 목표 데이터 모델(설계). 후속 per-entity 마이그레이션에서 연결.
-- 보안: service_role 키(서버 전용)는 RLS를 우회. anon/public 접근은 막는다.

-- ─────────────────────────────────────────────
-- (A) 운영 스냅샷 — 앱이 AlphaData 전체를 JSONB로 upsert/select
-- ─────────────────────────────────────────────
create table if not exists public.alpha_state (
  id          text primary key default 'default',
  owner_name  text,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.alpha_state enable row level security;
-- 기본적으로 anon/authenticated 정책 없음 → public 접근 차단. 서버는 service_role 키로 접근(RLS 우회).
comment on table public.alpha_state is 'Atlas Alpha 운영 스냅샷(AlphaData JSONB). 서버는 service_role 키로만 접근.';

-- ─────────────────────────────────────────────
-- (B) 정규화 엔티티 테이블 — 목표 데이터 모델(설계)
--     자료/Vault/업무/결과물/직원/크레딧/Usage Ledger
-- ─────────────────────────────────────────────
create table if not exists public.companies (
  id          text primary key,
  customer_id text,
  name        text not null,
  industry    text,
  stage       text,
  goal        text,
  credits     integer not null default 0,   -- 크레딧 잔액(Placeholder, 실결제 없음)
  created_at  timestamptz not null default now()
);

create table if not exists public.departments (
  id          text primary key,
  company_id  text not null references public.companies(id) on delete cascade,
  name        text not null,
  focus       text,
  priority    integer
);

create table if not exists public.employees (
  id            text primary key,
  company_id    text not null references public.companies(id) on delete cascade,
  department_id text references public.departments(id) on delete set null,
  role_family   text not null,         -- content/support/research/operations/marketing/design
  persona       text,
  rank          text,
  dna           jsonb,                 -- EmployeeDNA(genome/phenotype/acquired/lineage)
  created_at    timestamptz not null default now()
);

-- 업무
create table if not exists public.tasks (
  id            text primary key,
  company_id    text not null references public.companies(id) on delete cascade,
  title         text not null,
  output_types  text[] not null default '{}',
  status        text not null,
  image_choice  text,                  -- designer/credit/brief
  hidden        boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- 업무 중 제공 자료
create table if not exists public.materials (
  id          text primary key,
  task_id     text not null references public.tasks(id) on delete cascade,
  info_key    text not null,
  kind        text not null,           -- text/url/file/image
  value       text not null,
  note        text,
  created_at  timestamptz not null default now()
);

-- Company Knowledge Vault (자료 인박스)
create table if not exists public.vault_items (
  id            text primary key,
  company_id    text not null references public.companies(id) on delete cascade,
  info_key      text not null,
  category      text not null,         -- brand/product/reference/liked_style/disliked/customer_faq/etc
  kind          text not null,
  value         text not null,
  note          text,
  source_task_id text references public.tasks(id) on delete set null,
  by_role       text,
  hidden        boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- 결과물 (Output Standard/Quality/Template 메타 포함)
create table if not exists public.task_results (
  id                 bigint generated always as identity primary key,
  task_id            text not null references public.tasks(id) on delete cascade,
  output_type        text not null,
  requested_output_type text,
  by_employee        text,
  state              text not null,    -- final/draft/pending
  request_type       text,             -- text/image_credit/image_brief/image_designer_brief
  credits_used       integer not null default 0,
  standard_label     text,
  quality_label      text,             -- Excellent/Good/Draft/Needs Revision
  quality_score      integer,
  quality_category   text,
  recommend_revision boolean not null default false,
  template_sections  text[],
  content            text not null,
  created_at         timestamptz not null default now()
);

-- Usage Ledger (AI 원가/사용량/크레딧)
create table if not exists public.usage_ledger (
  id            bigint generated always as identity primary key,
  task_id       text not null,
  output_type   text,
  model         text,
  mode          text,                  -- ai/mock
  input_tokens  integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd      numeric not null default 0,
  credits       integer not null default 0,
  request_type  text,
  created_at    timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_tasks_company on public.tasks(company_id);
create index if not exists idx_vault_company on public.vault_items(company_id);
create index if not exists idx_results_task on public.task_results(task_id);
create index if not exists idx_usage_task on public.usage_ledger(task_id);

-- RLS: 엔티티 테이블도 기본 차단(서버 service_role 전용). 멀티테넌트 정책은 후속.
alter table public.companies   enable row level security;
alter table public.departments enable row level security;
alter table public.employees   enable row level security;
alter table public.tasks       enable row level security;
alter table public.materials   enable row level security;
alter table public.vault_items enable row level security;
alter table public.task_results enable row level security;
alter table public.usage_ledger enable row level security;
