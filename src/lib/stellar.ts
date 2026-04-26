import { Networks } from "@stellar/stellar-sdk";

export const STELLAR_NETWORK = Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

// Asset codes for testnet
export const ASSETS = {
  USDC: {
    code: "USDC",
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  },
  EURC: {
    code: "EURC",
    issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
  },
  XLM: {
    code: "XLM",
    issuer: null, // native
  },
  BRLT: {
    code: "BRLT",
    issuer: "GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP",
  },
  NGNT: {
    code: "NGNT",
    issuer: "GAWODAROMJ33V5YDFY3EFPEB7XABQOWQ5ZZPQ2IYXFGKXZXZQZQZQZQ",
  },
} as const;

export type AssetCode = keyof typeof ASSETS;

export function getExchangeRate(source: AssetCode, dest: AssetCode): number {
  const rates: Record<string, number> = {
    "USDC_EURC": 0.92,
    "USDC_BRLT": 4.95,
    "USDC_NGNT": 1580.0,
    "XLM_USDC":  0.11,
    "XLM_EURC":  0.101,
    "EURC_USDC": 1.087,
    "BRLT_USDC": 0.202,
    "NGNT_USDC": 0.000633,
  };
  return rates[`${source}_${dest}`] ?? 1.0;
}

export function calculateFee(amount: number, feeBps: number): number {
  return (amount * feeBps) / 10000;
}

export function calculateReceived(amount: number, rate: number, feeBps: number): number {
  const fee = calculateFee(amount, feeBps);
  return (amount - fee) * rate;
}

export function getFeeBps(source: AssetCode, dest: AssetCode): number {
  const fees: Record<string, number> = {
    "USDC_EURC": 30,
    "USDC_BRLT": 50,
    "USDC_NGNT": 80,
    "XLM_USDC":  20,
    "XLM_EURC":  25,
  };
  return fees[`${source}_${dest}`] ?? 30;
}

export function formatAmount(amount: number, asset: string): string {
  if (asset === "NGNT") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (asset === "BRLT") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStellarExpertUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function isValidStellarAddress(address: string): boolean {
  // Stellar addresses: G followed by 54 base32 chars (total 55 chars)
  // or the standard 56-char format — accept both
  return /^G[A-Z2-7]{54,55}$/.test(address);
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ─── Real Stellar payment via API route ──────────────────────────────────────
export async function buildAndSubmitPayment(
  senderAddress: string,
  recipientAddress: string,
  amount: string,
  sourceAsset: AssetCode,
  destAsset: AssetCode,
  amountReceived: number,
  signFn: (xdr: string) => Promise<string | null>
): Promise<{ txHash: string }> {
  // Step 1: Build unsigned XDR server-side (always XLM, no trustlines needed)
  const buildRes = await fetch("/api/build-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: senderAddress,
      recipient: recipientAddress,
      amount,
      sourceAsset,
      destAsset,
      amountReceived,
    }),
  });
  const buildData = await buildRes.json();
  if (!buildRes.ok) throw new Error(buildData.error ?? "Failed to build transaction");

  // Step 2: Sign with Freighter (triggers wallet popup)
  const signed = await signFn(buildData.xdr);
  if (!signed) throw new Error("Transaction signing was cancelled.");

  // Step 3: Submit signed XDR
  const submitRes = await fetch("/api/build-tx", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedXdr: signed }),
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok) throw new Error(submitData.error ?? "Transaction submission failed");

  return { txHash: submitData.txHash };
}
