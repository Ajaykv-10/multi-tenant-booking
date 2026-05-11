"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField, inputClass } from "@/components/admin/modal";
import { PROVIDER_MODULES } from "@/lib/permissions";

const ACTIONS = ["view", "create", "edit", "delete"] as const;

export default function CreateProviderRolePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    scope: "PROVIDER" as const,
    permissions: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules = PROVIDER_MODULES;

  function togglePermission(mod: string, act: string) {
    const perm = `${mod}.${act}`;
    let newPermissions = [...form.permissions];

    if (newPermissions.includes(perm)) {
      newPermissions = newPermissions.filter((p) => p !== perm);
      if (act === "view") {
        newPermissions = newPermissions.filter((p) => !p.startsWith(`${mod}.`));
      }
    } else {
      newPermissions.push(perm);
      if (act !== "view" && !newPermissions.includes(`${mod}.view`)) {
        newPermissions.push(`${mod}.view`);
      }
    }
    setForm({ ...form, permissions: newPermissions });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create role");
        return;
      }

      router.push("/provider/roles");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/provider/roles"
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create Staff Role</h1>
          <p className="text-sm text-slate-500 mt-0.5">Define permissions for your team members</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <FormField label="Role Name" htmlFor="role-name">
            <input 
              id="role-name" 
              required 
              type="text" 
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Booking Manager" 
              className={inputClass} 
            />
          </FormField>

          <FormField label="Description (Optional)" htmlFor="role-desc">
            <textarea 
              id="role-desc" 
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what this role is for..." 
              className={inputClass} 
            />
          </FormField>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900">Permission Matrix</h2>
            <p className="text-xs text-slate-500">Only showing modules relevant to your provider portal</p>
          </div>
          
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold text-slate-700">Module</th>
                {ACTIONS.map(act => (
                  <th key={act} className="text-center px-4 py-3 font-semibold text-slate-700 capitalize">{act}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {modules.map((mod) => (
                <tr key={mod} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 capitalize">{mod.replace("_", " ")}</td>
                  {ACTIONS.map(act => {
                    const isChecked = form.permissions.includes(`${mod}.${act}`);
                    return (
                      <td key={act} className="px-4 py-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(mod, act)}
                          className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 transition cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/provider/roles"
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-3 rounded-xl transition text-center shadow-sm"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={submitting}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-sm px-4 py-3 rounded-xl transition shadow-sm"
          >
            {submitting ? "Creating..." : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
}
