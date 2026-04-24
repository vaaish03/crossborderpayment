"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, ExternalLink, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Transaction } from "@/types";
import { getStellarExpertUrl } from "@/lib/stellar";

function truncate(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

interface Props {
  tx: Transaction;
  onClose: () => void;
}

const steps = ["Initiating", "Broadcasting", "Confirming", "Complete"];

export default function TransactionModal({ tx, onClose }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (tx.status === "pending") {
      const timers = steps.map((_, i) =>
        setTimeout(() => setStep(i + 1), (i + 1) * 800)
      );
      return () => timers.forEach(clearTimeout);
    } else if (tx.status === "completed") {
      setStep(steps.length);
    }
  }, [tx.status]);

  const isDone = tx.status === "completed" || step >= steps.length;
  const isFailed = tx.status === "failed";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">Transaction Status</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {isFailed ? (
            <XCircle size={56} className="text-red-400" />
          ) : isDone ? (
            <CheckCircle size={56} className="text-accent-green" />
          ) : (
            <Clock size={56} className="text-accent-orange animate-pulse" />
          )}
        </div>

        {/* Status Text */}
        <p className="text-center text-white font-semibold text-lg mb-1">
          {isFailed ? "Transaction Failed" : isDone ? "Transaction Confirmed!" : "Processing..."}
        </p>
        <p className="text-center text-text-secondary text-sm mb-6">
          {isFailed
            ? "The transaction could not be completed."
            : isDone
            ? "Your funds have been sent successfully."
            : "Please wait while your transaction is being processed."}
        </p>

        {/* Progress Steps */}
        {!isFailed && (
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i < step
                        ? "bg-accent-green text-black"
                        : i === step
                        ? "bg-accent-orange text-black animate-pulse"
                        : "bg-bg-hover text-text-muted"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-text-muted text-xs mt-1 hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 mx-1 transition-all duration-300 ${
                      i < step - 1 ? "bg-accent-green" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* TX Details */}
        <div className="bg-bg-hover rounded-xl p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Amount Sent</span>
            <span className="text-white">{tx.amountSent} {tx.sourceAsset}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Amount Received</span>
            <span className="text-accent-green">{tx.amountReceived.toFixed(4)} {tx.destAsset}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Recipient</span>
            <span className="text-white font-mono text-xs">{truncate(tx.recipient)}</span>
          </div>
          {isDone && (
            <div className="flex justify-between text-sm border-t border-border pt-2">
              <span className="text-text-secondary">TX Hash</span>
              <a
                href={getStellarExpertUrl(tx.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green flex items-center gap-1 hover:underline text-xs"
              >
                {tx.txHash.slice(0, 12)}...
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        <Button
          variant={isDone ? "primary" : "secondary"}
          size="lg"
          className="w-full"
          onClick={onClose}
        >
          {isDone ? "Done" : "Close"}
        </Button>
      </div>
    </div>
  );
}
