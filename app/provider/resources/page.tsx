"use client";

import { useState, useEffect, useCallback } from "react";
import { ResourceFormModal, type Resource } from "@/components/provider/resource-form-modal";

export default function ProviderResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/provider/resources");
    if (res.ok) setResources(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  function openModal(res?: Resource) {
    setEditTarget(res || null);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    setDeleteId(id);
    const res = await fetch(`/api/provider/resources/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else fetchResources();
    setDeleteId(null);
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Resources</h1>
          <p className="text-sm text-slate-500 mt-0.5">{resources.length} total resources</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Resource
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-medium">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Working Hours</th>
                <th className="px-6 py-3 text-left">Bookings</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No resources created yet.</td></tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{res.name}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{res.duration} min</td>
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">₹{(res.price / 100).toFixed(0)}</td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                        {res.startTime} - {res.endTime}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {res._count.bookings}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(res)}
                        className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        disabled={deleteId === res.id || res._count.bookings > 0}
                        title={res._count.bookings > 0 ? "Cannot delete — has bookings" : "Delete"}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deleteId === res.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ResourceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        target={editTarget}
        onSuccess={() => {
          setModalOpen(false);
          fetchResources();
        }}
      />
    </main>
  );
}
