# Tasty Kitchen — WhatsApp Automation V1 (implementation contract)
Status: prepared, NOT connected or sending. Existing CRM is source of truth.

## Customer journey
1. Payment becomes captured/verified -> send approved utility template `tk_order_confirmed` with first name, order reference, delivery date and assistance instruction. Trigger once per order, never from a browser click or an unpaid order.
2. CRM order transition `confirmed -> preparing` -> send approved utility template `tk_order_preparing`, once per order per transition. Do not send from batch selection before server transition succeeds.
3. CRM order transition to `delivered` -> send approved utility template `tk_order_delivered`, once per order. No review request/marketing content.
4. Incoming customer message -> verified Meta signed webhook -> normalized phone contact lookup -> CRM authorized customer-order context -> constrained response, or human handoff.

## Draft utility templates (approval required)
`tk_order_confirmed`: "Hi {{1}}, thank you for ordering from Tasty Kitchen! We have confirmed your payment for order {{2}}. Your selected delivery date is {{3}}. Reply to this WhatsApp chat if you need assistance."
`tk_order_preparing`: "Hi {{1}}, your Tasty Kitchen order {{2}} is now being prepared. We'll keep you updated. Reply here for assistance."
`tk_order_delivered`: "Hi {{1}}, our records show that Tasty Kitchen order {{2}} has been delivered. If anything needs attention, reply here and our team will help."
No guarantee of delivery time, cancellation promises, or fabricated dispatch tracking.

## Guardrails / engineering tasks
- Obtain Meta WABA, approved sender phone number ID, permanent system-user token, app secret, webhook verify token, approved template names and languages. Keep credentials in Supabase secrets only.
- Verify GET webhook challenge and POST `X-Hub-Signature-256` HMAC over raw body. Validate WABA/phone recipient and message id deduplication. Never trust unverified WhatsApp numbers as CRM administrators.
- Outbox with unique (order_id, event_type, status_revision) and atomic claim/retry (backoff) to avoid double sends. Persist provider message id, attempts, status/failure, timestamps.
- Enqueue on verified successful payment or transactional order-transition event; avoid direct sends during database mutations. Respect opted-out, invalid phone and customer service / Meta template restrictions.
- Only send business-initiated messages using approved utility templates as required; free-form replies only within allowable customer-service windows and policies. Message charges may apply.
- AI must first fetch verified live orders scoped to normalized customer phone. Do not reveal another customer's details. If ambiguous identity, ask for matching order reference and verify additional context; no sensitive payment data.
- Expose only order summary, current approved status, product names and selected delivery date; never guess ETA or stock. Handoff for refund, complaint, payment uncertainty or request outside policy. Disable AI when `human_handoff` true.
- Customer-facing claims based on CRM facts only. Review replies for Hindi/Gujarati/English and test opt-out, duplicate webhook, customer unknown, failed payment, order updates and human takeover.
- Staff dashboard: queued/sent/failed messaging, manual retry guarded against duplicates, human inbox, AI on/off and handoff status.
- Avoid retroactively sending messages for prior orders by default; initialize an explicit activation timestamp.
- Shipping automation must remain disabled until templates approved and a signed inbound/outbound test succeeds.
