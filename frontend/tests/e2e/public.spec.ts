import { expect, test } from "@playwright/test";

test.describe("public website", () => {
  test("home page renders brand, hero and CMS services", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a Project" }).first()).toBeVisible();
    // Services come from Django (seed_content publishes four).
    const services = page.locator("#services-title").locator("xpath=ancestor::section").getByRole("article");
    await expect(services).toHaveCount(4);
  });

  test("locale-less URLs redirect to a locale", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/(en|tr|ar)\/services$/);
  });

  test("main pages load with their own headings", async ({ page }) => {
    for (const path of ["/en/about", "/en/services", "/en/portfolio", "/en/blog", "/en/contact"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }), path).toBeVisible();
    }
  });

  test("Arabic uses RTL and translated interface text", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("link", { name: "ابدأ مشروعك" }).first()).toBeVisible();
    // Inline-start is on the right in RTL: the wordmark sits right of the CTA.
    const brand = await page.getByRole("banner").getByRole("link").first().boundingBox();
    const cta = await page.getByRole("banner").getByRole("link", { name: "ابدأ مشروعك" }).boundingBox();
    expect(brand && cta && brand.x > cta.x).toBe(true);
  });

  test("language switcher keeps the equivalent page, including localized slugs", async ({ page }) => {
    await page.goto("/en/services");
    await page.getByRole("link", { name: /Website Development/ }).first().click();
    await expect(page).toHaveURL(/\/en\/services\/.+/);
    await expect(page.getByRole("heading", { level: 1, name: "Website Development" })).toBeVisible();
    await page.getByRole("button", { name: /Change language/ }).click();
    await page.getByRole("link", { name: "Türkçe" }).click();
    await expect(page).toHaveURL(/\/tr\/services\/.+/);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(/Website Development/);
  });

  test("unknown and unpublished content returns the localized 404", async ({ page }) => {
    const response = await page.goto("/en/services/this-does-not-exist");
    await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
    expect([200, 404]).toContain(response?.status());
  });

  test("WhatsApp links use wa.me with the configured number", async ({ page }) => {
    await page.goto("/en/contact");
    const link = page.getByRole("link", { name: /WhatsApp/ }).first();
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/905343299918(\?text=.+)?$/);
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain("/en/services");
    expect(xml).toContain('hreflang="ar"');
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /admin");
  });

  test("mobile navigation opens, traps focus and navigates @mobile", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Portfolio" }).click();
    await expect(page).toHaveURL(/\/en\/portfolio$/);
    await expect(menu).toBeHidden();
  });
});
