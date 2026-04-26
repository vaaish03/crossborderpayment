"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import {
  getExchangeRate,
  calculateReceived,
  getFeeBps,
  isValidStellarAddress,
  formatAmount,
  buildAndSubmitPayment,
} from "@/lib/stellar";
import { signTransaction } from "@/lib/freighter";
import type { AssetCode } from "@/lib/stellar";
import type { Transaction } from "@/types";
import TransactionModal from "./TransactionModal";

const schema = z.object({
  recipient: z
    .string()
    .min(1, "Recipient address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  sourceAsset: z.enum(["USDC", "XLM"]),
  destAsset: z.enum(["EURC", "BRLT", "NGNT", "USDC"]),
  slippageTolerance: z.number().min(10).max(300),
});

type FormData = z.infer<typeof schema>;

const SOURCE_ASSETS: AssetCode[] = ["USDC", "XLM"];
const DEST_ASSETS: AssetCode[] = ["EURC", "BRLT", "NGNT", "USDC"];

export default function RemittanceForm() {
  const { wallet, addTransaction, refreshStats } = useRemittanceStore();
  const [modalTx, setModalTx] = useState<Transaction | null>(null);
  const [rate, setRate] = useState(0);
  const [received, setReceived] = useState(0);
  const [fee, setFee] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sourceAsset: "USDC",
      destAsset: "EURC",
      slippageTolerance: 50,
    },
  });

  const sourceAsset = watch("sourceAsset") as AssetCode;
  const destAsset = watch("destAsset") as AssetCode;
  const amount = watch("amount");
  const slippage = watch("slippageTolerance");

  useEffect(() => {
    const r = getExchangeRate(sourceAsset, destAsset);
    const feeBps = getFeeBps(sourceAsset, destAsset);
    const amt = Number(amount) || 0;
    const feeAmt = (amt * feeBps) / 10000;
    const recv = calculateReceived(amt, r, feeBps);
    setRate(r);
    setFee(feeAmt);
    setReceived(recv);
  }, [sourceAsset, destAsset, amount]);

  const onSubmit = async (data: FormData) => {
    if (!wallet.isConnected || !wallet.address) {
      toast.error("Please connect your Freighter wallet first");
      return;
    }

    // Create a pending tx entry immediately so the modal opens
    const pendingTx: Transaction = {
      id: Date.now(),
      sender: wallet.address,
      recipient: data.recipient,
      amountSent: Number(data.amount),
      amountReceived: received,
      sourceAsset: data.sourceAsset,
      destAsset: data.destAsset,
      status: "pending",
      timestamp: Math.floor(Date.now() / 1000),
      txHash: "",
    };

    setModalTx(pendingTx);
    addTransaction(pendingTx);

    try {
      // Build, sign via Freighter popup, and submit to Stellar testnet
      const { txHash } = await buildAndSubmitPayment(
        wallet.address,
        data.recipient,
        data.amount,
        data.sourceAsset as AssetCode,
        data.destAsset as AssetCode,
        (xdr) => signTransaction(xdr, wallet.network ?? "TESTNET")
      );

      const completedTx: Transaction = { ...pendingTx, status: "completed", txHash };
      setModalTx(completedTx);
      refreshStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      toast.error(msg);
      const failedTx: Transaction = { ...pendingTx, status: "failed" };
      setModalTx(failedTx);
      refreshStats();
    }
  };

  return (
    <>
      <Card className="max-w-lg w-full">
        <h2 className="text-white font-bold text-lg mb-6">Send Money</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Sender */}
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">From Wallet</label>
            <div className="bg-bg-hover rounded-xl px-4 py-3 text-sm text-text-secondary border border-border">
              {wallet.isConnected
                ? wallet.address
                : "Connect wallet to auto-fill"}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Recipient Address</label>
            <input
              {...register("recipient")}
              placeholder="G... Stellar address"
              className="w-full bg-bg-hover rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-accent-green focus:outline-none transition-colors placeholder:text-text-muted"
            />
            {errors.recipient && (
              <p className="text-red-400 text-xs mt-1">{errors.recipient.message}</p>
            )}
          </div>

          {/* Amount + Source Asset */}
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Amount</label>
            <div className="flex gap-2">
              <input
                {...register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="flex-1 bg-bg-hover rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-accent-green focus:outline-none transition-colors placeholder:text-text-muted"
              />
              <select
                {...register("sourceAsset")}
                className="bg-bg-hover rounded-xl px-3 py-3 text-sm text-white border border-border focus:border-accent-green focus:outline-none transition-colors"
              >
                {SOURCE_ASSETS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Destination Asset */}
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Destination Currency</label>
            <select
              {...register("destAsset")}
              className="w-full bg-bg-hover rounded-xl px-4 py-3 text-sm text-white border border-border focus:border-accent-green focus:outline-none transition-colors"
            >
              {DEST_ASSETS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Rate Info */}
          {Number(amount) > 0 && (
            <div className="bg-bg-hover rounded-xl p-4 space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Exchange Rate</span>
                <span className="text-white">1 {sourceAsset} = {rate.toFixed(4)} {destAsset}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fee ({getFeeBps(sourceAsset, destAsset) / 100}%)</span>
                <span className="text-accent-orange">-{fee.toFixed(4)} {sourceAsset}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-text-secondary">Recipient Gets</span>
                <span className="text-accent-green font-semibold">
                  {received.toFixed(4)} {destAsset}
                </span>
              </div>
            </div>
          )}

          {/* Slippage */}
          <div>
            <div className="flex justify-between mb-1.5 items-center">
              <label className="text-text-secondary text-xs">
                Slippage Tolerance
                <span
                  className="ml-1 text-text-muted cursor-help"
                  title="Max price movement you'll accept. If the rate shifts more than this before the transaction confirms, it will revert to protect you."
                >
                  ⓘ
                </span>
              </label>
              <span className="text-accent-green text-xs font-medium">{(slippage / 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              {...register("slippageTolerance", { valueAsNumber: true })}
              className="w-full accent-accent-green"
            />
            <div className="flex justify-between text-text-muted text-xs mt-1">
              <span>0.1% (safer)</span>
              <span>3.0% (faster)</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            Send Now →
          </Button>
        </form>
      </Card>

      {modalTx && (
        <TransactionModal
          tx={modalTx}
          onClose={() => setModalTx(null)}
        />
      )}
    </>
  );
}
