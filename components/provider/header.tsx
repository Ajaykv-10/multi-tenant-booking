"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { name, email, image } = session?.user ?? {};
  const displayName = name ?? email ?? "Provider";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-800">Workspace</h2>
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-violet-100 flex items-center justify-center shrink-0 border border-violet-200">
            {image ? (
              <Image src={image} alt={displayName} width={32} height={32} className="object-cover" />
            ) : (
              <span className="text-xs font-bold text-violet-700">{initials}</span>
            )}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[150px] truncate">
            {displayName}
          </span>
          <svg className="w-4 h-4 text-slate-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
