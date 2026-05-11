"use client";

import { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Modal, FormField, inputClass, selectClass } from "@/components/admin/modal";
import { DownloadInvoiceButton } from "@/components/ui/download-invoice-button";


interface Category { id: string; name: string; }
interface Provider { id: string; name: string; }
interface Booking {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  start: string;
  end: string;
  createdAt: string;
  invoiceNumber: string | null;
  user: { id: string; name: string | null; email: string };
  provider: { id: string; name: string; category: { id: string; name: string } };
  resource: { id: string; name: string; price: number; duration: number };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Booking | null>(null);
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", status: "CONFIRMED" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("providers", providers)
  // Filters
  const [filters, setFilters] = useState({
    providerId: "",
    categoryId: "",
    status: "",
    from: "",
    to: "",
  });

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.providerId) params.set("providerId", filters.providerId);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return params.toString();
  }, [filters]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const qs = buildQuery();
    const res = await fetch(`/api/bookings${qs ? `?${qs}` : ""}`);
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }, [buildQuery]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch((err) => setError(err.error));
    fetch("/api/providers").then((r) => r.json()).then(setProviders).catch((err) => setError(err.error));
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setActionId(id);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else fetchBookings();
    setActionId(null);
  }

  function openEditModal(b: Booking) {
    setError(null);
    setEditTarget(b);

    // Convert to local date strings for inputs
    const startObj = new Date(b.start);
    const endObj = new Date(b.end);

    // Format YYYY-MM-DD for date input
    const [datePart] = startObj.toISOString().split("T");

    // Format HH:mm for time inputs using local time
    const startH = startObj.getHours().toString().padStart(2, "0");
    const startM = startObj.getMinutes().toString().padStart(2, "0");
    const endH = endObj.getHours().toString().padStart(2, "0");
    const endM = endObj.getMinutes().toString().padStart(2, "0");

    setForm({
      date: datePart,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      status: b.status,
    });
    setModalOpen(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;

    setError(null);
    setSubmitting(true);

    try {
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      const endDateTime = new Date(`${form.date}T${form.endTime}`);

      const res = await fetch(`/api/bookings/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setModalOpen(false);
      setEditTarget(null);
      fetchBookings();
    } catch (err) {
      setError("Failed to update booking. Please check the values.");
    } finally {
      setSubmitting(false);
    }
  }

  function clearFilters() {
    setFilters({ providerId: "", categoryId: "", status: "", from: "", to: "" });
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {bookings.length} result{bookings.length !== 1 ? "s" : ""}
            {hasFilters ? " (filtered)" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-indigo-600 hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <select value={filters.providerId}
            onChange={(e) => setFilters((f) => ({ ...f, providerId: e.target.value }))}
            className={selectClass}>
            <option value="">All providers</option>
            {(providers || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={filters.categoryId}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
            className={selectClass}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className={selectClass}>
            <option value="">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <input type="date" value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className={`${selectClass} text-slate-600`}
            placeholder="From date" />

          <input type="date" value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className={`${selectClass} text-slate-600`}
            placeholder="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Customer", "Provider", "Resource", "Date & Time", "Duration", "Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-slate-400 text-sm">No bookings match your filters</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="mt-2 text-xs text-indigo-600 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 whitespace-nowrap">{b.user.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{b.user.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800 whitespace-nowrap">{b.provider.name}</p>
                      <p className="text-xs text-slate-400">{b.provider.category.name}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{b.resource.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-slate-800">
                        {new Date(b.start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(b.start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(b.end).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{b.resource.duration} min</td>
                    <td className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap">
                      ₹{(b.resource.price / 100).toFixed(0)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(b)}
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        {b.status === "CONFIRMED" && (
                          <DownloadInvoiceButton
                            bookingId={b.id}
                            invoiceNumber={b.invoiceNumber}
                            variant="link"
                          />
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={actionId === b.id}
                            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40 transition whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {actionId === b.id ? "Cancelling..." : "Cancel"}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Booking">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status" htmlFor="book-stat">
              <select id="book-stat" required value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={selectClass}>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </FormField>

            <FormField label="Date" htmlFor="book-date">
              <input id="book-date" type="date" required value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Time" htmlFor="book-start">
              <input id="book-start" type="time" required value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className={inputClass} />
            </FormField>

            <FormField label="End Time" htmlFor="book-end">
              <input id="book-end" type="time" required value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className={inputClass} />
            </FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
