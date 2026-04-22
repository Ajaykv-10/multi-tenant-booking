"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-9 w-28 rounded-xl bg-slate-200" />
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
        Sign In
      </Link>
    );
  }

  // ── Logged in ─────────────────────────────────────────────────────────────
  const { name, email, image } = session.user ?? {};
  const displayName = name ?? email ?? "Account";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center shrink-0">
          {image ? (
            <Image
              src={image}
              alt={displayName}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xs font-bold text-indigo-600">{initials}</span>
          )}
        </div>

        {/* Name — hidden on mobile */}
        <span className="hidden sm:block text-sm font-medium text-slate-800 max-w-[120px] truncate">
          {displayName}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
            {name && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
            )}
          </div>

          {/* My Bookings */}
          <Link
            href="/my-bookings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            My Bookings
          </Link>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
