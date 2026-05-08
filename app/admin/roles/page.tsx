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

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState("");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    const url = scopeFilter ? `/api/admin/roles?scope=${scopeFilter}` : "/api/admin/roles";
    const res = await fetch(url);
    if (res.ok) setRoles(await res.json());
    setLoading(false);
  }, [scopeFilter]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this role? This cannot be undone.")) return;
    
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to delete role");
      } else {
        fetchRoles();
      }
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage granular access control for Admins and Providers</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={scopeFilter} 
            onChange={(e) => setScopeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Scopes</option>
            <option value="ADMIN">Admin Only</option>
            <option value="PROVIDER">Provider Only</option>
          </select>
          <Link
            href="/admin/roles/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Role
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Role Name", "Scope", "Permissions", "Usage", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading roles...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No roles found.</td></tr>
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
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">{role.description || "No description"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={role.scope} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-medium text-slate-900">{role.permissions.length}</span>
                      <span className="text-xs text-slate-400 ml-1">actions</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex flex-col">
                        <span>Users: {role._count.users}</span>
                        <span>Providers: {role._count.providers}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(role.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/roles/${role.id}/edit`}
                          className={`flex items-center gap-1 text-xs font-medium ${role.isSystem ? 'text-slate-400' : 'text-indigo-600 hover:text-indigo-800'} transition`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {role.isSystem ? "View" : "Edit"}
                        </Link>
                        {!role.isSystem && (
                          <button 
                            onClick={() => handleDelete(role.id)} 
                            disabled={deleteId === role.id}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
  );
}
