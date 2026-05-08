"use client";

import { useState, useEffect } from "react";
import { Modal, FormField, inputClass } from "@/components/admin/modal";

interface EditFieldModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: any) => void;
  resourceId: string;
  field: any;
}

export function EditFieldModal({ open, onClose, onSave, resourceId, field }: EditFieldModalProps) {
  const [type, setType] = useState<"short_text" | "description">("short_text");
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && field) {
      setType(field.type);
      setLabel(field.label);
      setPlaceholder(field.placeholder || "");
      setIsRequired(field.isRequired);
      setError(null);
    }
  }, [open, field]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/provider/resources/${resourceId}/custom-fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          type,
          placeholder: placeholder.trim(),
          isRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to edit field");
      } else {
        onSave(data);
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const isChangingToShortText = field?.type === "description" && type === "short_text";
  const willTruncate = isChangingToShortText && field?.value && field.value.length > 120;

  return (
    <Modal open={open} onClose={onClose} title="Edit Custom Field" maxWidth="md">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Field Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("short_text")}
              className={`flex items-start p-3 border rounded-xl text-left transition ${
                type === "short_text"
                  ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className={`mt-0.5 mr-3 flex-shrink-0 ${type === "short_text" ? "text-violet-600" : "text-slate-400"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-medium ${type === "short_text" ? "text-violet-900" : "text-slate-900"}`}>Short text</div>
                <div className={`text-xs mt-0.5 ${type === "short_text" ? "text-violet-700" : "text-slate-500"}`}>One line, up to 120 characters</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType("description")}
              className={`flex items-start p-3 border rounded-xl text-left transition ${
                type === "description"
                  ? "border-violet-600 bg-violet-50 ring-1 ring-violet-600"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className={`mt-0.5 mr-3 flex-shrink-0 ${type === "description" ? "text-violet-600" : "text-slate-400"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-medium ${type === "description" ? "text-violet-900" : "text-slate-900"}`}>Description</div>
                <div className={`text-xs mt-0.5 ${type === "description" ? "text-violet-700" : "text-slate-500"}`}>Multi-line, up to 500 characters</div>
              </div>
            </button>
          </div>
          {willTruncate && (
            <p className="text-amber-600 text-xs mt-2 font-medium">
              Warning: Changing to Short text will truncate your existing value to 120 characters.
            </p>
          )}
        </div>

        <FormField label="Field Label" htmlFor="edit-field-label">
          <input
            id="edit-field-label"
            type="text"
            required
            maxLength={100}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Placeholder (Optional)" htmlFor="edit-field-placeholder">
          <input
            id="edit-field-placeholder"
            type="text"
            maxLength={150}
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <div className="flex items-start gap-3 pt-2">
          <div className="flex items-center h-5 mt-0.5">
            <input
              id="edit-field-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="edit-field-required" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as required
            </label>
            <p className="text-xs text-slate-500">Must be filled before publishing</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !label.trim()}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
