"use client";

import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeleteConfirmPopover } from "./DeleteConfirmPopover";
import { EditFieldModal } from "./EditFieldModal";

interface FieldCardProps {
  field: any;
  resourceId: string;
  onUpdate: (field: any) => void;
  onDelete: (id: string) => void;
  publishError?: boolean;
}

export function FieldCard({ field, resourceId, onUpdate, onDelete, publishError }: FieldCardProps) {
  const [value, setValue] = useState(field.value || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const valueRef = useRef(field.value || "");
  
  // Sortable setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  // Debounce auto-save
  useEffect(() => {
    if (value === valueRef.current) return;
    
    const timeoutId = setTimeout(() => {
      saveValue(value);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Sync prop value changes
  useEffect(() => {
    if (field.value !== valueRef.current) {
      setValue(field.value || "");
      valueRef.current = field.value || "";
    }
  }, [field.value]);

  async function saveValue(newValue: string) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/provider/resources/${resourceId}/custom-fields/${field.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      valueRef.current = newValue;
      setSaveStatus("saved");
      onUpdate(data);
      
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/provider/resources/${resourceId}/custom-fields/${field.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      onDelete(field.id);
    } catch (error) {
      console.error(error);
      alert("Failed to delete custom field");
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  }

  const maxLength = field.type === "short_text" ? 120 : 500;
  const isRequiredAndEmpty = publishError && (!value || value.trim() === "");

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style}
        className={`bg-white rounded-xl border ${isRequiredAndEmpty ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'} shadow-sm flex flex-col`}
      >
        {/* Definition Row */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl group">
          <div className="flex items-center gap-3">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 -ml-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            
            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
              field.type === 'short_text' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {field.type === 'short_text' ? 'Short Text' : 'Description'}
            </span>
            
            <h3 className="font-medium text-sm text-slate-900">{field.label}</h3>
            
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              field.isRequired 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              {field.isRequired ? 'Required' : 'Optional'}
            </span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition"
              title="Edit definition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
              title="Delete field"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Value Input */}
        <div className="p-4 bg-white rounded-b-xl">
          <div className="relative">
            {field.type === "short_text" ? (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={maxLength}
                placeholder={field.placeholder || ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={4}
                maxLength={maxLength}
                placeholder={field.placeholder || ""}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
              />
            )}
            
            <div className="flex justify-between items-center mt-2 px-1">
              <span className={`text-xs font-medium ${
                saveStatus === "saving" ? "text-amber-500" :
                saveStatus === "saved" ? "text-green-500" :
                saveStatus === "error" ? "text-red-500" : "text-transparent"
              }`}>
                {saveStatus === "saving" ? "Saving..." : 
                 saveStatus === "saved" ? "Saved" : 
                 saveStatus === "error" ? "Failed to save" : "Saved"}
              </span>
              
              <span className="text-xs text-slate-400 font-medium">
                {value.length} / {maxLength}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditFieldModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={onUpdate}
          resourceId={resourceId}
          field={field}
        />
      )}

      {showDelete && (
        <DeleteConfirmPopover
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
