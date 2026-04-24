"use client";
import RemittanceForm from "@/components/send/RemittanceForm";
import Card from "@/components/ui/Card";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: Zap,    title: "Fast Settlement",   desc: "Transactions settle in 3-5 seconds on Stellar" },
  { icon: Shield, title: "Secure & Audited",  desc: "Soroban smart contracts with slippage protection" },
  { icon: Globe,  title: "5 Corridors",       desc: "USDC, XLM → EURC, BRLT, NGNT and more" },
];

export default function SendPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white font-bold text-3xl tracking-tight">Send Money</h1>
        <p className="text-text-secondary text-sm mt-1">
          Cross-border transfers via Stellar path payments
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <RemittanceForm />

        {/* Info Panel */}
        <div className="flex flex-col gap-4 max-w-sm w-full">
          {/* Path Payment Flow */}
          <Card>
            <h3 className="text-white font-semibold mb-4">How It Works</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-accent-green/20 text-accent-green px-3 py-1.5 rounded-lg font-medium">USDC</div>
              <ArrowRight size={14} className="text-text-muted" />
              <div className="bg-bg-hover text-text-secondary px-3 py-1.5 rounded-lg font-medium">XLM</div>
              <ArrowRight size={14} className="text-text-muted" />
              <div className="bg-accent-orange/20 text-accent-orange px-3 py-1.5 rounded-lg font-medium">DEST</div>
            </div>
            <p className="text-text-secondary text-xs mt-3">
              Stellar&apos;s path payment automatically routes your funds through the best liquidity path.
            </p>
          </Card>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} padding="sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent-green" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{title}</p>
                    <p className="text-text-secondary text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Testnet Notice */}
          <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-4">
            <p className="text-accent-orange text-xs font-semibold mb-1">⚠ Testnet Mode</p>
            <p className="text-text-secondary text-xs">
              This app runs on Stellar Testnet. No real funds are used. Switch Freighter to Testnet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
