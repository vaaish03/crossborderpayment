import type { WalletState } from "@/types";

// Freighter API v2 — correct API shape:
// isConnected()   → Promise<boolean>
// isAllowed()     → Promise<boolean>
// requestAccess() → Promise<string>  (returns publicKey, also grants access)
// getPublicKey()  → Promise<string>
// getNetwork()    → Promise<string>

async function getFreighterApi() {
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
    // isConnected() returns true if the extension is present (even if not allowed)
    const connected = await api.isConnected();
    return connected === true;
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
    // Step 1: Check extension is installed
    const installed = await api.isConnected();
    if (!installed) {
      return { address: null, isConnected: false, network: "TESTNET" };
    }

    // Step 2: Request access (prompts user if not already allowed)
    // requestAccess() returns the public key string on success
    const publicKey = await api.requestAccess();
    if (!publicKey || publicKey.startsWith("Error")) {
      return { address: null, isConnected: false, network: "TESTNET" };
    }

    // Step 3: Get network
    let network = "TESTNET";
    try {
      network = await api.getNetwork();
    } catch {
      network = "TESTNET";
    }

    return {
      address: publicKey,
      isConnected: true,
      network,
    };
  } catch (err) {
    console.error("Freighter connect error:", err);
    return { address: null, isConnected: false, network: "TESTNET" };
  }
}

export async function getWalletAddress(): Promise<string | null> {
  const api = await getFreighterApi();
  if (!api) return null;
  try {
    const allowed = await api.isAllowed();
    if (!allowed) return null;
    return await api.getPublicKey();
  } catch {
    return null;
  }
}

export async function signTransaction(
  xdr: string,
  network: string = "TESTNET"
): Promise<string | null> {
  const api = await getFreighterApi();
  if (!api) return null;
  try {
    return await api.signTransaction(xdr, { networkPassphrase: network });
  } catch {
    return null;
  }
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
