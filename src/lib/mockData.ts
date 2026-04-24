import { Transaction, Corridor, DashboardStats, ChartDataPoint, TimelineEntry } from "@/types";

export const MOCK_CORRIDORS: Corridor[] = [
  { sourceAsset: "USDC", destAsset: "EURC",  rate: 0.92,       feeBps: 30, active: true },
  { sourceAsset: "USDC", destAsset: "BRLT",  rate: 4.95,       feeBps: 50, active: true },
  { sourceAsset: "USDC", destAsset: "NGNT",  rate: 1580.0,     feeBps: 80, active: true },
  { sourceAsset: "XLM",  destAsset: "USDC",  rate: 0.11,       feeBps: 20, active: true },
  { sourceAsset: "XLM",  destAsset: "EURC",  rate: 0.101,      feeBps: 25, active: true },
];

export const CORRIDOR_FLAGS: Record<string, string> = {
  "USDC_EURC": "🇪🇺",
  "USDC_BRLT": "🇧🇷",
  "USDC_NGNT": "🇳🇬",
  "XLM_USDC":  "🇺🇸",
  "XLM_EURC":  "🇪🇺",
};

// 25 mock users / transactions for demo
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1,  sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", amountSent: 500,   amountReceived: 460,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1727654400, txHash: "a1b2c3d4e5f6" },
  { id: 2,  sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 200,   amountReceived: 990,    sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1727568000, txHash: "b2c3d4e5f6a1" },
  { id: 3,  sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 1000,  amountReceived: 1580000,sourceAsset: "USDC", destAsset: "NGNT",  status: "pending",   timestamp: 1727481600, txHash: "c3d4e5f6a1b2" },
  { id: 4,  sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 750,   amountReceived: 690,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1727395200, txHash: "d4e5f6a1b2c3" },
  { id: 5,  sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 300,   amountReceived: 1485,   sourceAsset: "USDC", destAsset: "BRLT",  status: "failed",    timestamp: 1727308800, txHash: "e5f6a1b2c3d4" },
  { id: 6,  sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 450,   amountReceived: 414,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1727222400, txHash: "f6a1b2c3d4e5" },
  { id: 7,  sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", amountSent: 2000,  amountReceived: 3160000,sourceAsset: "USDC", destAsset: "NGNT",  status: "completed", timestamp: 1727136000, txHash: "a1b2c3d4e5f7" },
  { id: 8,  sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 100,   amountReceived: 11,     sourceAsset: "XLM",  destAsset: "USDC",  status: "completed", timestamp: 1727049600, txHash: "b2c3d4e5f6a8" },
  { id: 9,  sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 600,   amountReceived: 552,    sourceAsset: "USDC", destAsset: "EURC",  status: "pending",   timestamp: 1726963200, txHash: "c3d4e5f6a1b9" },
  { id: 10, sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 800,   amountReceived: 3960,   sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1726876800, txHash: "d4e5f6a1b2c0" },
  { id: 11, sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", amountSent: 350,   amountReceived: 322,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1726790400, txHash: "e5f6a1b2c3d1" },
  { id: 12, sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 1500,  amountReceived: 2370000,sourceAsset: "USDC", destAsset: "NGNT",  status: "failed",    timestamp: 1726704000, txHash: "f6a1b2c3d4e2" },
  { id: 13, sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 250,   amountReceived: 230,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1726617600, txHash: "a1b2c3d4e5f3" },
  { id: 14, sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 900,   amountReceived: 4455,   sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1726531200, txHash: "b2c3d4e5f6a4" },
  { id: 15, sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 400,   amountReceived: 368,    sourceAsset: "USDC", destAsset: "EURC",  status: "pending",   timestamp: 1726444800, txHash: "c3d4e5f6a1b5" },
  { id: 16, sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 1200,  amountReceived: 1104,   sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1726358400, txHash: "d4e5f6a1b2c6" },
  { id: 17, sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 550,   amountReceived: 2722,   sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1726272000, txHash: "e5f6a1b2c3d7" },
  { id: 18, sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", amountSent: 3000,  amountReceived: 4740000,sourceAsset: "USDC", destAsset: "NGNT",  status: "completed", timestamp: 1726185600, txHash: "f6a1b2c3d4e8" },
  { id: 19, sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 175,   amountReceived: 161,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1726099200, txHash: "a1b2c3d4e5f9" },
  { id: 20, sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", amountSent: 650,   amountReceived: 3217,   sourceAsset: "USDC", destAsset: "BRLT",  status: "failed",    timestamp: 1726012800, txHash: "b2c3d4e5f6a0" },
  { id: 21, sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 420,   amountReceived: 386,    sourceAsset: "USDC", destAsset: "EURC",  status: "completed", timestamp: 1725926400, txHash: "c3d4e5f6a1ba" },
  { id: 22, sender: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", recipient: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", amountSent: 280,   amountReceived: 1386,   sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1725840000, txHash: "d4e5f6a1b2cb" },
  { id: 23, sender: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN", recipient: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", amountSent: 5000,  amountReceived: 7900000,sourceAsset: "USDC", destAsset: "NGNT",  status: "completed", timestamp: 1725753600, txHash: "e5f6a1b2c3dc" },
  { id: 24, sender: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 320,   amountReceived: 294,    sourceAsset: "USDC", destAsset: "EURC",  status: "pending",   timestamp: 1725667200, txHash: "f6a1b2c3d4ed" },
  { id: 25, sender: "GBVNNPOFVV2YNXSQXDJPBVQYY6MZXMQZQZQZQZQZQZQZQZQZQZQZQZQ", recipient: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ", amountSent: 1100,  amountReceived: 5445,   sourceAsset: "USDC", destAsset: "BRLT",  status: "completed", timestamp: 1725580800, txHash: "a1b2c3d4e5fe" },
];

export const MOCK_STATS: DashboardStats = {
  totalVolume: MOCK_TRANSACTIONS.reduce((s, t) => s + t.amountSent, 0),
  totalTransactions: MOCK_TRANSACTIONS.length,
  successRate: Math.round(
    (MOCK_TRANSACTIONS.filter(t => t.status === "completed").length / MOCK_TRANSACTIONS.length) * 100
  ),
  activeCorridors: 5,
  pendingCount: MOCK_TRANSACTIONS.filter(t => t.status === "pending").length,
  failedCount: MOCK_TRANSACTIONS.filter(t => t.status === "failed").length,
};

export const CHART_DATA: ChartDataPoint[] = [
  { date: "Sep 24", completed: 3, pending: 1, failed: 0 },
  { date: "Sep 25", completed: 4, pending: 2, failed: 1 },
  { date: "Sep 26", completed: 2, pending: 1, failed: 0 },
  { date: "Sep 27", completed: 5, pending: 0, failed: 1 },
  { date: "Sep 28", completed: 3, pending: 2, failed: 0 },
  { date: "Sep 29", completed: 6, pending: 1, failed: 1 },
  { date: "Sep 30", completed: 4, pending: 1, failed: 0 },
];

export const TIMELINE_DATA: TimelineEntry[] = [
  { date: "30.09", recipient: "EU Recipient",     amount: 18, corridor: "USDC→EURC", status: "completed", flag: "🇪🇺" },
  { date: "29.09", recipient: "US Recipient",     amount: 29, corridor: "XLM→USDC",  status: "pending",   flag: "🇺🇸" },
  { date: "28.09", recipient: "Multi Recipient",  amount: 15, corridor: "USDC→EURC", status: "completed", flag: "🌍" },
  { date: "27.09", recipient: "BR Recipient",     amount: 21, corridor: "USDC→BRLT", status: "completed", flag: "🇧🇷" },
  { date: "26.09", recipient: "NG Recipient",     amount: 10, corridor: "USDC→NGNT", status: "completed", flag: "🇳🇬" },
  { date: "25.09", recipient: "FB Recipient",     amount: 15, corridor: "USDC→BRLT", status: "pending",   flag: "🇧🇷" },
  { date: "25.09", recipient: "Multi Recipient",  amount: 19, corridor: "USDC→EURC", status: "completed", flag: "🌍" },
  { date: "24.09", recipient: "TW Recipient",     amount: 8,  corridor: "XLM→USDC",  status: "completed", flag: "🇺🇸" },
];
