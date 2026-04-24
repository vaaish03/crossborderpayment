# StellarSend

**Cross-border money transfers powered by the Stellar blockchain.**

Send USDC, XLM, and other assets across borders in seconds — not days. StellarSend uses Stellar's path payment protocol to automatically route funds through the best liquidity path, converting currencies on the fly with minimal fees.

---

## Live Demo

> App runs on **Stellar Testnet**. No real funds are used.

- **Frontend:** [http://localhost:3001](http://localhost:3001) (run locally)
- **Stellar Expert Explorer:** [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- **View transactions on-chain:** Every transfer links directly to its transaction on Stellar Expert — click any TX hash in the History page to verify it on-chain.

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

Every push to `main` runs the full pipeline:

```
smart-contract-tests → frontend-tests → e2e-tests → deploy
```

| Job | What it does |
|---|---|
| `smart-contract-tests` | Compiles and tests the Soroban contract |
| `frontend-tests` | TypeScript check, ESLint, Jest, Next.js build |
| `e2e-tests` | Playwright tests against the built app |
| `deploy` | Vercel deploy (set `VERCEL_TOKEN` secret to enable) |

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
## License

MIT
