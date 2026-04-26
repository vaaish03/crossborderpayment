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

// ─── Real Stellar path payment ───────────────────────────────────────────────
import {
  Horizon,
  Asset,
  TransactionBuilder,
  Operation,
  BASE_FEE,
} from "@stellar/stellar-sdk";

function toAsset(code: string): Asset {
  const info = ASSETS[code as AssetCode];
  if (code === "XLM" || !info?.issuer) return Asset.native();
  return new Asset(info.code, info.issuer);
}

export async function buildAndSubmitPayment(
  senderAddress: string,
  recipientAddress: string,
  amount: string,
  sourceAsset: AssetCode,
  destAsset: AssetCode,
  signFn: (xdr: string) => Promise<string | null>
): Promise<{ txHash: string }> {
  const server = new Horizon.Server(HORIZON_URL);
  const account = await server.loadAccount(senderAddress);

  const sendAsset = toAsset(sourceAsset);
  const receiveAsset = toAsset(destAsset);

  const rate = getExchangeRate(sourceAsset, destAsset);
  const feeBps = getFeeBps(sourceAsset, destAsset);
  const received = calculateReceived(Number(amount), rate, feeBps);
  // Allow 2% slippage on dest min
  const destMin = (received * 0.98).toFixed(7);

  let operation;
  if (sourceAsset === destAsset) {
    // Same asset — simple payment
    operation = Operation.payment({
      destination: recipientAddress,
      asset: sendAsset,
      amount: Number(amount).toFixed(7),
    });
  } else {
    // Cross-asset — path payment
    operation = Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount: Number(amount).toFixed(7),
      destination: recipientAddress,
      destAsset: receiveAsset,
      destMin,
      path: [],
    });
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
  const signed = await signFn(xdr);
  if (!signed) throw new Error("Transaction signing was cancelled or failed.");

  const result = await server.submitTransaction(
    TransactionBuilder.fromXDR(signed, STELLAR_NETWORK)
  ).catch((err) => {
    // Extract Horizon result codes for a readable error
    const extras = err?.response?.data?.extras;
    const codes = extras?.result_codes;
    if (codes) {
      const detail = [codes.transaction, ...(codes.operations ?? [])].filter(Boolean).join(", ");
      throw new Error(`Stellar error: ${detail}`);
    }
    throw new Error(err?.message ?? "Transaction submission failed");
  });

  return { txHash: result.hash };
}
