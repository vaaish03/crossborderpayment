import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StellarSend — Cross-Border Remittance",
  description: "Send money across borders using Stellar blockchain. USDC → XLM → local stablecoins.",
  keywords: ["Stellar", "remittance", "blockchain", "USDC", "cross-border payments"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Sidebar />
        <Navbar />
        <main className="ml-16 mt-14 min-h-screen bg-bg-primary">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#fff",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
            },
            success: {
              iconTheme: { primary: "#A8FF3E", secondary: "#000" },
            },
            error: {
              iconTheme: { primary: "#FF4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
