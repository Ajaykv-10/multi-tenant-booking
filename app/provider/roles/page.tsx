"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";

interface Role {
  id: string;
  name: string;
  description: string | null;
  scope: "ADMIN" | "PROVIDER";
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  _count: {
    users: number;
    providers: number;
  };
}

export default function ProviderRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/roles?scope=PROVIDER");
    if (res.ok) setRoles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">View roles available for your staff members</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Role Name", "Description", "Permissions", "Usage", "Created"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading roles...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No roles found.</td></tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{role.name}</p>
                        {role.isSystem && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">System</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs">
                      {role.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-medium text-slate-900">{role.permissions.length}</span>
                      <span className="text-xs text-slate-400 ml-1">actions</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs text-center">
                       {role._count.users}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(role.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
