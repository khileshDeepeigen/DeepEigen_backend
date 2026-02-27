# BillingAndInvoices Component

## Purpose
This document describes the `BillingAndInvoices` React component used in the user dashboard. It lists the files involved, API endpoints used, current integration status, and quick instructions to test and extend the feature.

## Files
- `BillingAndInvoices.tsx` — Main component (UI, state, API calls, modals, invoices and reminders rendering).
- `data/typesprofile.ts` — Types and API helper functions (interfaces and fetch functions used by the component).
- `Profile.tsx` — Parent page which may provide `billingData` as a prop.

## APIs (currently used)
- `GET /accounts/payment_due/` — fetch payment due / reminders (called on mount)
- `GET /accounts/invoice/` — fetch invoice list (called on mount)

Endpoints are called directly in `BillingAndInvoices.tsx` using `fetch` with `credentials: "include"`. Some related helper types and a `fetchPaymentDue()` helper exist in `data/typesprofile.ts`.

## Integration Status
- Payment reminders: Integrated (data fetched and rendered). ✅
- Invoice list: Integrated (data fetched and rendered). ✅
- Current plan & next billing date: Hardcoded UI values (not fetched). ⚠️
- Plan upgrade / cancellation: UI only (no backend integration). ⚠️

## How it works (high-level)
1. Component mounts and `useEffect` runs.
2. Two API requests are made:
   - `/accounts/payment_due/` → sets `paymentDueData`
   - `/accounts/invoice/` → sets `invoiceData`
3. Component converts API data into UI-friendly structures (reminders, invoice items).
4. UI displays reminders in a carousel and invoices in a list/table.

## Where to change API URLs or behavior
- Update endpoint URLs and helper functions in: `frontend/src/components/userDashboard/data/typesprofile.ts`.
- `BillingAndInvoices.tsx` contains UI logic and local data mapping. Modify mapping functions to change how API data is displayed.

## How to test locally
1. Start backend (Django) so endpoints are available on `http://localhost:8000`.
2. Start frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

3. Open the profile/dashboard route in the browser where `BillingAndInvoices` is rendered (usually `/accounts/profile` or the dashboard route in the app).
4. Check the browser console / network tab for API calls to `/accounts/payment_due/` and `/accounts/invoice/`.

## Next steps (recommended roadmap)
- Add API to fetch subscription details (current plan, next billing date).
- Implement plan upgrade/cancel endpoints and wire them to the modals in `BillingAndInvoices.tsx`.
- Add payment method management and secure download flow for invoice PDFs.

## Notes
- API calls use `credentials: "include"` for session authentication; backend must accept session or cookie auth.
- Some invoice download URL templates are constructed in the component; ensure backend path and authorization match.

If you want, I can create the missing API helpers and wire them into the modal flows next.*/
