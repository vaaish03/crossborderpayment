# StellarSend — Cross-Border Remittance App

A full-stack cross-border remittance application built on the **Stellar blockchain** using **Soroban smart contracts**. Send money across currencies (USDC → XLM → EURC/BRLT/NGNT) with automatic path payments, real-time exchange rates, and a sleek dark dashboard.

## 🏆 Level 5 (Purple Belt) — Stellar Journey to Mastery

### Requirements Checklist
- [x] Working Soroban smart contract (Rust) with path payment logic
- [x] Frontend connected to Freighter wallet
- [x] Path payment: USDC → XLM → stablecoin end-to-end
- [x] 25 mock users / transactions seeded for demo
- [x] CI/CD pipeline with GitHub Actions (4 jobs)
- [x] Security: input validation, slippage protection, error boundaries
- [x] Smart contract unit tests (9 tests, >80% coverage)
- [x] Frontend unit tests with Jest
- [x] E2E tests with Playwright (17 tests)
- [x] README with setup instructions and architecture
- [x] Transaction history with Stellar Expert links
- [x] 5 active corridors: USDC→EURC, USDC→BRLT, USDC→NGNT, XLM→USDC, XLM→EURC

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                  │
│  Dashboard │ Send Money │ History │ Monitoring            │
│  Recharts  │ React Hook Form │ Zustand │ Tailwind CSS     │
└──────────────────────┬──────────────────────────────────┘
                       │ @stellar/freighter-api
                       │ @stellar/stellar-sdk
┌──────────────────────▼──────────────────────────────────┐
│              Stellar Testnet (Horizon + Soroban RPC)      │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │         Soroban Smart Contract (Rust)            │     │
│  │  send_remittance()  get_transaction_history()    │     │
│  │  get_supported_corridors()  get_exchange_rate()  │     │
│  │  update_rate()  get_transaction()                │     │
│  └─────────────────────────────────────────────────┘     │
│                                                           │
│  Path Payment: USDC ──► XLM ──► EURC/BRLT/NGNT           │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- [Freighter wallet](https://freighter.app) browser extension (set to Testnet)

### Frontend Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Smart Contract Setup

```bash
# Install Soroban CLI
cargo install --locked soroban-cli

# Run tests
cd contracts/remittance
cargo test

# Build WASM
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/remittance.wasm \
  --network testnet \
  --source <YOUR_SECRET_KEY>
```

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires running app)
npm run build && npm run test:e2e
```

---

## 📁 Project Structure

```
stellar-send/
├── contracts/remittance/     # Soroban smart contract (Rust)
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs            # Contract logic
│       └── test.rs           # 9 unit tests
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── send/             # Send Money
│   │   ├── history/          # Transaction History
│   │   └── monitoring/       # Monitoring
│   ├── components/
│   │   ├── layout/           # Sidebar, Navbar
│   │   ├── dashboard/        # Charts (Line, DotMatrix, Bubble, Timeline)
│   │   ├── send/             # RemittanceForm, TransactionModal
│   │   └── ui/               # Button, Card, Badge, Skeleton
│   ├── lib/
│   │   ├── stellar.ts        # Stellar SDK helpers
│   │   ├── freighter.ts      # Wallet integration
│   │   └── mockData.ts       # 25 demo transactions
│   ├── store/                # Zustand state management
│   └── types/                # TypeScript types
├── tests/
│   ├── unit/                 # Jest unit tests
│   └── e2e/                  # Playwright E2E tests
└── .github/workflows/ci.yml  # CI/CD pipeline
```

---

## 🔄 CI/CD Pipeline

GitHub Actions runs 4 jobs on every push to `main`/`develop`:

| Job | What it does |
|-----|-------------|
| `smart-contract-tests` | Runs Rust unit tests + builds WASM |
| `frontend-tests` | TypeScript check + ESLint + Jest + Next.js build |
| `e2e-tests` | Playwright tests against built app |
| `security-audit` | npm audit + cargo audit |
| `deploy` | Vercel deploy (add `VERCEL_TOKEN` secret to enable) |

---

## 🌐 Supported Corridors

| From | To   | Rate    | Fee  |
|------|------|---------|------|
| USDC | EURC | 0.9200  | 0.3% |
| USDC | BRLT | 4.9500  | 0.5% |
| USDC | NGNT | 1580.00 | 0.8% |
| XLM  | USDC | 0.1100  | 0.2% |
| XLM  | EURC | 0.1010  | 0.25%|

---

## 🔐 Security Features

- Slippage tolerance protection (0.1% – 3%)
- Input validation with Zod schemas
- Stellar address format validation
- Smart contract access control (admin-only rate updates)
- Error boundaries on all async operations
- No private keys stored in frontend

---

## 🧪 Test Coverage

**Smart Contract (Rust):** 9 tests
- Initialize, double-init prevention
- USDC→EURC, USDC→BRLT remittance
- Unsupported corridor error
- Invalid amount error
- Exchange rate retrieval
- TX counter increment
- Transaction history
- Admin rate update
- Get transaction by ID

**Frontend (Jest):** Store + utility tests
- Wallet connect/disconnect
- Transaction add/update
- Exchange rate calculations
- Fee calculations
- Address validation

**E2E (Playwright):** 17 tests covering all pages

---

## 📄 License

MIT — Built for Stellar Journey to Mastery Level 5 (Purple Belt)
