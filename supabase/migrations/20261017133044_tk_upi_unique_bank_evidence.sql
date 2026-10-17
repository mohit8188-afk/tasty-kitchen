-- A receiving-bank transaction reference must not be used for two paid orders.
create unique index if not exists tk_upi_verified_bank_reference_unique
on public.tk_upi_payment_audit (lower(btrim(bank_evidence)))
where decision='verified_paid';
