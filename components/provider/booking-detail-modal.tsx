"use client";

import { Modal } from "@/components/admin/modal";
import { StatusBadge } from "@/components/admin/status-badge";

export interface BookingData {
  id: string;
  start: string;
  end: string;
  status: "CONFIRMED" | "CANCELLED";
  user: { name: string | null; email: string };
  resource: { id: string; name: string; price: number; duration: number };
}

interface BookingDetailModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingData | null;
  onCancelTrigger: (id: string) => void;
  cancellingId: string | null;
}

export function BookingDetailModal({
  open,
  onClose,
  booking,
  onCancelTrigger,
  cancellingId,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const startStr = new Date(booking.start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const endStr = new Date(booking.end).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date(booking.start).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const isCancelling = cancellingId === booking.id;

  return (
    <Modal open={open} onClose={onClose} title="Booking Details" maxWidth="sm">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{booking.user.name || "Customer"}</h3>
            <p className="text-sm text-slate-500">{booking.user.email}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-medium text-slate-700">{booking.resource.name}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-slate-600">
              {dateStr}
              <br />
              <span className="font-medium text-slate-800">{startStr} - {endStr}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-slate-800">
              ₹{(booking.resource.price / 100).toFixed(0)} <span className="text-slate-400 font-normal">({booking.resource.duration} min)</span>
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {booking.status === "CONFIRMED" && (
            <button
              onClick={() => onCancelTrigger(booking.id)}
              disabled={isCancelling}
              className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl transition border border-red-200"
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition ${booking.status === "CANCELLED" ? "w-full" : ""}`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
