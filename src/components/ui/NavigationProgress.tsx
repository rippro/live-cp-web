"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(false);

  // Hide spinner when navigation completes (pathname settled)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setLoading(false);
  }, [pathname]);

  // Show spinner on internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a?.href) return;
      try {
        const url = new URL(a.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === pathname) return;
        setLoading(true);
      } catch {
        // invalid URL, skip
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-none">
      <div className="w-7 h-7 rounded-full border-2 border-rp-border border-t-rp-accent animate-spin" />
    </div>
  );
}
