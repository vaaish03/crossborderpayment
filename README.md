# StellarSend

**Cross-border money transfers powered by the Stellar blockchain.**

Send USDC, XLM, and other assets across borders in seconds — not days. StellarSend uses Stellar's path payment protocol to automatically route funds through the best liquidity path, converting currencies on the fly with minimal fees.

---

## 🎯 Demo Note for Judges

**This is a testnet demo.** To keep the demo simple and avoid requiring judges to set up trustlines for multiple assets (USDC, EURC, BRLT, etc.), the current implementation:

- **Settles all transactions in native XLM** on Stellar testnet (no trustlines required)
- **Shows the corridor conversion** (e.g., USDC→EURC) in the UI and records it in the transaction memo
- **Demonstrates the full flow:** Freighter wallet popup → real Stellar transaction → real tx hash on Stellar Expert

**For production with real USDC/stablecoin transfers**, the app would:
1. Use Stellar's `pathPaymentStrictSend` operation to convert between assets on-chain
2. Require both sender and recipient to have trustlines for the respective assets (one-time setup in Freighter)
3. Leverage Stellar's built-in DEX liquidity pools for real-time exchange rates

The smart contract in `contracts/remittance/` shows the full production implementation with multi-asset support, rate management, and slippage protection.

---

## Live Demo

> App runs on **Stellar Testnet**. No real funds are used.

