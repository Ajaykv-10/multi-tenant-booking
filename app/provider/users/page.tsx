"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, FormField, inputClass, selectClass } from "@/components/admin/modal";
import { StatusBadge } from "@/components/admin/status-badge";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionGuard } from "@/components/PermissionGuard";

interface Role { id: string; name: string; scope: "ADMIN" | "PROVIDER"; }
interface User {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "PROVIDER" | "CUSTOMER";
  createdAt: string;
  accessRole: Role | null;
}

export default function ProviderUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const { can } = usePermissions();

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    roleId: "",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/users?role=PROVIDER");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  const fetchRoles = useCallback(async () => {
    const res = await fetch("/api/admin/roles?scope=PROVIDER");
    if (res.ok) setRoles(await res.json());
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  function openModal(user: User | null = null) {
    if (user) {
      setEditTarget(user);
      setForm({
        email: user.email,
        password: "", // Keep empty for edit
        name: user.name || "",
        roleId: user.accessRole?.id || "",
      });
    } else {
      setEditTarget(null);
      setForm({ email: "", password: "", name: "", roleId: "" });
    }
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editTarget ? `/api/users/${editTarget.id}` : "/api/users";
      const method = editTarget ? "PATCH" : "POST";
      const body = { ...form, role: "PROVIDER" };
      if (editTarget && !body.password) delete (body as any).password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save user");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <PermissionGuard module="users" action="view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Staff Members</h1>
            <p className="text-sm text-slate-500 mt-0.5">{users.length} staff members</p>
          </div>
          {can("users", "create") && (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Add Staff Member
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["User", "Role", "Joined", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">No staff found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{u.name || "Unnamed User"}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-violet-600 uppercase px-1.5 py-0.5 bg-violet-50 rounded">
                              {u.accessRole?.name || "No Role"}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        {can("users", "edit") && (
                          <button onClick={() => openModal(u)} className="text-xs font-medium text-violet-600 hover:text-violet-800 transition">Edit</button>
                        )}
                        {can("users", "delete") && (
                          <button onClick={() => handleDelete(u.id)} disabled={deleteId === u.id} className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 transition">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Staff" : "Add Staff"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Full Name" htmlFor="staff-name">
              <input id="staff-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Email Address" htmlFor="staff-email">
              <input id="staff-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label={editTarget ? "New Password (Optional)" : "Password"} htmlFor="staff-pw">
              <input id="staff-pw" type="password" required={!editTarget} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Assign Role" htmlFor="staff-role">
              <select id="staff-role" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className={selectClass}>
                <option value="">— No Role (Default) —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </FormField>
            <button type="submit" disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-60">
              {submitting ? "Saving..." : "Save Staff Member"}
            </button>
          </form>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
