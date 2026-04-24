export interface Transaction {
  id: number;
  sender: string;
  recipient: string;
  amountSent: number;
  amountReceived: number;
  sourceAsset: string;
  destAsset: string;
  status: "completed" | "pending" | "failed";
  timestamp: number;
  txHash: string;
}

export interface Corridor {
  sourceAsset: string;
  destAsset: string;
  rate: number;
  feeBps: number;
  active: boolean;
}

export interface RemittanceFormData {
  recipient: string;
  amount: string;
  sourceAsset: string;
  destAsset: string;
  slippageTolerance: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: string;
}

export interface DashboardStats {
  totalVolume: number;
  totalTransactions: number;
  successRate: number;
  activeCorridors: number;
  pendingCount: number;
  failedCount: number;
}

export type AssetType = "USDC" | "XLM" | "EURC" | "BRLT" | "NGNT";

export interface ChartDataPoint {
  date: string;
  completed: number;
  pending: number;
  failed: number;
}

export interface CorridorVolume {
  corridor: string;
  volume: number;
  count: number;
  status: "completed" | "pending" | "failed";
}

export interface TimelineEntry {
  date: string;
  recipient: string;
  amount: number;
  corridor: string;
  status: "completed" | "pending" | "failed";
  flag: string;
}
