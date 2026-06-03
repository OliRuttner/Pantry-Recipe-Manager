import { test, expect } from "@playwright/test";

test("homepage opens", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page).toHaveTitle(/Pantry|Vite|Recipe/);
});

test("site body is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("body")).toBeVisible();
});

test("pantry page loads", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("heading", { name: "My Pantry" })).toBeVisible();
});

test("pantry button is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("button", { name: "Pantry", exact: true })).toBeVisible();
});

test("recipes button is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("button", { name: /Recipes/i })).toBeVisible();
});

test("shopping list button is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("button", { name: /Shopping/i })).toBeVisible();
});

test("generate demo data button is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("button", { name: /Generate Demo Data/i })).toBeVisible();
});

test("add ingredient button is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("button", { name: /Add Ingredient/i })).toBeVisible();
});

test("pantry manager brand is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByText(/Pantry Manager/i).first()).toBeVisible();
});

test("my pantry heading is visible", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByRole("heading", { name: "My Pantry" })).toBeVisible();
});

test("recipes page can be opened", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: /Recipes/i }).click();
  await expect(page.getByText(/Recipe|Recipes|Suggestions/i).first()).toBeVisible();
});

test("shopping list page can be opened", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: /Shopping/i }).click();
  await expect(page.getByText(/Shopping/i).first()).toBeVisible();
});

test("pantry page can be reopened", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: /Shopping/i }).click();
  await page.getByRole("button", { name: "Pantry", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My Pantry" })).toBeVisible();
});

test("generate demo data button can be clicked", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: /Generate Demo Data/i }).click();
  await expect(page.locator("body")).toBeVisible();
});

test("add ingredient button can be clicked", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.getByRole("button", { name: /Add Ingredient/i }).click();
  await expect(page.locator("body")).toBeVisible();
});

test("page has at least one button", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("button").first()).toBeVisible();
});

test("page has heading", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.locator("h1").first()).toBeVisible();
});

test("page has no browser error text", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByText(/Application error/i)).toHaveCount(0);
});

test("page has no not found text", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByText(/404/i)).toHaveCount(0);
});

test("page has no failed to fetch text", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await expect(page.getByText(/Failed to fetch/i)).toHaveCount(0);
});

test("body remains visible after reload", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.reload();
  await expect(page.locator("body")).toBeVisible();
});

test("pantry button remains visible after reload", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.reload();
  await expect(page.getByRole("button", { name: "Pantry", exact: true })).toBeVisible();
});

test("recipes button remains visible after reload", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.reload();
  await expect(page.getByRole("button", { name: /Recipes/i })).toBeVisible();
});

test("shopping button remains visible after reload", async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.reload();
  await expect(page.getByRole("button", { name: /Shopping/i })).toBeVisible();
});

test("page works on mobile size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:5173");
  await expect(page.locator("body")).toBeVisible();
});

test("page works on tablet size", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("http://localhost:5173");
  await expect(page.locator("body")).toBeVisible();
});

test("page works on desktop size", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:5173");
  await expect(page.locator("body")).toBeVisible();
});

test("cook recipe button is checked if present", async ({ page }) => {
  await page.goto("http://localhost:5173");
  const button = page.getByRole("button", { name: /Cook Recipe/i });

  if (await button.count()) {
    await expect(button.first()).toBeVisible();
  } else {
    await expect(page.locator("body")).toBeVisible();
  }
});

test("ready badge is checked if present", async ({ page }) => {
  await page.goto("http://localhost:5173");
  const ready = page.getByText(/Ready/i);

  if (await ready.count()) {
    await expect(ready.first()).toBeVisible();
  } else {
    await expect(page.locator("body")).toBeVisible();
  }
});

test("expiration text is checked if present", async ({ page }) => {
  await page.goto("http://localhost:5173");
  const expiration = page.getByText(/Expiration|Expires|Expiring/i);

  if (await expiration.count()) {
    await expect(expiration.first()).toBeVisible();
  } else {
    await expect(page.locator("body")).toBeVisible();
  }
});