# Tasty Kitchen — Live temporary payment mode (17 October 2026)

## Current launch mode: ₹50 samples and temporary manual UPI
The Razorpay merchant is not live-enabled. All customer-facing product and tasting checkouts now use **manual UPI**:
- Sample base price is **₹50**. The actual UPI amount is ₹50.00–₹51.99 as a server-allocated, globally unique, non-reused payment matching amount.
- Product orders: menu/cart base total plus ₹0.00–₹1.99 unique adjustment, shown before payment.
- Recipient: founder-designated UPI receiving number **9834621628**. Set `TK_MANUAL_UPI_VPA` in Supabase Edge Function secrets only after the merchant confirms an actual receiving UPI ID. If absent, website presents the number with explicit instructions to confirm the payee in the UPI app.
- Frontend uses `tk-manual-sample` and `tk-manual-upi` Edge Functions. They recalculate server pricing, reserve unique paisa amounts using `tk_allocate_upi_amount`, and save payment as `pending` until **bank credit independently verified**.
- Customer can tap "I've paid" without screenshots or UTR. This only sets `payment_submitted_at`; it never marks payment as paid.
- Founder CRM `/crm/` → **UPI payments** shows sample and product requests sorted by who reported payment; shows exact amount, customer details and bank review controls.
- Founder must check the receiving bank transaction, amount, date, sender and use a **real bank transaction reference** when selecting Verify bank credit. This invokes audited `tk_review_upi_payment` and moves a sample to requested or order to confirmed. Fake customer acknowledgement cannot bypass the review.
- One bank transaction reference cannot be used twice to confirm payments. New tables have RLS enabled; privileged RPCs are service-role only. DB smoke tests are rolled back.
- If unique paisa amounts are exhausted, API rejects further payment creation; it never silently reuses an amount.
- Mobile checkout can restore the pending-payment screen after returning from a UPI app.
- Razorpay checkout and webhook functions remain deployed and unchanged. Switching back requires explicit website mode change after merchant activation and testing, not merely flipping secrets.
- Caveat: exact paisa value is useful for matching, but **not cryptographic proof of receipt**. Do not release product or confirm a tasting slot without real bank reconciliation.
- Before promotion: staff should perform one controlled real UPI credit test to confirm phone number, displayed payee, bank entry, CRM review and full mobile flow. This acceptance cannot be inferred from code deployment.

---

# Tasty Kitchen — Website V3 (Family Preview)

This version corrects the payment flow and adds complete demo content for Coconut Mewa Ladoo.

## Payment flow
- 100% advance payment remains mandatory.
- Customers do **not** type a UPI transaction reference and do **not** upload payment screenshots.
- Checkout presents one **Proceed to secure payment** action.
- The demo modal shows **UPI and card** options.
- In production, successful payment must be verified automatically by the connected payment gateway before the order is confirmed.
- Current payment flow is deliberately a **demo only** and does not collect real money.

## Demo product data
### Makhana Mewa Bites
- 200g — ₹449 (existing target price)
- 400g — ₹849 (preview/dummy)
- 800g — ₹1,599 (preview/dummy)

### Coconut Mewa Ladoo — all preview/dummy
- 250g — ₹399
- 500g — ₹749
- 1kg — ₹1,399
- Preview recipe copy: coconut, cashew, almond, raisins and ghee.

Replace the Coconut Mewa Ladoo recipe, prices, pack weights, image and approved allergen language after family review.

## Before launch
Replace/finalize:
- real payment gateway integration + backend order creation + verified payment callback/webhook
- WhatsApp number
- real Coconut Mewa Ladoo photo and approved product details
- 400g / 800g Makhana prices if different
- delivery fee / delivery-area rules
- production-slot / 5kg-per-day capacity protection
- FSSAI number
- refund/cancellation policy
- storage/best-use guidance
- complete ingredient/allergen labels
- privacy policy and terms

## Intended next phase
Hand this V3 to Astra Work for cinematic 2.5D/3D motion polish without changing the business/order flow unless explicitly requested.
