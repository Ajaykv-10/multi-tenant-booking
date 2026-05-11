"use client";

import { usePermissions } from "@/context/PermissionContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PermissionGuardProps {
  module: string;
  action?: string;
  children: React.ReactNode;
}

export function PermissionGuard({ module, action = "view", children }: PermissionGuardProps) {
  const { can, loading } = usePermissions();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!can(module, action)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v6m-5 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm leading-relaxed">
          Your account does not have the <span className="font-semibold text-slate-700">{action}</span> permission for the <span className="font-semibold text-slate-700">{module}</span> module.
        </p>
        <div className="flex items-center gap-4 mt-8">
            <Link 
                href={isAdmin ? "/admin" : "/provider"} 
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl transition shadow-sm"
            >
                Return to Dashboard
            </Link>
            <button 
                onClick={() => window.location.reload()} 
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2"
            >
                Retry
            </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
