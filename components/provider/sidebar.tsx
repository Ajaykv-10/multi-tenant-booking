"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { usePermissions } from "@/context/PermissionContext";

const menuItems = [
  { href: "/provider", label: "Dashboard", matchExact: true, module: "dashboard" },
  { href: "/provider/resources", label: "Resources", matchExact: false, module: "resources" },
  { href: "/provider/bookings", label: "Bookings", matchExact: false, module: "bookings" },
  { href: "/provider/roles", label: "Roles", matchExact: false, module: "roles" },
  { href: "/provider/users", label: "Users", matchExact: false, module: "users" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { can, loading } = usePermissions();

  if (loading) return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center justify-center z-20">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
    </aside>
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="font-bold text-white text-base tracking-tight truncate">
          Provider<span className="text-violet-400">Panel</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {menuItems
            .filter(item => can(item.module, "view"))
            .map((item) => {
              const isActive = item.matchExact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 w-full transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
