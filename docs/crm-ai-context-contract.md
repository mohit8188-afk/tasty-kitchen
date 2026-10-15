# Tasty Kitchen — AI context and fulfilment contract (design, not deployed)
Date: 2026-10-15. This is a reviewed implementation specification, **not an active WhatsApp bot**.

## Boundaries
- CRM administrator: Supabase Auth JWT + UUID allowlist; never expose service-role keys.
- WhatsApp transport: provider-signed webhook, validated recipient/sender mapping and replay/idempotency checks. Do not equate any submitted phone number with authorization to view order/address details.
- AI worker: minimal backend capability to receive a **resolved and authenticated** conversation identity; no arbitrary SQL or generic table reader.
- Allowed read context: sanitized product/pricing FAQ, service areas, order ref and fulfilment status for the verified customer, tasting status, gifting status, recent non-sensitive conversation summary and explicit approved preferences. No payment tokens, raw Razorpay identifiers, full addresses, or unrelated customer records in AI prompt.
- Allowed writes after inbound message: append redacted interaction record and request staff follow-up/handoff. No order payment status change, refund, cancellation, outbound marketing or contact record merge.
- Retain human authorization for sensitive order changes. No automatic promise of delivery times absent confirmed route/date.

## Suggested internal method signature
`resolve_context({verified_wa_sender_id, provider_message_id, channel, requested_order_ref?})` returns `{customer_alias, order_status_summary[], tasting_summary[], gifting_summary[], approved_preferences[], recent_interactions[], can_send_transactional_reply, human_handoff}`.
`record_interaction({verified_wa_sender_id, provider_message_id, direction, redacted_summary, event_type})` is idempotent on channel+provider_message_id.
`request_handoff({verified_wa_sender_id, reason, order_ref?})` creates follow-up task with staff approval workflow.

## Fulfilment updates
Admin writes must be an atomic transaction: verify live paid order, validate legal state transition, change `tk_orders.order_status`, and append immutable audit event in the same transaction. Strict allowed transitions: confirmed→preparing→packed→out_for_delivery→delivered; carefully reviewed cancellation from nonfinal states; never mark unpaid as fulfilled; refunds handled only by verified payment systems. Show confirmed paid pending fulfilment as operational backlog, not test records.

## Acceptance
- Unauthenticated or wrong-admin token denied.
- Spoofed sender/message denied; duplicate webhook idempotent.
- Cannot cross-access another customer's order.
- Marketing opt-out respected; transactional communications separated.
- Test orders never included in live order dashboards.
- Full PII and payment secrets absent from AI prompts/logs.
- Handoff works when the AI cannot verify status.
