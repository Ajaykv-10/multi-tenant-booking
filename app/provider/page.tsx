"use client";

import { useState, useEffect } from "react";
import { StatsCard } from "@/components/provider/stats-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { PermissionGuard } from "@/components/PermissionGuard";

interface ProviderStats {
  providerName: string;
  totalResources: number;
  todayBookingsCount: number;
  upcomingBookingsCount: number;
  revenue: number;
  todaySchedule: Array<{
    id: string;
    start: string;
    end: string;
    status: "CONFIRMED" | "CANCELLED";
    user: { name: string | null; email: string };
    resource: { name: string };
  }>;
}

export default function ProviderDashboardPage() {
  const [data, setData] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/provider/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!data || (data as any).error) {
    return (
      <main className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          { (data as any)?.error || "Failed to load dashboard data. Please try again later." }
        </div>
      </main>
    );
  }

  return (
    <PermissionGuard module="dashboard" action="view">
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {data.providerName}</h1>
          <p className="text-slate-500 mt-1 text-sm">Here's an overview of your workspace today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Today's Bookings"
            value={data.todayBookingsCount}
            subtitle="Scheduled for today"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Upcoming"
            value={data.upcomingBookingsCount}
            subtitle="Bookings from tomorrow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatsCard
            title="Resources"
            value={data.totalResources}
            subtitle="Active resources"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${(data.revenue / 100).toFixed(0)}`}
            subtitle="All-time confirmed"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              Today's Schedule Preview
            </h2>
            <a href="/provider/bookings" className="text-sm font-medium text-violet-600 hover:text-violet-700">View Timeline →</a>
          </div>
          
          {data.todaySchedule?.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm">No bookings scheduled for today.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-medium">
                    <th className="px-6 py-3 text-left">Time</th>
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-left">Resource</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.todaySchedule?.map((booking) => {
                    const startStr = new Date(booking.start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                    const endStr = new Date(booking.end).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                    
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                          {startStr} - {endStr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-slate-900 font-medium">{booking.user.name ?? "—"}</p>
                          <p className="text-xs text-slate-500">{booking.user.email}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {booking.resource.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}
