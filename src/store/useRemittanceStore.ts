import { create } from "zustand";
import { Transaction, WalletState, DashboardStats } from "@/types";
import { MOCK_TRANSACTIONS, MOCK_STATS } from "@/lib/mockData";

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

  transactions: MOCK_TRANSACTIONS,

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

  stats: MOCK_STATS,

  refreshStats: () => {
    const txs = get().transactions;
    const completed = txs.filter((t) => t.status === "completed");
    set({
      stats: {
        totalVolume: txs.reduce((s, t) => s + t.amountSent, 0),
        totalTransactions: txs.length,
        successRate: Math.round((completed.length / txs.length) * 100),
        activeCorridors: 5,
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
