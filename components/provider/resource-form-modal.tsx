"use client";

import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { useState, useEffect } from "react";

export interface Resource {
  id: string;
  name: string;
  duration: number;
  price: number;
  startTime: string;
  endTime: string;
  _count: { bookings: number };
}

interface ResourceFormModalProps {
  open: boolean;
  onClose: () => void;
  target: Resource | null;
  onSuccess: () => void;
}

export function ResourceFormModal({ open, onClose, target, onSuccess }: ResourceFormModalProps) {
  const isEdit = !!target;
  const [form, setForm] = useState({
    name: "",
    duration: "30",
    price: "0",
    startTime: "09:00",
    endTime: "17:00",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (target) {
        setForm({
          name: target.name,
          duration: target.duration.toString(),
          price: (target.price / 100).toString(),
          startTime: target.startTime,
          endTime: target.endTime,
        });
      } else {
        setForm({
          name: "",
          duration: "30",
          price: "0",
          startTime: "09:00",
          endTime: "17:00",
        });
      }
    }
  }, [open, target]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/provider/resources/${target.id}` : "/api/provider/resources";
      const method = isEdit ? "PATCH" : "POST";
      const priceInCents = Math.round(parseFloat(form.price) * 100);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
          price: priceInCents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save resource");
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Resource" : "Add Resource"} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <FormField label="Resource Name" htmlFor="res-name">
          <input id="res-name" type="text" required value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Dr. Smith / Conference Room A" className={inputClass} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Duration (minutes)" htmlFor="res-dur">
            <input id="res-dur" type="number" required min="1" value={form.duration}
              onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
              placeholder="30" className={inputClass} />
          </FormField>
          
          <FormField label="Price (₹)" htmlFor="res-price">
            <input id="res-price" type="number" required min="0" step="0.01" value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0" className={inputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Working Hours Start" htmlFor="res-start">
            <input id="res-start" type="time" required value={form.startTime}
              onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
              className={inputClass} />
          </FormField>

          <FormField label="Working Hours End" htmlFor="res-end">
            <input id="res-end" type="time" required value={form.endTime}
              onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
              className={inputClass} />
          </FormField>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition">
            {loading ? "Saving..." : "Save Resource"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
