# CRM V1 access & acceptance gate (15 October 2026)

The CRM frontend source is at `crm/index.html`. It intentionally fails closed until `crm/config.js` is supplied and the authenticated administrator allowlist is configured.

## Admin identity required
1. Use an authenticated Supabase Auth user belonging to Tasty Kitchen. Verify the user UUID through Supabase Auth, not through a customer table.
2. Set the Supabase Edge Function secret `TK_CRM_ADMIN_USER_IDS` to a comma-separated list of approved user UUIDs. **No UUID is approved by default.**
3. Supply only public Supabase project URL and publishable/anon key in `crm/config.js`. Never use a service-role key in frontend files.
4. Configure email authentication, authorized redirect URL and CRM domain. Restrict admin UI deployment and access with an additional protection layer where available.
5. Test unauthenticated GET/POST => 401; valid non-admin JWT => 403; allowed admin JWT => success; forbidden Origin => 403. Test sensitive PII is not logged.
6. Execute UI acceptance with authorized administrator, verify website flows unaffected, then open internal CRM route.
7. Do not conflate test-mode paid flags with production sales. Preserve all historical records.

Expected public-only configuration after admin approval:
```js
window.TK_CRM_CONFIG = {
  url: "https://prlcmyokoeecemnribqd.supabase.co",
  anonKey: "<PUBLIC_SUPABASE_PUBLISHABLE_KEY>",
  functionsUrl: "https://prlcmyokoeecemnribqd.supabase.co/functions/v1/tk-crm-admin"
};
```

## API contract
Bearer Supabase access token required, plus user UUID in `TK_CRM_ADMIN_USER_IDS`. Responses use no-store; Origin restricted to https://tastykitchen.food.

GET: `?action=dashboard`, `?action=contacts&q=`, `?action=contact&contact_id=UUID`, `?action=tasting|orders|gifting|tasks`.

POST: `?action=note` with `{contact_id,body}`; `?action=task` with `{contact_id,title,due_at?}`.

Future WhatsApp must use a **separate** scoped service; never reuse administrator API or allow AI to call it with unrestricted service credentials. Implement consent-aware send policy, idempotent provider message ingestion, handoff and rate limits before activation.
