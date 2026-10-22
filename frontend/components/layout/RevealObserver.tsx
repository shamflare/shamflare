"use client";

import { useEffect } from "react";

// A data attribute rather than a class: React owns `className` and would drop an
// added class when it hydrates or re-renders the element (hiding it again).
const TARGETS = ".reveal:not([data-revealed]), .reveal-group > :not([data-revealed])";

declare global {
  interface Window {
    __sfReveal?: boolean;
  }
}

/**
 * Scroll reveals: elements stay hidden (see [data-reveal] in globals.css) until
 * they enter the viewport, then play their entrance once. The theme script sets
 * data-reveal before first paint; this takes over from it, keeps the attribute
 * when <html> is re-rendered (locale switch), and picks up streamed content.
 * The dashboard's live preview dispatches `sf:reveal-reset` to replay it.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete root.dataset.reveal;
      return;
    }
    window.__sfReveal = true;
    root.dataset.reveal = "";

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          intersection.unobserve(entry.target);
        }
      },
      // Start once an element is a little way into the viewport, so the entrance is seen.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    const observeAll = () => document.querySelectorAll(TARGETS).forEach((el) => intersection.observe(el));

    observeAll();
    const content = new MutationObserver(observeAll);
    content.observe(document.body, { childList: true, subtree: true });
    const attributes = new MutationObserver(() => {
      if (!("reveal" in root.dataset)) root.dataset.reveal = "";
    });
    attributes.observe(root, { attributes: true, attributeFilter: ["data-reveal"] });

    const reset = () => {
      document.querySelectorAll("[data-revealed]").forEach((el) => el.removeAttribute("data-revealed"));
      observeAll();
    };
    window.addEventListener("sf:reveal-reset", reset);

    return () => {
      content.disconnect();
      attributes.disconnect();
      intersection.disconnect();
      window.removeEventListener("sf:reveal-reset", reset);
    };
  }, []);

  return null;
}
