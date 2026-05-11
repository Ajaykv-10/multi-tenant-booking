"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { PermissionGuard } from "@/components/PermissionGuard";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/roles?scope=PROVIDER");
    if (res.ok) setRoles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
      if (res.ok) fetchRoles();
      else {
          const data = await res.json();
          alert(data.error || "Failed to delete role");
      }
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <PermissionGuard module="roles" action="view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Staff Roles</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage permissions for your team members</p>
          </div>
          <Link
            href="/provider/roles/create"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Role
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Role Name", "Permissions", "Users", "Created", "Actions"].map((h) => (
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
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{role.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="font-medium text-slate-900">{role.permissions.length}</span>
                        <span className="text-xs text-slate-400 ml-1">actions</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                         {role._count.users}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(role.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/provider/roles/${role.id}/edit`}
                            className={`flex items-center gap-1 text-xs font-medium ${role.isSystem ? 'text-slate-400' : 'text-violet-600 hover:text-violet-800'} transition`}
                          >
                            {role.isSystem ? "View" : "Edit"}
                          </Link>
                          {!role.isSystem && (
                            <button 
                              onClick={() => handleDelete(role.id)} 
                              disabled={deleteId === role.id}
                              className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 transition"
                            >
                              {deleteId === role.id ? "..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
