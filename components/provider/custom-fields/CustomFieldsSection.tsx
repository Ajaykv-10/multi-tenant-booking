"use client";

import { useState, useEffect } from "react";
import { AddFieldModal } from "./AddFieldModal";
import { SortableFieldList } from "./SortableFieldList";

interface CustomFieldsSectionProps {
  resourceId: string | null;
  publishErrorIds: string[];
}

export function CustomFieldsSection({ resourceId, publishErrorIds }: CustomFieldsSectionProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (resourceId) {
      fetchFields();
    } else {
      setLoading(false);
    }
  }, [resourceId]);

  async function fetchFields() {
    if (!resourceId) return;
    try {
      const res = await fetch(`/api/provider/resources/${resourceId}/custom-fields`);
      if (res.ok) {
        const data = await res.json();
        setFields(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFieldAdded(newField: any) {
    setFields((prev) => [...prev, newField]);
  }

  function handleFieldUpdated(updatedField: any) {
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
  }

  function handleFieldDeleted(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function handleReorder(newFields: any[]) {
    setFields(newFields);
  }

  return (
    <div className="pt-8 mt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Custom Fields</h2>
          <p className="text-sm text-slate-500 mt-1">
            Extra details collected from providers and shown to customers.
          </p>
        </div>
        
        <div className="group relative">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            disabled={!resourceId}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add field
          </button>
          
          {!resourceId && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Save the resource first to add custom fields.
            </div>
          )}
        </div>
      </div>

      {publishErrorIds.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-sm font-bold text-red-800">Publishing Blocked</h3>
            <p className="text-sm text-red-700 mt-1">
              The following required fields must be filled before publishing: {publishErrorIds.join(', ')}.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading custom fields...</div>
      ) : fields.length === 0 ? (
        <div className="py-12 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">No custom fields yet</h3>
          <p className="text-sm text-slate-500 max-w-[280px]">
            Add extra details that customers will see on your resource page.
          </p>
          {resourceId && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-6 text-sm font-semibold text-violet-600 hover:text-violet-700 transition"
            >
              + Add field
            </button>
          )}
        </div>
      ) : (
        <SortableFieldList
          fields={fields}
          resourceId={resourceId!}
          onReorder={handleReorder}
          onUpdate={handleFieldUpdated}
          onDelete={handleFieldDeleted}
          publishErrorIds={publishErrorIds}
        />
      )}

      {showAddModal && resourceId && (
        <AddFieldModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleFieldAdded}
          resourceId={resourceId}
          nextOrder={fields.length > 0 ? Math.max(...fields.map(f => f.order)) + 1 : 0}
        />
      )}
    </div>
  );
}
