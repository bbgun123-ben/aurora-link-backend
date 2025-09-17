# Aurora Link Backend (Teller)

A tiny backend that creates Teller Link sessions and redirects the user into Teller's Link flow. After the user completes the flow, Teller redirects back to your app via a custom URL scheme.

- Health check: `GET /`
- Test loopback: `GET /test-link` (immediately redirects to `auroranest://callback?access_token=TEST123`)
- Start Teller Link: `GET /link` (creates a Link session with Teller and redirects to Teller's Link URL)

## Requirements

- Node.js 18+
- A Teller account and API key (secret)
- Your app must register the custom URL scheme `auroranest` in Xcode (Target → Info → URL Types).

## Environment variables

- `TELLER_API_KEY` — your Teller secret API key

## Run locally

```bash
npm install
export TELLER_API_KEY=sk_test_your_teller_key_here
npm start
