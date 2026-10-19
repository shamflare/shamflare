import { describe, expect, it } from "vitest";
import { contentAlternates, decodeParam, pageParam, staticAlternates, whatsappUrl } from "@/lib/site";
import { directionOf, isLocale } from "@/i18n/routing";

describe("whatsappUrl", () => {
  it("uses the international number without '+' and encodes the message", () => {
    expect(whatsappUrl("+90 534 329 99 18", "Hello Shamflare, I would like to discuss a project.")).toBe(
      "https://wa.me/905343299918?text=Hello%20Shamflare%2C%20I%20would%20like%20to%20discuss%20a%20project.",
    );
  });

  it("encodes Arabic text", () => {
    const url = whatsappUrl("905343299918", "مرحباً");
    expect(url.startsWith("https://wa.me/905343299918?text=%D9%85")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe("مرحباً");
  });

  it("omits the text parameter when there is no message and returns '' without a number", () => {
    expect(whatsappUrl("905343299918")).toBe("https://wa.me/905343299918");
    expect(whatsappUrl("", "hi")).toBe("");
  });
});

describe("locales", () => {
  it("uses RTL only for Arabic", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
    expect(directionOf("tr")).toBe("ltr");
  });

  it("recognises exactly the supported locales", () => {
    expect(["en", "tr", "ar"].every(isLocale)).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});

describe("SEO alternates", () => {
  it("announces every locale plus x-default for static pages", () => {
    const alternates = staticAlternates("tr", "services");
    expect(alternates?.canonical).toBe("https://shamflare.com/tr/services");
    expect(alternates?.languages).toMatchObject({
      en: "https://shamflare.com/en/services",
      ar: "https://shamflare.com/ar/services",
      "x-default": "https://shamflare.com/en/services",
    });
  });

  it("only announces locales in which a CMS item is published", () => {
    const alternates = contentAlternates("en", "blog", "hello", [
      { language: "en", slug: "hello" },
      { language: "tr", slug: "merhaba" },
    ]);
    expect(alternates?.languages).toEqual({
      en: "https://shamflare.com/en/blog/hello",
      tr: "https://shamflare.com/tr/blog/merhaba",
      "x-default": "https://shamflare.com/en/blog/hello",
    });
  });
});

describe("params", () => {
  it("decodes encoded slugs and tolerates malformed ones", () => {
    expect(decodeParam("%D9%85%D8%B1%D8%AD%D8%A8%D8%A7")).toBe("مرحبا");
    expect(decodeParam("100%")).toBe("100%");
  });

  it("parses page numbers defensively", () => {
    expect(pageParam("3")).toBe(3);
    expect(pageParam(["2", "5"])).toBe(2);
    expect(pageParam("-1")).toBe(1);
    expect(pageParam("abc")).toBe(1);
    expect(pageParam(undefined)).toBe(1);
  });
});
