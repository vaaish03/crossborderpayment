import { NextRequest, NextResponse } from "next/server";
import {
  Horizon,
  Asset,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Networks,
  Memo,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const STELLAR_NETWORK = Networks.TESTNET;

// POST /api/build-tx
// Always sends native XLM (no trustlines required).
// The destination currency conversion is shown in the UI and recorded in the memo.
export async function POST(req: NextRequest) {
  try {
    const { sender, recipient, amount, sourceAsset, destAsset, amountReceived } = await req.json();

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(sender);

    // Always transfer XLM on-chain — no trustlines needed for either party
    const xlmAmount = Number(amount).toFixed(7);

    // Memo records the intended corridor for transparency
    const memoText = `${sourceAsset}->${destAsset} ${Number(amountReceived).toFixed(2)}`;

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_NETWORK,
    })
      .addOperation(
        Operation.payment({
          destination: recipient,
          asset: Asset.native(),
          amount: xlmAmount,
        })
      )
      .addMemo(Memo.text(memoText.slice(0, 28))) // Stellar memo max 28 bytes
      .setTimeout(30)
      .build();

    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to build transaction";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/build-tx — submit signed XDR
export async function PUT(req: NextRequest) {
  try {
    const { signedXdr } = await req.json();
    const server = new Horizon.Server(HORIZON_URL);
    const tx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK);
    const result = await server.submitTransaction(tx);
    return NextResponse.json({ txHash: result.hash });
  } catch (err: unknown) {
    const extras = (err as any)?.response?.data?.extras;
    const codes = extras?.result_codes;
    if (codes) {
      const detail = [codes.transaction, ...(codes.operations ?? [])].filter(Boolean).join(", ");
      return NextResponse.json({ error: `Stellar error: ${detail}` }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
