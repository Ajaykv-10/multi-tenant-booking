"use client";

import { useState, useEffect } from "react";
import { PermissionGuard } from "@/components/PermissionGuard";
import { FormField, inputClass } from "@/components/admin/modal";

interface ProviderProfile {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
  owner: { name: string | null; email: string };
}

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/provider")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch("/api/provider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded"></div>
      <div className="h-[400px] w-full bg-slate-100 rounded-2xl"></div>
    </div>;
  }

  return (
    <PermissionGuard module="provider" action="view">
      <main className="p-8 max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900">Provider Profile</h1>
          <p className="text-sm text-slate-500 mt-1 text-sm">Manage your business profile and settings</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            {message && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {message.text}
              </div>
            )}

            <FormField label="Business Name" htmlFor="profile-name">
              <input
                id="profile-name"
                type="text"
                value={profile?.name || ""}
                onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
                className={inputClass}
                placeholder="Business Name"
              />
            </FormField>

            <FormField label="Category" htmlFor="profile-cat">
              <input
                id="profile-cat"
                type="text"
                disabled
                value={profile?.category.name || ""}
                className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1 italic">Category can only be changed by platform administrators.</p>
            </FormField>

            <div className="pt-4 border-t border-slate-50">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Ownership Info</h3>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Owner Name" htmlFor="owner-name">
                        <input
                            id="owner-name"
                            type="text"
                            disabled
                            value={profile?.owner.name || "—"}
                            className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
                        />
                    </FormField>
                    <FormField label="Owner Email" htmlFor="owner-email">
                        <input
                            id="owner-email"
                            type="text"
                            disabled
                            value={profile?.owner.email || ""}
                            className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
                        />
                    </FormField>
                </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition shadow-sm disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </PermissionGuard>
  );
}
