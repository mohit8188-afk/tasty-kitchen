-- CRM V1 additive foundation, 2026-10-15. Never alters payment or existing customer tables.
create table if not exists public.tk_crm_notes (
 id uuid primary key default gen_random_uuid(),
 contact_id uuid not null references public.tk_contacts(id) on delete restrict,
 body text not null check (char_length(btrim(body)) between 1 and 4000),
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create index if not exists tk_crm_notes_contact_time_idx on public.tk_crm_notes(contact_id,created_at desc);
alter table public.tk_crm_notes enable row level security;
revoke all on public.tk_crm_notes from anon, authenticated;
create table if not exists public.tk_crm_tasks (
 id uuid primary key default gen_random_uuid(),
 contact_id uuid not null references public.tk_contacts(id) on delete restrict,
 title text not null check (char_length(btrim(title)) between 1 and 180),
 category text not null default 'follow_up',
 status text not null default 'open' check(status in ('open','in_progress','completed','cancelled')),
 due_at timestamptz,
 assigned_to uuid references auth.users(id) on delete set null,
 assigned_agent text,
 related_kind text check(related_kind is null or related_kind in ('tasting','order','gifting','general')),
 related_id uuid,
 created_by uuid references auth.users(id) on delete set null,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists tk_crm_tasks_due_idx on public.tk_crm_tasks(status,due_at);
create index if not exists tk_crm_tasks_contact_idx on public.tk_crm_tasks(contact_id,created_at desc);
alter table public.tk_crm_tasks enable row level security;
revoke all on public.tk_crm_tasks from anon,authenticated;
-- No client policies: access restricted to server-side service_role until authenticated admin is approved.
