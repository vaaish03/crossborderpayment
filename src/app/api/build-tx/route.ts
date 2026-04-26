import { NextRequest, NextResponse } from "next/server";
import {
  Horizon,
  Asset,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const STELLAR_NETWORK = Networks.TESTNET;

const ASSETS: Record<string, { code: string; issuer: string | null }> = {
  USDC: { code: "USDC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
  EURC: { code: "EURC", issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO" },
  XLM:  { code: "XLM",  issuer: null },
  BRLT: { code: "BRLT", issuer: "GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP" },
  NGNT: { code: "NGNT", issuer: "GAWODAROMJ33V5YDFY3EFPEB7XABQOWQ5ZZPQ2IYXFGKXZXZQZQZQZQ" },
};

function toAsset(code: string): Asset {
  const info = ASSETS[code];
  if (!info || code === "XLM" || !info.issuer) return Asset.native();
  return new Asset(info.code, info.issuer);
}

// POST /api/build-tx — returns unsigned XDR
export async function POST(req: NextRequest) {
  try {
    const { sender, recipient, amount, sourceAsset, destAsset, destMin } = await req.json();

    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(sender);

    const sendAsset = toAsset(sourceAsset);
    const receiveAsset = toAsset(destAsset);

    const operation =
      sourceAsset === destAsset
        ? Operation.payment({
            destination: recipient,
            asset: sendAsset,
            amount: Number(amount).toFixed(7),
          })
        : Operation.pathPaymentStrictSend({
            sendAsset,
            sendAmount: Number(amount).toFixed(7),
            destination: recipient,
            destAsset: receiveAsset,
            destMin: Number(destMin).toFixed(7),
            path: [],
          });

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_NETWORK,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to build transaction";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/build-tx/submit — submits signed XDR
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
