"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthButton } from "@/components/public/auth-button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/my-bookings", label: "My Bookings" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
              Booking<span className="text-indigo-600">Engine</span>
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side: Auth + Mobile toggle ─────────────────────────── */}
          <div className="flex items-center gap-3">
            <AuthButton />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ──────────────────────────────────────────────────── */}
        {mobileOpen && (
          <nav
            className="md:hidden py-3 pb-4 border-t border-slate-100 space-y-1"
            aria-label="Mobile navigation"
          >
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
