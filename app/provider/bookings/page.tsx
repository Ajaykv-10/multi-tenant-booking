"use client";

import { useState, useEffect, useCallback } from "react";
import { BookingTimeline } from "@/components/provider/booking-timeline";
import { BookingDetailModal, type BookingData } from "@/components/provider/booking-detail-modal";

interface Resource {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export default function ProviderBookingsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize selected date to today (YYYY-MM-DD local timezone)
  const todayLocal = new Date();
  const offset = todayLocal.getTimezoneOffset()
  const todayStr = new Date(todayLocal.getTime() - (offset*60*1000)).toISOString().split('T')[0]

  const [date, setDate] = useState(todayStr);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch resources once
    fetch("/api/provider/resources")
      .then((res) => res.json())
      .then((data) => setResources(data));
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    const res = await fetch(`/api/provider/bookings?date=${date}`);
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function handleBookingClick(b: BookingData) {
    setSelectedBooking(b);
    setModalOpen(true);
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    const res = await fetch(`/api/provider/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    const data = await res.json();
    if (!res.ok) alert(data.error);
    else {
      // Update local state without refetching immediately
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      }
    }
    setCancellingId(null);
  }

  return (
    <main className="p-8 max-w-[1600px] w-full flex flex-col flex-1 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your daily appointments vertically</p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="date-picker" className="text-sm font-medium text-slate-600">Date:</label>
          <input
            id="date-picker"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* The Timeline takes remaining height */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-40 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        )}
        
        <BookingTimeline
          resources={resources}
          bookings={bookings}
          onBookingClick={handleBookingClick}
        />
      </div>

      <BookingDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        booking={selectedBooking}
        onCancelTrigger={handleCancel}
        cancellingId={cancellingId}
      />
    </main>
  );
}
