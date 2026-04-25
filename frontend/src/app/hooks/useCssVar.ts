import { useLayoutEffect, useState } from "react";

/** Reads a custom property from :root (for canvas / SVG / motion that need resolved strings). */
export function useCssVar(name: `--${string}`, fallback: string, deps: readonly unknown[]) {
  const [value, setValue] = useState(fallback);

  useLayoutEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    setValue(v || fallback);
  }, deps);

  return value;
}
