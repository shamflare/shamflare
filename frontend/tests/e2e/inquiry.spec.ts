import { expect, test } from "@playwright/test";

test.describe("project inquiry", () => {
  test("validates on the client before sending anything", async ({ page }) => {
    let posted = false;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/api/v1/inquiries/")) posted = true;
    });
    await page.goto("/en/contact");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page.getByText("Please correct the highlighted fields.")).toBeVisible();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByText("Please describe your project in at least 20 characters.")).toBeVisible();
    await expect(page.getByLabel(/Your name/)).toHaveAttribute("aria-invalid", "true");
    expect(posted).toBe(false);
  });

  test("stores a valid inquiry and shows the server reference", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel(/Your name/).fill("E2E Visitor");
    await page.getByLabel(/Email address/).fill("e2e.visitor@example.com");
    await page.getByRole("combobox", { name: /^Service/ }).selectOption({ index: 1 });
    await page.getByLabel(/Project description/).fill("We need a bilingual website with a simple booking form and an admin area.");
    await page.getByLabel(/I agree that Shamflare may store/).check();
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page.getByRole("heading", { name: /your inquiry has been received/ })).toBeVisible();
    await expect(page.getByText(/INQ-\d{4}-\d+/)).toBeVisible();
  });

  test("the API rejects the honeypot and missing consent", async ({ request }) => {
    const base = {
      name: "Bot",
      email: "bot@example.com",
      company: "",
      service: "",
      budget: "",
      description: "This is a long enough description for validation.",
      preferred_language: "en",
    };
    const csrf = await request.get("/api/v1/auth/csrf/");
    const token = (await csrf.json()).csrfToken as string;
    const headers = { "X-CSRFToken": token, Referer: "http://127.0.0.1" };

    const honeypot = await request.post("/api/v1/inquiries/", { data: { ...base, consent: true, website: "spam" }, headers });
    expect(honeypot.status()).toBe(400);
    expect((await honeypot.json()).error.code).toBe("validation_error");

    const noConsent = await request.post("/api/v1/inquiries/", { data: { ...base, consent: false, website: "" }, headers });
    expect(noConsent.status()).toBe(400);
  });
});
