import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings — BookingEngine",
  description: "View and manage all your bookings",
};

export default function MyBookingsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1 text-sm">View and manage all your upcoming and past bookings.</p>
      </div>

      {/* Placeholder — booking list will go here */}
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-slate-800">No bookings yet</h2>
        <p className="text-slate-400 text-sm mt-1">When you book a service, it will appear here.</p>
        <a
          href="/categories"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-sm"
        >
          Browse Services
        </a>
      </div>
    </main>
  );
}
