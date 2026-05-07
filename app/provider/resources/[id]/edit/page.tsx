"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FormField, inputClass } from "@/components/admin/modal";
import { CustomFieldsSection } from "@/components/provider/custom-fields/CustomFieldsSection";

export default function ResourceEditorPage() {
  const { id } = useParams() as { id: string };
  const isNew = id === "new";
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "EVENT" as "EVENT" | "HOTEL",
    duration: "30",
    price: "0",
    startTime: "09:00",
    endTime: "17:00",
    capacity: "1",
    isGroupBookingEnabled: false,
    maxBookingPerUser: "",
  });

  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishErrorIds, setPublishErrorIds] = useState<string[]>([]);
  const [savedResource, setSavedResource] = useState<any>(null);

  const resourceId = isNew ? (savedResource?.id || null) : id;

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/provider/resources/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setForm({
              name: data.name,
              type: data.type,
              duration: data.duration.toString(),
              price: (data.price / 100).toString(),
              startTime: data.startTime,
              endTime: data.endTime,
              capacity: data.capacity?.toString() || "1",
              isGroupBookingEnabled: data.isGroupBookingEnabled || false,
              maxBookingPerUser: data.maxBookingPerUser?.toString() || "",
            });
            setStatus(data.status || "DRAFT");
            setSavedResource(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load resource");
          setLoading(false);
        });
    }
  }, [id, isNew]);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = resourceId ? `/api/provider/resources/${resourceId}` : "/api/provider/resources";
      const method = resourceId ? "PATCH" : "POST";
      const priceInCents = Math.round(parseFloat(form.price) * 100);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
          price: priceInCents,
          capacity: parseInt(form.capacity) || 1,
          maxBookingPerUser: form.maxBookingPerUser ? parseInt(form.maxBookingPerUser) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save resource");
        setSaving(false);
        return null;
      }

      setSavedResource(data);
      setSaving(false);
      
      // If this was a new resource, update the URL without refreshing
      if (isNew && !resourceId) {
        router.replace(`/provider/resources/${data.id}/edit`);
      }
      
      return data;
    } catch (err) {
      setError("An unexpected error occurred");
      setSaving(false);
      return null;
    }
  }

  async function handlePublish() {
    // First, save any pending form changes
    const saved = await handleSave();
    if (!saved) return;
    
    const targetId = saved.id;
    setPublishing(true);
    setPublishErrorIds([]);
    setError(null);

    try {
      const res = await fetch(`/api/provider/resources/${targetId}/publish`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "required_custom_fields_incomplete") {
          setPublishErrorIds(data.fields);
          // Scroll to custom fields section
          document.getElementById('custom-fields-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          setError(data.error || "Failed to publish resource");
        }
      } else {
        setStatus("PUBLISHED");
      }
    } catch (err) {
      setError("An unexpected error occurred during publish");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return <div className="p-8 max-w-3xl mx-auto w-full text-center text-slate-500">Loading resource...</div>;
  }

  return (
    <main className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-500">
            <Link href="/provider/resources" className="hover:text-violet-600 transition">Resources</Link>
            <span>/</span>
            <span>{isNew ? "New Resource" : "Edit Resource"}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {form.name || "Untitled Resource"}
            {!isNew && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {status}
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSave} className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Resource Name" htmlFor="res-name">
                <input id="res-name" type="text" required value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Dr. Smith / Conference Room A" className={inputClass} />
              </FormField>

              <FormField label="Booking Type" htmlFor="res-type">
                <select 
                  id="res-type" 
                  value={form.type} 
                  onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
                  className={inputClass}
                >
                  <option value="EVENT">Event (Minute-based slots)</option>
                  <option value="HOTEL">Hotel (Date-range booking)</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {form.type === "EVENT" ? (
                <FormField label="Duration (minutes)" htmlFor="res-dur">
                  <input id="res-dur" type="number" required min="1" value={form.duration}
                    onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="30" className={inputClass} />
                </FormField>
              ) : (
                <div className="flex items-end pb-3 text-sm text-slate-500 italic">
                  Duration is determined by customer selection.
                </div>
              )}
              
              <FormField label={`Price (${form.type === "HOTEL" ? "₹ / day" : "₹"})`} htmlFor="res-price">
                <input id="res-price" type="number" required min="0" step="0.01" value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0" className={inputClass} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label={form.type === "HOTEL" ? "Check-in Time" : "Working Hours Start"} htmlFor="res-start">
                <input id="res-start" type="time" required value={form.startTime}
                  onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className={inputClass} />
              </FormField>

              <FormField label={form.type === "HOTEL" ? "Check-out Time" : "Working Hours End"} htmlFor="res-end">
                <input id="res-end" type="time" required value={form.endTime}
                  onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className={inputClass} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Capacity (Total Seats/Rooms)" htmlFor="res-cap">
                <input id="res-cap" type="number" required min="1" value={form.capacity}
                  onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))}
                  placeholder="1" className={inputClass} />
              </FormField>

              <FormField label="Max Bookings Per User (Optional)" htmlFor="res-max">
                <input id="res-max" type="number" min="1" value={form.maxBookingPerUser}
                  onChange={(e) => setForm(f => ({ ...f, maxBookingPerUser: e.target.value }))}
                  placeholder="Unlimited" className={inputClass} />
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                id="res-group"
                type="checkbox"
                checked={form.isGroupBookingEnabled}
                onChange={(e) => setForm(f => ({ ...f, isGroupBookingEnabled: e.target.checked }))}
                className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
              />
              <label htmlFor="res-group" className="text-sm font-medium text-slate-700 cursor-pointer">
                Enable Group Bookings (Collect details per participant)
              </label>
            </div>
          </div>

          <div id="custom-fields-section">
            <CustomFieldsSection 
              resourceId={resourceId} 
              publishErrorIds={publishErrorIds} 
            />
          </div>

          <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10">
            <Link 
              href="/provider/resources"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition text-center"
            >
              Cancel
            </Link>
            
            <div className="flex-1 flex justify-end gap-3">
              <button 
                type="submit" 
                disabled={saving || publishing}
                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              
              <button 
                type="button" 
                onClick={handlePublish}
                disabled={saving || publishing || status === "PUBLISHED"}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl transition shadow-sm"
              >
                {publishing ? "Publishing..." : status === "PUBLISHED" ? "Published" : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
