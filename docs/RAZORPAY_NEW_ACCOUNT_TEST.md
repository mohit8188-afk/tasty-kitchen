# Tasty Kitchen — Replacement Razorpay account test integration

## Status
- Website stack: static HTML, CSS and JavaScript on Vercel.
- Backend: Supabase Edge Functions `tk-payment-create`, `tk-payment-verify` and `tk-razorpay-webhook` already exist; no Node server or SDK installation required (Deno uses fetch).
- Product checkout client updated in branch `razorpay-new-account-test-checkout-20261018` to use the existing Razorpay Standard Checkout endpoints.
- **Not live / not production ready:** replacement merchant's provided key is in **test mode**. The secret must be set securely on the Tasty Kitchen CRM Supabase project; do not commit a real .env.
- Sample checkout still uses temporary manual UPI and requires a separate migration before retiring that mode.
- No new database tables.

## Required secure setup
In Supabase project `prlcmyokoeecemnribqd`, Edge Function secrets must be replaced with the **new merchant** `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Never put the secret in Vercel public environment variables, website JavaScript or GitHub. The credential supplied in the chat should be rotated as it was exposed in conversation.

## Test checkout
1. Configure the rotated **test** credential pair in Supabase Secrets.
2. Open the branch preview or deploy to a protected staging deployment, not the live storefront.
3. Add product to cart, complete shipping details, click Continue to secure payment and then Open Razorpay test checkout.
4. Use Razorpay's documented test payment method; confirm no real money moves.
5. Verify that matching signed/captured payment marks the test order paid and is visible in CRM; also test modal dismiss, failed payment and signature mismatch.
6. Confirm webhook secret separately before testing asynchronous payment reconciliation.

## Before production
Do not point the public website to test checkout, which cannot collect real payment. Replace the merchant credentials with approved live keys, ensure live mode is active, switch the frontend environment guard and text intentionally, validate webhook signature, verify one small **live** payment end-to-end, and ensure the sample checkout is migrated or clearly marked as a separate option.

No credential value is stored in this repository.
