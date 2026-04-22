"use client";

import { useState } from "react";
import type { BookingData } from "./booking-detail-modal";

interface Resource {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
}

export function BookingTimeline({
  resources,
  bookings,
  onBookingClick,
}: {
  resources: Resource[];
  bookings: BookingData[];
  onBookingClick: (b: BookingData) => void;
}) {
  // Determine timeline bounds. Let's use 08:00 to 20:00 as a default standard bounding,
  // or dynamically find min/max. We'll stick to a fixed 8 AM to 8 PM for simplicity of layout.
  const TIMELINE_START_HOUR = 8;
  const TIMELINE_END_HOUR = 20;

  const totalHours = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

  // Generate an array of hour labels
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => {
    const h = TIMELINE_START_HOUR + i;
    return `${h.toString().padStart(2, "0")}:00`;
  });

  // Helper to convert an ISO Datetime to minutes from start of our timeline
  function getOffsetMinutes(dateIso: string) {
    const d = new Date(dateIso);
    const h = d.getHours();
    const m = d.getMinutes();
    
    // Total minutes since 00:00
    const absoluteMins = h * 60 + m;
    // Minutes since our timeline start
    return absoluteMins - (TIMELINE_START_HOUR * 60);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header Row: Resources column header + Time marks */}
      <div className="flex border-b border-slate-200 bg-slate-50 relative">
        {/* Frozen Left Column Header */}
        <div className="w-48 shrink-0 border-r border-slate-200 py-3 px-4 sticky left-0 bg-slate-50 z-20 flex items-center shadow-[1px_0_0_0_#e2e8f0]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resources</span>
        </div>
        
        {/* Time Scale */}
        <div className="flex-1 overflow-x-auto relative min-w-[800px] select-none scrollbar-hide py-3">
          <div className="relative w-full h-full flex" style={{ minWidth: "1200px" }}>
            {hours.map((hour, i) => (
              <div 
                key={hour} 
                className="absolute top-0 flex flex-col items-center -ml-4"
                style={{ left: `${(i / totalHours) * 100}%` }}
              >
                <span className="text-xs font-semibold text-slate-400">{hour}</span>
                {/* Tick mark */}
                <span className="w-[1px] h-2 bg-slate-300 mt-1 block border-t"></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto">
        {resources.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No resources available.</div>
        ) : (
          resources.map((resource) => {
            // Filter bookings for this exact resource
            const rowBookings = bookings.filter((b) => b.resource.id === resource.id);

            return (
              <div key={resource.id} className="flex border-b border-slate-100 last:border-none relative group min-h-[5rem]">
                
                {/* Frozen Resource Name Panel */}
                <div className="w-48 shrink-0 border-r border-slate-200 py-4 px-4 sticky left-0 bg-white z-20 group-hover:bg-slate-50/50 transition-colors flex flex-col justify-center shadow-[1px_0_0_0_#e2e8f0]">
                  <p className="font-semibold text-slate-800 text-sm">{resource.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{resource.startTime} - {resource.endTime}</p>
                </div>

                {/* Timeline Row (Scrollable) */}
                <div className="flex-1 overflow-x-auto relative min-w-[800px]">
                  <div className="relative w-full h-full bg-grid-pattern" style={{ minWidth: "1200px", backgroundSize: `${100/totalHours}% 100%`, backgroundImage: "linear-gradient(to right, #f8fafc 1px, transparent 1px)" }}>
                    
                    {rowBookings.map((booking) => {
                      const startMins = getOffsetMinutes(booking.start);
                      const endMins = getOffsetMinutes(booking.end);
                      const durationMins = endMins - startMins;

                      // Width in %
                      const leftPercent = (startMins / (totalHours * 60)) * 100;
                      const widthPercent = (durationMins / (totalHours * 60)) * 100;

                      // Skip rendering if completely out of bounds safely
                      if (leftPercent > 100 || leftPercent + widthPercent < 0) return null;

                      // UI Styles based on status
                      const isConfirmed = booking.status === "CONFIRMED";
                      const bgClass = isConfirmed ? "bg-violet-100 border-violet-300 hover:bg-violet-200 hover:border-violet-400" : "bg-slate-100 border-slate-200 text-slate-500 opacity-60";
                      const textClass = isConfirmed ? "text-violet-900" : "text-slate-500 line-through";

                      return (
                        <div
                          key={booking.id}
                          onClick={() => onBookingClick(booking)}
                          className={`absolute top-1/2 -translate-y-1/2 h-14 rounded-lg border flex flex-col justify-center px-3 cursor-pointer transition shadow-sm overflow-hidden whitespace-nowrap ${bgClass}`}
                          style={{
                            left: `${Math.max(0, leftPercent)}%`,
                            width: `${Math.min(100 - leftPercent, widthPercent)}%`, // constrain to view
                          }}
                        >
                          <p className={`text-xs font-bold truncate ${textClass}`}>
                            {booking.user.name || "Customer"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {new Date(booking.start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
