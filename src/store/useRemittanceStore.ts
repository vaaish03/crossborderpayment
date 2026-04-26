import { create } from "zustand";
import { Transaction, WalletState, DashboardStats } from "@/types";
import { MOCK_CORRIDORS } from "@/lib/mockData";

const EMPTY_STATS: DashboardStats = {
  totalVolume: 0,
  totalTransactions: 0,
  successRate: 0,
  activeCorridors: MOCK_CORRIDORS.filter((c) => c.active).length,
  pendingCount: 0,
  failedCount: 0,
};

interface RemittanceStore {
  // Wallet
  wallet: WalletState;
  setWallet: (wallet: WalletState) => void;
  disconnectWallet: () => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (id: number, status: Transaction["status"]) => void;

  // Stats
  stats: DashboardStats;
  refreshStats: () => void;

  // UI
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  selectedCorridor: string;
  setSelectedCorridor: (corridor: string) => void;
}

export const useRemittanceStore = create<RemittanceStore>((set, get) => ({
  wallet: {
    address: null,
    isConnected: false,
    network: "TESTNET",
  },

  setWallet: (wallet) => set({ wallet }),

  disconnectWallet: () =>
    set({ wallet: { address: null, isConnected: false, network: "TESTNET" } }),

  transactions: [],

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),

  updateTransactionStatus: (id, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, status } : tx
      ),
    })),

  stats: EMPTY_STATS,

  refreshStats: () => {
    const txs = get().transactions;
    const completed = txs.filter((t) => t.status === "completed");
    set({
      stats: {
        totalVolume: txs.reduce((s, t) => s + t.amountSent, 0),
        totalTransactions: txs.length,
        successRate: txs.length > 0 ? Math.round((completed.length / txs.length) * 100) : 0,
        activeCorridors: MOCK_CORRIDORS.filter((c) => c.active).length,
        pendingCount: txs.filter((t) => t.status === "pending").length,
        failedCount: txs.filter((t) => t.status === "failed").length,
      },
    });
  },

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  selectedCorridor: "all",
  setSelectedCorridor: (selectedCorridor) => set({ selectedCorridor }),
}));