- **Live App:** [https://stellar-send.vercel.app](https://stellar-send.vercel.app)
- **Stellar Expert Explorer:** [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- **View transactions on-chain:** Every transfer links directly to its transaction on Stellar Expert — click any TX hash in the History page to verify it on-chain.

---

## Deployed Smart Contract

The Soroban remittance contract is deployed on **Stellar Testnet**.

| Field | Value |
|---|---|
| Network | Stellar Testnet |
| Contract ID | `CCTIZ2FC5IQOCMMQAGLOFXCJ6JVKL7MUVCEJY7QZPNPQMXIL275VEOPO` |
| Explorer | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCTIZ2FC5IQOCMMQAGLOFXCJ6JVKL7MUVCEJY7QZPNPQMXIL275VEOPO) |
| Language | Rust (Soroban SDK) |
| Status | Live |

> To interact with the contract directly, use the [Stellar Lab](https://lab.stellar.org) or Soroban CLI with `--network testnet`.

---

## How It Works

```
You send USDC
      │
      ▼
Stellar Path Payment
      │
      ├──► USDC → EURC   (Europe)
      ├──► USDC → BRLT   (Brazil)
      ├──► USDC → NGNT   (Nigeria)
      └──► XLM  → USDC   (Global)
```

Stellar's path payment protocol finds the best route through on-chain liquidity pools, converts the asset mid-flight, and delivers the destination currency to the recipient — all in a single atomic transaction that settles in ~5 seconds.

---

## Features

- **Instant settlement** — transactions confirm in 3–5 seconds on Stellar
- **5 live corridors** — USDC→EURC, USDC→BRLT, USDC→NGNT, XLM→USDC, XLM→EURC
- **Slippage protection** — configurable tolerance (0.1%–3%) enforced in the smart contract
- **On-chain proof** — every transaction links to [Stellar Expert](https://stellar.expert/explorer/testnet) for independent verification
- **Freighter wallet** — connect your Stellar wallet with one click
- **Real-time dashboard** — live charts showing volume, corridors, and transaction timeline
- **Transaction history** — full history with filters and CSV export
- **Monitoring** — success rates, active corridors, and volume analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Soroban SDK (Stellar) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Wallet | Freighter API v2 |
| Blockchain SDK | @stellar/stellar-sdk |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Testing | Jest, Playwright |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Rust (with `wasm32-unknown-unknown` target)
- [Freighter wallet](https://freighter.app) browser extension

### Run the frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Connect your wallet

1. Install [Freighter](https://freighter.app) and create or import a wallet
2. Switch Freighter to **Testnet** (click the network name → select Testnet)
3. Get free testnet XLM from [friendbot.stellar.org](https://friendbot.stellar.org)
4. Click **Connect Wallet** in the app

### Build the smart contract

```bash
# Install Soroban CLI
cargo install --locked soroban-cli

# Run tests
cargo test --manifest-path contracts/remittance/Cargo.toml

# Build WASM
cargo build --manifest-path contracts/remittance/Cargo.toml \
  --target wasm32-unknown-unknown --release

# Deploy to testnet
soroban contract deploy \
  --wasm contracts/remittance/target/wasm32-unknown-unknown/release/remittance.wasm \
  --network testnet \
  --source <YOUR_SECRET_KEY>
```

---

## Smart Contract

The Soroban contract handles all remittance logic on-chain:

```rust
// Send a cross-border payment
send_remittance(sender, recipient, amount, source_asset, dest_asset, slippage_tolerance)

// Query exchange rates
get_exchange_rate(source_asset, dest_asset)

// Get transaction history for an address
get_transaction_history(address)

// Admin: update exchange rates
update_rate(admin, source_asset, dest_asset, new_rate)
```

All transfers emit on-chain events and are permanently recorded. View any transaction at:

```
https://stellar.expert/explorer/testnet/tx/<TX_HASH>
```

---

## Supported Corridors

| Corridor | Rate | Fee |
|---|---|---|
| USDC → EURC | 0.9200 | 0.30% |
| USDC → BRLT | 4.9500 | 0.50% |
| USDC → NGNT | 1580.00 | 0.80% |
| XLM → USDC | 0.1100 | 0.20% |
| XLM → EURC | 0.1010 | 0.25% |

---

## Project Structure

```
stellar-send/
├── contracts/remittance/     # Soroban smart contract (Rust)
│   └── src/
│       ├── lib.rs            # Contract logic
│       └── test.rs           # Unit tests
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── send/             # Send Money
│   │   ├── history/          # Transaction History
│   │   └── monitoring/       # Analytics
│   ├── components/
│   │   ├── layout/           # Sidebar, Navbar
│   │   ├── dashboard/        # Charts
│   │   ├── send/             # Remittance form + modal
│   │   └── ui/               # Design system components
│   ├── lib/
│   │   ├── stellar.ts        # Stellar SDK helpers
│   │   └── freighter.ts      # Wallet integration
│   └── store/                # Zustand state
├── tests/
│   ├── unit/                 # Jest tests
│   └── e2e/                  # Playwright tests
└── .github/workflows/ci.yml  # CI/CD pipeline
```

---

## CI/CD

The pipeline is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and runs automatically on every push to `main` or `develop`, and on all pull requests to `main`.

```
smart-contract-tests → frontend-tests → e2e-tests → deploy
                                      ↗
                    security-audit
```

| Job | Trigger | What it does |
|---|---|---|
| `smart-contract-tests` | every push/PR | Compiles Soroban contract, runs Rust unit tests, builds WASM |
| `frontend-tests` | every push/PR | TypeScript check, ESLint, Jest with coverage, Next.js build |
| `e2e-tests` | after `frontend-tests` | Playwright tests against the built app (Chromium) |
| `security-audit` | every push/PR | `npm audit` + `cargo audit` for known vulnerabilities |
| `deploy` | `main` push only | Deploys to Vercel production (requires secrets) |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel API token from [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel team/org ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

---

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage report
npm run test:coverage

# E2E tests
npm run build
npm run test:e2e
```

---

## Security

- Slippage tolerance enforced at the contract level — transactions revert if price moves beyond your limit
- All inputs validated with Zod schemas before hitting the blockchain
- Stellar address format validated before any transaction is submitted
- Admin-only rate updates protected by `require_auth()` in the smart contract
- No private keys ever stored or transmitted by the frontend

---
screenshots

laptop
<img width="1268" height="868" alt="Screenshot 2026-04-24 at 10 19 03 PM" src="https://github.com/user-attachments/assets/825825dd-6c07-488d-b6e8-2510ce6b90d2" />
<img width="1278" height="853" alt="Screenshot 2026-04-24 at 10 19 11 PM" src="https://github.com/user-attachments/assets/ab952bb7-a674-442f-8c16-e66d614866ee" />
<img width="1262" height="861" alt="Screenshot 2026-04-24 at 10 19 20 PM" src="https://github.com/user-attachments/assets/ad99a691-9d27-4c23-aec7-ba8bafdeac8f" />
<img width="1202" height="806" alt="Screenshot 2026-04-24 at 10 19 28 PM" src="https://github.com/user-attachments/assets/d7767a44-86b7-4192-84c1-fdf3f5fcd0bc" />


mobile-
<img width="373" height="661" alt="Screenshot 2026-04-24 at 10 19 51 PM" src="https://github.com/user-attachments/assets/e0b5033f-9b10-4650-940f-11b99ed9094b" />
<img width="374" height="668" alt="Screenshot 2026-04-24 at 10 19 57 PM" src="https://github.com/user-attachments/assets/25cf8723-8618-499e-b551-7fa9c1cbcd39" />


demo video- https://drive.google.com/file/d/1ja4YOimF0UpLo4hNQ9Z4U-ey3RhIlJNX/view?usp=sharing
## User Testing & Feedback

Real users tested the app on Stellar Testnet and submitted feedback via a structured Google Form. All issues were triaged and fixed.

- **Feedback Form:** [forms.gle/wNJKaWBzQrjaUyUg6](https://forms.gle/wNJKaWBzQrjaUyUg6)
- **Responses Sheet:** [Google Sheets](https://docs.google.com/spreadsheets/d/1zQ639QhkONbb5ly03yL3tA1Q_chANjCfI7e-VTgijsg/edit?usp=sharing)

### Feedback & Fixes

| # | User Feedback | Fix Applied | Commit |
|---|---|---|---|
| 1 | "Why do I see my name as Vaishnavi?" | Removed hardcoded name from the Profile dropdown — now shows the connected wallet address | `a3424ba` |
| 2 | "What is even slippage tolerance?" | Added an info tooltip (ⓘ) with plain-language explanation: *"Max price movement you'll accept before the transaction reverts"* | `a3424ba` |
| 3 | "There is so much fake history" | Cleared all 25 hardcoded mock transactions — history now starts empty and only shows real on-chain transactions | `a3424ba` |
| 4 | "The monitoring tab is also hard coded" | Monitoring now derives all stats from real transactions: volume chart uses last 7 days of actual txs, "Active Users" replaced with "Unique Senders", pie chart reflects real status distribution | `a3424ba` |
| 5 | "The volume element doesn't make much sense" | Renamed card to "Volume by Corridor", removed confusing legend labels, added empty state, clarified bubble meaning | `a3424ba` |
| 6 | "All the data in the homepage is fake" | Dashboard cards (Transactions, Success Rate, Corridors, Timeline) now all derive from real transaction data with empty states when no transactions exist | `a3424ba` |
| 7 | "When the transaction is complete it doesn't show on Stellar Expert and there's no confirmation" | Added a "View on Stellar Expert" link button in the completion modal, plus a toast notification when the transaction confirms on-chain | `a3424ba` |

## License

MIT
