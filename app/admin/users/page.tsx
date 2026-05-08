"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, FormField, inputClass, selectClass } from "@/components/admin/modal";
import { StatusBadge } from "@/components/admin/status-badge";
import { usePermissions } from "@/context/PermissionContext";

interface Role { id: string; name: string; scope: "ADMIN" | "PROVIDER"; }
interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "PROVIDER" | "CUSTOMER";
  roleId: string | null;
  accessRole: { name: string } | null;
  createdAt: string;
  provider: { id: string; name: string } | null;
  ownedProvider: { id: string; name: string } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "CUSTOMER", providerId: "", roleId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const { can } = usePermissions();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const url = roleFilter ? `/api/users?role=${roleFilter}` : "/api/users";
    const res = await fetch(url);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetch("/api/providers").then((r) => r.json()).then(setProviders); }, []);
  useEffect(() => { fetch("/api/admin/roles").then((r) => r.json()).then(setRoles); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/users/${editTarget.id}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";

      const payload = {
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        role: form.role,
        providerId: form.role === "PROVIDER" ? form.providerId || undefined : undefined,
        roleId: form.roleId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setModalOpen(false);
      setForm({ email: "", password: "", name: "", role: "CUSTOMER", providerId: "", roleId: "" });
      setEditTarget(null);
      fetchUsers();
    } finally { setSubmitting(false); }
  }

  function openModal(u?: User) {
    setError(null);
    if (u) {
      setEditTarget(u);
      setForm({
        email: u.email,
        password: "", // empty for edit
        name: u.name || "",
        role: u.role,
        roleId: u.roleId || "",
      });
    } else {
      setEditTarget(null);
      setForm({ email: "", password: "", name: "", role: "CUSTOMER", providerId: "", roleId: "" });
    }
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    setDeleteId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else fetchUsers();
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} users {roleFilter ? `(${roleFilter})` : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROVIDER">Provider</option>
            <option value="CUSTOMER">Customer</option>
          </select>
          {can("users", "create") && (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["User", "Role", "Provider", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{u.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={u.role} />
                        {u.accessRole && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded self-start">
                            {u.accessRole.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.ownedProvider?.name ? (
                        <span className="text-violet-600 font-medium">Owner: {u.ownedProvider.name}</span>
                      ) : u.provider?.name ? (
                        <span>Staff: {u.provider.name}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      {can("users", "edit") && (
                        <button
                          onClick={() => openModal(u)}
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      )}
                      {can("users", "delete") && (
                        <button onClick={() => handleDelete(u.id)} disabled={deleteId === u.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 transition">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleteId === u.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit User" : "Add User"} maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" htmlFor="usr-name">
              <input id="usr-name" type="text" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe" className={inputClass} />
            </FormField>
            <FormField label="Role" htmlFor="usr-role">
              <select id="usr-role" required value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, providerId: "" }))}
                className={selectClass}>
                <option value="ADMIN">Admin</option>
                <option value="PROVIDER">Provider</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </FormField>
          </div>
          {form.role !== "CUSTOMER" && (
            <FormField label={`Assign ${form.role} Role`} htmlFor="usr-access-role">
              <select id="usr-access-role" value={form.roleId}
                onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                className={selectClass}>
                <option value="">— No Role (Default) —</option>
                {roles.filter(r => r.scope === form.role).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </FormField>
          )}
          <FormField label="Email Address" htmlFor="usr-email">
            <input id="usr-email" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com" className={inputClass} />
          </FormField>
          <FormField label="Password" htmlFor="usr-pass">
            <input id="usr-pass" type="password" required={!editTarget} minLength={6} value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={editTarget ? "Leave blank to keep unchanged" : "Min. 6 characters"} className={inputClass} />
          </FormField>
          {form.role === "PROVIDER" && (
            <FormField label="Assign to Provider (as staff, optional)" htmlFor="usr-prov">
              <select id="usr-prov" value={form.providerId}
                onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value }))}
                className={selectClass}>
                <option value="">— No provider —</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              {submitting ? "Saving..." : editTarget ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
