import { useEffect } from "react";

/**
 * Inject JSON-LD structured data into the page head.
 * Cleans up on unmount.
 */
export function useJsonLd(data: Record<string, unknown>) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, [JSON.stringify(data)]);
}
