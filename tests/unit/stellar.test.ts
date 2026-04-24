import {
  getExchangeRate,
  calculateFee,
  calculateReceived,
  getFeeBps,
  isValidStellarAddress,
  getStellarExpertUrl,
  formatAmount,
} from "@/lib/stellar";

describe("stellar.ts utilities", () => {
  describe("getExchangeRate", () => {
    it("returns correct USDC→EURC rate", () => {
      expect(getExchangeRate("USDC", "EURC")).toBe(0.92);
    });
    it("returns correct USDC→BRLT rate", () => {
      expect(getExchangeRate("USDC", "BRLT")).toBe(4.95);
    });
    it("returns correct USDC→NGNT rate", () => {
      expect(getExchangeRate("USDC", "NGNT")).toBe(1580.0);
    });
    it("returns correct XLM→USDC rate", () => {
      expect(getExchangeRate("XLM", "USDC")).toBe(0.11);
    });
    it("returns 1.0 for unknown pair", () => {
      expect(getExchangeRate("USDC" as any, "UNKNOWN" as any)).toBe(1.0);
    });
  });

  describe("calculateFee", () => {
    it("calculates 0.3% fee correctly", () => {
      expect(calculateFee(1000, 30)).toBeCloseTo(3, 5);
    });
    it("calculates 0.5% fee correctly", () => {
      expect(calculateFee(1000, 50)).toBeCloseTo(5, 5);
    });
    it("returns 0 for zero amount", () => {
      expect(calculateFee(0, 30)).toBe(0);
    });
  });

  describe("calculateReceived", () => {
    it("calculates received amount correctly for USDC→EURC", () => {
      const rate = getExchangeRate("USDC", "EURC");
      const feeBps = getFeeBps("USDC", "EURC");
      const received = calculateReceived(1000, rate, feeBps);
      // fee = 3, net = 997, received = 997 * 0.92 = 917.24
      expect(received).toBeCloseTo(917.24, 1);
    });
    it("returns 0 for zero amount", () => {
      expect(calculateReceived(0, 0.92, 30)).toBe(0);
    });
  });

  describe("getFeeBps", () => {
    it("returns 30 for USDC→EURC", () => {
      expect(getFeeBps("USDC", "EURC")).toBe(30);
    });
    it("returns 80 for USDC→NGNT", () => {
      expect(getFeeBps("USDC", "NGNT")).toBe(80);
    });
    it("returns default 30 for unknown pair", () => {
      expect(getFeeBps("USDC" as any, "UNKNOWN" as any)).toBe(30);
    });
  });

  describe("isValidStellarAddress", () => {
    it("validates correct Stellar address", () => {
      expect(
        isValidStellarAddress("GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ")
      ).toBe(true);
    });
    it("rejects short address", () => {
      expect(isValidStellarAddress("GABC123")).toBe(false);
    });
    it("rejects address not starting with G", () => {
      expect(
        isValidStellarAddress("XCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DUIISGOOFY2IQGZQ")
      ).toBe(false);
    });
    it("rejects empty string", () => {
      expect(isValidStellarAddress("")).toBe(false);
    });
  });

  describe("getStellarExpertUrl", () => {
    it("returns correct testnet URL", () => {
      const url = getStellarExpertUrl("abc123");
      expect(url).toBe("https://stellar.expert/explorer/testnet/tx/abc123");
    });
  });

  describe("formatAmount", () => {
    it("formats USD amount", () => {
      const result = formatAmount(1000, "USDC");
      expect(result).toContain("1,000");
    });
  });
});
