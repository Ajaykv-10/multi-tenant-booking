"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FieldCard } from "./FieldCard";

interface SortableFieldListProps {
  fields: any[];
  resourceId: string;
  onReorder: (newFields: any[]) => void;
  onUpdate: (field: any) => void;
  onDelete: (id: string) => void;
  publishErrorIds: string[];
}

export function SortableFieldList({
  fields,
  resourceId,
  onReorder,
  onUpdate,
  onDelete,
  publishErrorIds,
}: SortableFieldListProps) {
  const [errorToast, setErrorToast] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      
      const newFieldsList = arrayMove(fields, oldIndex, newIndex);
      
      // Update order property for each field based on new position
      const reorderedFields = newFieldsList.map((f, index) => ({
        ...f,
        order: index,
      }));
      
      // Optimistic UI update
      onReorder(reorderedFields);

      // Backend call
      try {
        const orderPayload = reorderedFields.map(f => ({ id: f.id, order: f.order }));
        const res = await fetch(`/api/provider/resources/${resourceId}/custom-fields/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: orderPayload }),
        });

        if (!res.ok) throw new Error("Reorder failed");
        
      } catch (err) {
        console.error(err);
        setErrorToast("Failed to save field order");
        // Revert on failure
        onReorder(fields);
        setTimeout(() => setErrorToast(null), 3000);
      }
    }
  }

  return (
    <div className="relative">
      {errorToast && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg z-50">
          {errorToast}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.filter(f => f && f.id).map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {fields.filter(f => f && f.id).map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                resourceId={resourceId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                publishError={publishErrorIds?.includes(field.label)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
