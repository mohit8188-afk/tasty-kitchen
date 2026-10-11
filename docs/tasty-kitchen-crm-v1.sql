-- Tasty Kitchen CRM v1 (draft, not applied)
-- Purpose: sample control, lead capture, marketing attribution and future WhatsApp automation.

create table if not exists public.tk_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null unique,
  normalized_mobile text not null unique,
  locality text,
  pincode text,
  address text,
  whatsapp_opt_in boolean not null default false,
  marketing_opt_in boolean not null default false,
  source text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tk_sample_requests (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.tk_contacts(id) on delete cascade,
  product_id text not null check (product_id in ('makhana-mewa-bites','coconut-mewa-ladoo','jalebi-with-rabdi')),
  preferred_date date not null,
  locality text not null,
  pincode text not null,
  address text not null,
  status text not null default 'requested'
    check (status in ('requested','confirmed','scheduled','delivered','follow_up','converted','lost','rejected','cancelled')),
  rejection_reason text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  request_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tk_sample_request_key_uq
  on public.tk_sample_requests(request_key)
  where status not in ('rejected','cancelled','lost');

create index if not exists tk_sample_requests_date_idx
  on public.tk_sample_requests(preferred_date, status);

create index if not exists tk_sample_requests_locality_idx
  on public.tk_sample_requests(locality, preferred_date);

create table if not exists public.tk_orders (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.tk_contacts(id) on delete restrict,
  product_id text not null,
  pack_grams integer not null check (pack_grams in (250,500)),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2),
  delivery_charge numeric(10,2),
  total_amount numeric(10,2),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded','partially_refunded')),
  order_status text not null default 'created'
    check (order_status in ('created','confirmed','preparing','packed','out_for_delivery','delivered','cancelled')),
  delivery_scope text not null check (delivery_scope in ('ahmedabad','india')),
  delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tk_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.tk_contacts(id) on delete cascade,
  channel text not null check (channel in ('website','whatsapp','phone','instagram','facebook','other')),
  direction text not null check (direction in ('inbound','outbound','system')),
  event_type text not null,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tk_daily_sample_capacity (
  sample_date date primary key,
  total_capacity integer not null check (total_capacity >= 0),
  locality_limits jsonb not null default '{}'::jsonb,
  is_open boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recommended request_key generated server-side from normalized_mobile + normalized address/locality.
-- V1 business rules:
-- 1) One active sample request per mobile number.
-- 2) Duplicate address/locality requests are flagged for review.
-- 3) Preferred date must have remaining daily capacity.
-- 4) Ahmedabad locality/PIN eligibility is checked before confirmation.
-- 5) Every request becomes a CRM lead even if rejected, preserving source and follow-up history.
-- 6) Sample conversion is measured by linking later paid orders to the same contact_id.
