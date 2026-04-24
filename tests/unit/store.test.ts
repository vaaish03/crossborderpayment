import { renderHook, act } from "@testing-library/react";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import type { Transaction, WalletState } from "@/types";

// Reset store between tests
beforeEach(() => {
  useRemittanceStore.setState({
    wallet: { address: null, isConnected: false, network: "TESTNET" },
    isLoading: false,
    selectedCorridor: "all",
  });
});

describe("useRemittanceStore", () => {
  describe("wallet state", () => {
    it("starts disconnected", () => {
      const { result } = renderHook(() => useRemittanceStore());
      expect(result.current.wallet.isConnected).toBe(false);
      expect(result.current.wallet.address).toBeNull();
    });

    it("sets wallet state", () => {
      const { result } = renderHook(() => useRemittanceStore());
      const mockWallet: WalletState = {
        address: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ",
        isConnected: true,
        network: "TESTNET",
      };
      act(() => {
        result.current.setWallet(mockWallet);
      });
      expect(result.current.wallet.isConnected).toBe(true);
      expect(result.current.wallet.address).toBe(mockWallet.address);
    });

    it("disconnects wallet", () => {
      const { result } = renderHook(() => useRemittanceStore());
      act(() => {
        result.current.setWallet({
          address: "GTEST",
          isConnected: true,
          network: "TESTNET",
        });
        result.current.disconnectWallet();
      });
      expect(result.current.wallet.isConnected).toBe(false);
      expect(result.current.wallet.address).toBeNull();
    });
  });

  describe("transactions", () => {
    it("adds a transaction", () => {
      const { result } = renderHook(() => useRemittanceStore());
      const initialCount = result.current.transactions.length;

      const newTx: Transaction = {
        id: 9999,
        sender: "GSENDER",
        recipient: "GRECIPIENT",
        amountSent: 100,
        amountReceived: 92,
        sourceAsset: "USDC",
        destAsset: "EURC",
        status: "completed",
        timestamp: 1700000000,
        txHash: "testhash",
      };

      act(() => {
        result.current.addTransaction(newTx);
      });

      expect(result.current.transactions.length).toBe(initialCount + 1);
      expect(result.current.transactions[0].id).toBe(9999);
    });

    it("updates transaction status", () => {
      const { result } = renderHook(() => useRemittanceStore());

      const newTx: Transaction = {
        id: 8888,
        sender: "GSENDER",
        recipient: "GRECIPIENT",
        amountSent: 200,
        amountReceived: 184,
        sourceAsset: "USDC",
        destAsset: "EURC",
        status: "pending",
        timestamp: 1700000000,
        txHash: "testhash2",
      };

      act(() => {
        result.current.addTransaction(newTx);
        result.current.updateTransactionStatus(8888, "completed");
      });

      const updated = result.current.transactions.find(t => t.id === 8888);
      expect(updated?.status).toBe("completed");
    });
  });

  describe("loading state", () => {
    it("sets loading state", () => {
      const { result } = renderHook(() => useRemittanceStore());
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.isLoading).toBe(true);
      act(() => {
        result.current.setLoading(false);
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("corridor filter", () => {
    it("sets selected corridor", () => {
      const { result } = renderHook(() => useRemittanceStore());
      act(() => {
        result.current.setSelectedCorridor("USDC→EURC");
      });
      expect(result.current.selectedCorridor).toBe("USDC→EURC");
    });
  });

  describe("refreshStats", () => {
    it("recalculates stats from transactions", () => {
      const { result } = renderHook(() => useRemittanceStore());
      act(() => {
        result.current.refreshStats();
      });
      expect(result.current.stats.totalTransactions).toBe(
        result.current.transactions.length
      );
      expect(result.current.stats.successRate).toBeGreaterThan(0);
      expect(result.current.stats.successRate).toBeLessThanOrEqual(100);
    });
  });
});
