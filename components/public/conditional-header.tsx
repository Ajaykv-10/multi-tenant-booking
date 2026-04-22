"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/public/site-header";

/**
 * Renders the public SiteHeader on all non-admin routes.
 * Admin pages use their own dedicated sidebar + header layout.
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }
  return <SiteHeader />;
}
