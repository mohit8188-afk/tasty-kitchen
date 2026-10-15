-- CRM V1 audited fulfilment; service-only RPC
create table if not exists public.tk_crm_order_audit (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.tk_orders(id) on delete restrict,
 actor_uid uuid not null,
 from_status text not null,
 to_status text not null,
 reason text,
 created_at timestamptz not null default now()
);
create index if not exists tk_crm_order_audit_order_idx on public.tk_crm_order_audit(order_id,created_at desc);
alter table public.tk_crm_order_audit enable row level security;
revoke all on public.tk_crm_order_audit from anon,authenticated;
create or replace function public.tk_crm_transition_order(
 p_order_id uuid, p_actor_uid uuid, p_to_status text, p_reason text default null
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare v_order public.tk_orders%rowtype;
begin
 if p_order_id is null or p_actor_uid is null then raise exception 'invalid_parameters'; end if;
 select * into v_order from public.tk_orders where id=p_order_id for update;
 if not found then raise exception 'order_not_found'; end if;
 if v_order.payment_environment is distinct from 'live' or v_order.payment_status <> 'paid' then
  raise exception 'not_a_live_paid_order';
 end if;
 if not (
   (v_order.order_status='confirmed' and p_to_status in ('preparing','cancelled')) or
   (v_order.order_status='preparing' and p_to_status in ('packed','cancelled')) or
   (v_order.order_status='packed' and p_to_status in ('out_for_delivery','cancelled')) or
   (v_order.order_status='out_for_delivery' and p_to_status='delivered')
 ) then raise exception 'invalid_transition'; end if;
 update public.tk_orders set order_status=p_to_status,updated_at=now() where id=p_order_id;
 insert into public.tk_crm_order_audit(order_id,actor_uid,from_status,to_status,reason)
 values (p_order_id,p_actor_uid,v_order.order_status,p_to_status,left(p_reason,500));
 return jsonb_build_object('id',p_order_id,'previous',v_order.order_status,'status',p_to_status);
end $$;
revoke all on function public.tk_crm_transition_order(uuid,uuid,text,text) from PUBLIC,anon,authenticated;
grant execute on function public.tk_crm_transition_order(uuid,uuid,text,text) to service_role;