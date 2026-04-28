import { test, expect } from "@playwright/test";

test.describe("StellarSend E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("dashboard loads with correct title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("STELLAR SEND");
  });

  test("dashboard shows stats cards", async ({ page }) => {
    await expect(page.locator("text=Total Volume")).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: /^Transactions$/ }).first()).toBeVisible();
    await expect(page.locator("text=Success Rate")).toBeVisible();
    await expect(page.locator("text=Active Corridors")).toBeVisible();
  });

  test("sidebar navigation is visible", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("navbar is visible", async ({ page }) => {
    const navbar = page.locator("header");
    await expect(navbar).toBeVisible();
    await expect(page.locator("text=Connect Wallet")).toBeVisible();
  });

  test("navigates to Send Money page", async ({ page }) => {
    await page.goto("http://localhost:3000/send");
    await expect(page).toHaveURL(/\/send/);
    await expect(page.locator("h1")).toContainText("Send Money");
  });

  test("send form has all required fields", async ({ page }) => {
    await page.goto("http://localhost:3000/send");
    await expect(page.locator("text=From Wallet")).toBeVisible();
    await expect(page.locator("text=Recipient Address")).toBeVisible();
    await expect(page.locator("text=Amount")).toBeVisible();
    await expect(page.locator("text=Destination Currency")).toBeVisible();
    await expect(page.locator("text=Slippage Tolerance")).toBeVisible();
    await expect(page.locator("button:has-text('Send Now')")).toBeVisible();
  });

  test("send form shows validation errors", async ({ page }) => {
    await page.goto("http://localhost:3000/send");
    await page.click("button:has-text('Send Now')");
    await expect(page.locator("text=Recipient address is required")).toBeVisible();
  });

  test("send form shows exchange rate when amount entered", async ({ page }) => {
    await page.goto("http://localhost:3000/send");
    await page.fill("input[placeholder='0.00']", "100");
    await expect(page.locator("text=Exchange Rate")).toBeVisible();
    await expect(page.locator("text=Recipient Gets")).toBeVisible();
  });

  test("navigates to Transaction History page", async ({ page }) => {
    await page.goto("http://localhost:3000/history");
    await expect(page.locator("h1")).toContainText("Transaction History");
  });

  test("history page shows transactions table", async ({ page }) => {
    await page.goto("http://localhost:3000/history");
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("text=Date")).toBeVisible();
    await expect(page.locator("text=Sender")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("history page has export CSV button", async ({ page }) => {
    await page.goto("http://localhost:3000/history");
    await expect(page.locator("button:has-text('Export CSV')")).toBeVisible();
  });

  test("history page search filters transactions", async ({ page }) => {
    await page.goto("http://localhost:3000/history");
    const searchInput = page.locator("input[placeholder='Search address or hash...']");
    await searchInput.fill("GCKFBE");
    // Table should still be visible
    await expect(page.locator("table")).toBeVisible();
  });

  test("navigates to Monitoring page", async ({ page }) => {
    await page.goto("http://localhost:3000/monitoring");
    await expect(page.locator("h1")).toContainText("Monitoring");
  });

  test("monitoring page shows charts", async ({ page }) => {
    await page.goto("http://localhost:3000/monitoring");
    await expect(page.locator("text=Transaction Volume")).toBeVisible();
    await expect(page.locator("text=Status Distribution")).toBeVisible();
    await expect(page.locator("text=Active Corridors")).toBeVisible();
  });

  test("monitoring page shows corridor table", async ({ page }) => {
    await page.goto("http://localhost:3000/monitoring");
    await expect(page.locator("text=USDC → EURC")).toBeVisible();
    await expect(page.locator("text=USDC → BRLT")).toBeVisible();
  });

  test("dashboard filter dropdowns are visible", async ({ page }) => {
    await expect(page.locator("text=Date:")).toBeVisible();
    await expect(page.locator("text=Corridor:")).toBeVisible();
  });

  test("testnet notice is shown on send page", async ({ page }) => {
    await page.goto("http://localhost:3000/send");
    await expect(page.locator("text=Testnet Mode")).toBeVisible();
  });
});
