"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, FormField, inputClass, selectClass } from "@/components/admin/modal";

interface Category { id: string; name: string; }
interface Owner { id: string; name: string | null; email: string; }
interface Provider {
  id: string;
  name: string;
  category: Category;
  owner: Owner;
  createdAt: string;
  _count: { users: number; resources: number; bookings: number };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: "", ownerId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Provider | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/providers");
    if (res.ok) setProviders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProviders();
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/users?role=PROVIDER").then((r) => r.json()).then(setOwners);
  }, [fetchProviders]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/providers/${editTarget.id}` : "/api/providers";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setModalOpen(false);
      setForm({ name: "", categoryId: "", ownerId: "" });
      setEditTarget(null);
      fetchProviders();
    } finally { setSubmitting(false); }
  }

  function openModal(prov?: Provider) {
    setError(null);
    if (prov) {
      setEditTarget(prov);
      setForm({ name: prov.name, categoryId: prov.category.id, ownerId: prov.owner.id });
    } else {
      setEditTarget(null);
      setForm({ name: "", categoryId: "", ownerId: "" });
    }
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this provider?")) return;
    setDeleteId(id);
    const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else fetchProviders();
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Providers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{providers.length} registered providers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Provider
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Provider", "Category", "Owner", "Stats", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : providers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No providers yet.</td></tr>
              ) : (
                providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{p.owner.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{p.owner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span>{p._count.resources} resources</span>
                        <span>{p._count.bookings} bookings</span>
                        <span>{p._count.users} staff</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <button
                        onClick={() => openModal(p)}
                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteId === p.id || p._count.bookings > 0 || p._count.resources > 0 || p._count.users > 0}
                        title={p._count.bookings > 0 || p._count.resources > 0 || p._count.users > 0 ? "Cannot delete — has related data" : "Delete"}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleteId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Provider" : "Add Provider"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>}
          <FormField label="Provider Name" htmlFor="prov-name">
            <input id="prov-name" type="text" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. AlexFit Gym" className={inputClass} />
          </FormField>
          <FormField label="Category" htmlFor="prov-cat">
            <select id="prov-cat" required value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className={selectClass}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Owner (Provider user)" htmlFor="prov-owner">
            <select id="prov-owner" required value={form.ownerId}
              onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
              className={selectClass}>
              <option value="">Select an owner</option>
              {owners.map((u) => <option key={u.id} value={u.id}>{u.name ?? u.email} — {u.email}</option>)}
            </select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              {submitting ? "Saving..." : editTarget ? "Save Changes" : "Create Provider"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
