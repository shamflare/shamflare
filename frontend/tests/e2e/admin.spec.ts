import { expect, test, type Page } from "@playwright/test";

const USERNAME = process.env.E2E_ADMIN_USERNAME;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Username").fill(USERNAME!);
  await page.getByLabel("Password").fill(PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
}

test.describe("authorization", () => {
  test("anonymous visitors cannot read or write admin data", async ({ request }) => {
    for (const path of ["admin/stats/", "admin/inquiries/", "admin/services/", "admin/site-settings/"]) {
      const response = await request.get(`/api/v1/${path}`);
      expect([401, 403], path).toContain(response.status());
    }
    const write = await request.post("/api/v1/admin/services/", { data: { key: "x" } });
    expect([401, 403]).toContain(write.status());
  });

  test("the dashboard redirects anonymous visitors to sign in", async ({ page }) => {
    await page.goto("/admin/inquiries");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Finquiries/);
  });

  test("wrong credentials are rejected", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Username").fill("nobody");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /incorrect|Too many/ })).toBeVisible();
  });
});

test.describe("dashboard", () => {
  test.skip(!USERNAME || !PASSWORD, "Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD to run dashboard tests.");

  test("overview shows live statistics and inquiries are listed", async ({ page }) => {
    await signIn(page);
    await expect(page.getByText("Published services")).toBeVisible();
    await page.getByRole("link", { name: "Inquiries" }).first().click();
    await expect(page.getByRole("heading", { name: "Inquiries" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("an inquiry can be moved through its statuses", async ({ page }) => {
    // Submit a fresh inquiry through the public API so the test does not depend on existing data.
    const csrf = (await (await page.request.get("/api/v1/auth/csrf/")).json()).csrfToken as string;
    const created = await page.request.post("/api/v1/inquiries/", {
      headers: { "X-CSRFToken": csrf },
      data: {
        name: "Status Test",
        email: "status.test@example.com",
        company: "",
        service: "",
        budget: "",
        description: "Inquiry created by the dashboard status test.",
        preferred_language: "en",
        consent: true,
        website: "",
      },
    });
    expect(created.status()).toBe(201);
    const { reference } = (await created.json()) as { reference: string };

    await signIn(page);
    await page.goto(`/admin/inquiries?search=${reference}`);
    await page.getByRole("link", { name: reference }).click();
    await page.getByRole("combobox", { name: "Status" }).selectOption("in_progress");
    await page.getByLabel("Internal notes").fill("Contacted by e2e test.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Inquiry updated.")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue("in_progress");
  });

  test("missing translations stay private: an English-only project is hidden in Turkish", async ({ page, request }) => {
    await signIn(page);
    const unique = `e2e-only-english-${Date.now()}`;
    await page.goto("/admin/portfolio/new");
    await page.getByLabel(/^Title/).fill(`E2E English only ${unique}`);
    await page.getByLabel(/URL slug/).fill(unique);
    await page.getByLabel(/^Summary/).fill("Created by the end-to-end test suite.");
    await page.getByRole("textbox", { name: /Project write-up/ }).fill("Temporary project body.");
    await page.getByLabel(/English translation status/).selectOption("published");
    await page.getByLabel("Project status").selectOption("published");
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(/^Created\./)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/portfolio\/\d+(\?created=1)?$/);

    const en = await request.get(`/api/v1/portfolio/${unique}/?lang=en`);
    expect(en.status()).toBe(200);
    const tr = await request.get(`/api/v1/portfolio/${unique}/?lang=tr`);
    expect(tr.status()).toBe(404);

    // Clean up.
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL(/\/admin\/portfolio$/);
    const gone = await request.get(`/api/v1/portfolio/${unique}/?lang=en`);
    expect(gone.status()).toBe(404);
  });

  test("site settings can be edited and saved", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/settings");
    await expect(page.getByLabel("WhatsApp number")).toHaveValue(/\d{8,15}/);
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText(/Settings saved/)).toBeVisible();
  });
});
