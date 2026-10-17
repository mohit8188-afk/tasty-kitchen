-- Tasty Kitchen temporary UPI matching; do not auto-confirm on customer claims.
create table if not exists public.tk_upi_reservations (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('sample','order')),
 client_checkout_id text not null unique,
 base_amount_paise integer not null check (base_amount_paise > 0),
 amount_paise integer not null unique check (amount_paise > 0),
 created_at timestamptz not null default now(),
 reference_id uuid,
 reference_code text,
 reviewed_at timestamptz,
 constraint tk_upi_reservations_paise_max check (amount_paise - base_amount_paise between 0 and 199)
);
create index if not exists tk_upi_reservations_ref_idx on public.tk_upi_reservations(kind,reference_id);
alter table public.tk_upi_reservations enable row level security;
revoke all on public.tk_upi_reservations from public,anon,authenticated;
grant select,insert,update on public.tk_upi_reservations to service_role;

create table if not exists public.tk_upi_payment_audit (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('sample','order')),
 reference_id uuid not null,
 reference_code text not null,
 amount_paise integer not null,
 decision text not null check (decision in ('verified_paid','rejected')),
 bank_evidence text not null check (char_length(bank_evidence) between 8 and 500),
 admin_user_id uuid not null,
 created_at timestamptz not null default now()
);
alter table public.tk_upi_payment_audit enable row level security;
revoke all on public.tk_upi_payment_audit from public,anon,authenticated;
grant select,insert on public.tk_upi_payment_audit to service_role;

alter table public.tk_orders add column if not exists manual_upi_amount numeric(12,2);
alter table public.tk_sample_requests add column if not exists manual_upi_amount numeric(12,2);

create or replace function public.tk_allocate_upi_amount(p_kind text,p_checkout_id text,p_base_paise integer)
returns table(reservation_id uuid,amount_paise integer)
language plpgsql security definer set search_path = pg_catalog,public
as $$
declare existing public.tk_upi_reservations%rowtype; amount integer; off integer; ident uuid;
begin
 if auth.role() <> 'service_role' then raise exception 'service_role_only'; end if;
 if p_kind not in ('sample','order') or p_checkout_id !~ '^[A-Za-z0-9-]{8,120}$' or p_base_paise < 5000 or p_base_paise > 50000000 then raise exception 'invalid_allocation_request'; end if;
 perform pg_advisory_xact_lock(20261017, 50001);
 select * into existing from public.tk_upi_reservations r where r.client_checkout_id=p_checkout_id;
 if found then
   if existing.kind<>p_kind or existing.base_amount_paise<>p_base_paise then raise exception 'checkout_conflict'; end if;
   return query select existing.id,existing.amount_paise;
   return;
 end if;
 for off in 0..199 loop
   amount := p_base_paise+off;
   if not exists(select 1 from public.tk_upi_reservations r where r.amount_paise=amount) then
     insert into public.tk_upi_reservations(kind,client_checkout_id,base_amount_paise,amount_paise)
     values (p_kind,p_checkout_id,p_base_paise,amount) returning id into ident;
     return query select ident,amount;return;
   end if;
 end loop;
 raise exception 'unique_amount_exhausted';
end;
$$;
revoke all on function public.tk_allocate_upi_amount(text,text,integer) from public,anon,authenticated;
grant execute on function public.tk_allocate_upi_amount(text,text,integer) to service_role;

create or replace function public.tk_review_upi_payment(p_kind text,p_reference_id uuid,p_amount_paise integer,p_decision text,p_bank_evidence text,p_admin_id uuid)
returns text
language plpgsql security definer set search_path = pg_catalog,public
as $$
declare r public.tk_upi_reservations%rowtype; o public.tk_orders%rowtype; s public.tk_sample_requests%rowtype; contact uuid; code text; expected integer; now_time timestamptz := now();
begin
 if auth.role() <> 'service_role' then raise exception 'service_role_only'; end if;
 if p_kind not in ('sample','order') or p_decision not in ('verified_paid','rejected') or length(trim(coalesce(p_bank_evidence,''))) not between 8 and 500 or p_admin_id is null then raise exception 'invalid_review'; end if;
 select * into r from public.tk_upi_reservations where kind=p_kind and reference_id=p_reference_id for update;
 if not found then raise exception 'reservation_missing'; end if;
 if p_amount_paise <> r.amount_paise then raise exception 'bank_amount_mismatch'; end if;
 if p_kind='order' then
   select * into o from public.tk_orders where id=p_reference_id and payment_provider='manual_upi' and payment_environment='live' for update;
   if not found or o.payment_status<>'pending' then raise exception 'order_not_pending'; end if;
   code:=o.order_ref;contact:=o.contact_id;
   update public.tk_orders set payment_status=case when p_decision='verified_paid' then 'paid' else 'failed' end,
       order_status=case when p_decision='verified_paid' then 'confirmed' else 'cancelled' end,
       paid_at=case when p_decision='verified_paid' then now_time else null end,
       payment_reviewed_at=now_time,payment_review_note=left(p_bank_evidence,500),updated_at=now_time
     where id=p_reference_id;
 else
   select * into s from public.tk_sample_requests where id=p_reference_id and payment_provider='manual_upi' and payment_environment='live' for update;
   if not found or s.payment_status<>'pending' then raise exception 'sample_not_pending'; end if;
   code:=s.sample_ref;contact:=s.contact_id;
   update public.tk_sample_requests set payment_status=case when p_decision='verified_paid' then 'paid' else 'failed' end,
       status=case when p_decision='verified_paid' then 'requested' else 'cancelled' end,
       paid_at=case when p_decision='verified_paid' then now_time else null end,
       payment_reviewed_at=now_time,payment_review_note=left(p_bank_evidence,500),updated_at=now_time
     where id=p_reference_id;
 end if;
 update public.tk_upi_reservations set reviewed_at=now_time where id=r.id;
 insert into public.tk_upi_payment_audit(kind,reference_id,reference_code,amount_paise,decision,bank_evidence,admin_user_id)
 values(p_kind,p_reference_id,code,p_amount_paise,p_decision,p_bank_evidence,p_admin_id);
 if p_decision='verified_paid' then
   update public.tk_contacts set lifecycle_stage=case when p_kind='order' then 'customer' else lifecycle_stage end,last_contact_at=now_time,last_seen_at=now_time where id=contact;
 end if;
 insert into public.tk_interactions(contact_id,channel,direction,event_type,summary,metadata)
 values(contact,'website','system','upi_bank_review',case when p_decision='verified_paid' then 'Manual UPI bank credit verified by founder.' else 'Manual UPI payment claim rejected by founder.' end,
  jsonb_build_object('reference',code,'amount_paise',p_amount_paise,'decision',p_decision,'admin_user_id',p_admin_id));
 return code;
end;
$$;
revoke all on function public.tk_review_upi_payment(text,uuid,integer,text,text,uuid) from public,anon,authenticated;
grant execute on function public.tk_review_upi_payment(text,uuid,integer,text,text,uuid) to service_role;
