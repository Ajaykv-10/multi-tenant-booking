"use client";

import { Modal } from "@/components/admin/modal";

interface DeleteConfirmPopoverProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmPopover({ open, onClose, onConfirm, isDeleting }: DeleteConfirmPopoverProps) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Field" maxWidth="sm">
      <div className="space-y-6">
        <p className="text-sm text-slate-600">
          Delete this field? Its value will also be removed permanently.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
