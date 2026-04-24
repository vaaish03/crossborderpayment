import type { WalletState } from "@/types";

// Freighter API v2 has a different API shape — we use dynamic import with any typing
// to avoid version mismatch issues across environments.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFreighterApi(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  try {
    const api = await import("@stellar/freighter-api");
    return api;
  } catch {
    return null;
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  const api = await getFreighterApi();
  if (!api) return false;
  try {
    const result = await api.isConnected();
    // v1 returns boolean, v2 returns { isConnected: boolean }
    if (typeof result === "boolean") return result;
    return result?.isConnected ?? false;
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<WalletState> {
  const api = await getFreighterApi();
  if (!api) {
    return { address: null, isConnected: false, network: "TESTNET" };
  }

  try {
    const connected = await api.isConnected();
    const isConn = typeof connected === "boolean" ? connected : connected?.isConnected;
    if (!isConn) {
      return { address: null, isConnected: false, network: "TESTNET" };
    }

    // Try v2 API first, fall back to v1
    let address: string | null = null;
    try {
      const addrResult = await api.getAddress();
      address = typeof addrResult === "string" ? addrResult : addrResult?.address ?? null;
    } catch {
      address = null;
    }

    if (!address) {
      return { address: null, isConnected: false, network: "TESTNET" };
    }

    let network = "TESTNET";
    try {
      const netResult = await api.getNetwork();
      network = typeof netResult === "string" ? netResult : netResult?.network ?? "TESTNET";
    } catch {
      network = "TESTNET";
    }

    return { address, isConnected: true, network };
  } catch {
    return { address: null, isConnected: false, network: "TESTNET" };
  }
}

export async function getWalletAddress(): Promise<string | null> {
  const api = await getFreighterApi();
  if (!api) return null;
  try {
    const result = await api.getAddress();
    return typeof result === "string" ? result : result?.address ?? null;
  } catch {
    return null;
  }
}

export async function signTransaction(xdr: string, network: string = "TESTNET"): Promise<string | null> {
  const api = await getFreighterApi();
  if (!api) return null;
  try {
    const result = await api.signTransaction(xdr, { networkPassphrase: network });
    return typeof result === "string" ? result : result?.signedTxXdr ?? null;
  } catch {
    return null;
  }
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
