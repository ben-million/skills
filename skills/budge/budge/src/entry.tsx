import { createIsolet } from "isolet-js";
import { react } from "isolet-js/react";
import { Budge, setAssetBase } from "./budge";

const scriptBase = (() => {
  if (typeof document === "undefined") return "";
  const src = document.currentScript?.getAttribute("src");
  if (!src) return "";
  try {
    return new URL(src, location.href).href.replace(/\/[^/]+$/, "");
  } catch {
    return "";
  }
})();

if (scriptBase) setAssetBase(scriptBase);

export const widget = createIsolet({
  name: "budge-widget",
  mount: react(Budge),
  isolation: "none",
});

function readConfig(): { slides?: unknown[]; autoFocus?: boolean } | null {
  const el = document.querySelector("[data-budge]");
  if (!el) return null;
  try {
    return JSON.parse(el.getAttribute("data-budge") || "{}");
  } catch {
    return null;
  }
}

function sync() {
  const config = readConfig();
  const hasSlides = config?.slides && Array.isArray(config.slides) && config.slides.length > 0;

  if (hasSlides && !widget.mounted) {
    widget.mount(document.body, { slides: config!.slides, autoFocus: config!.autoFocus ?? true });
  } else if (hasSlides && widget.mounted) {
    widget.update({ slides: config!.slides });
  } else if (!hasSlides && widget.mounted) {
    widget.unmount();
  }
}

if (typeof document !== "undefined") {
  const init = () => {
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-budge"],
      characterData: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
