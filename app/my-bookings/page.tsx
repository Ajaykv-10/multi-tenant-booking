"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyBookingsPage() {
  const { status } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We rely on the API enforcing session.user.id internally for Customer
  const fetchBookings = () => {
    setIsLoading(true);
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setBookings(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const cancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert("Failed to cancel booking");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Not Signed In</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your bookings.</p>
          <Link href="/login" className="inline-block w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
          My Bookings
        </h1>

        {bookings.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {bookings.map((booking) => {
                const startDate = new Date(booking.start);
                const endDate = new Date(booking.end);
                const isPast = endDate.getTime() < Date.now();
                const canCancel = booking.status === "CONFIRMED" && !isPast;
                
                return (
                  <li key={booking.id} className="p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            booking.status === "CONFIRMED" 
                              ? isPast ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {booking.status === "CONFIRMED" ? (isPast ? "COMPLETED" : "CONFIRMED") : "CANCELLED"}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.provider.name}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                          {booking.resource.name}
                        </h3>
                        <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="mx-2">•</span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      <div className="md:text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          ${booking.resource.price.toFixed(2)}
                        </p>
                        {booking.invoiceNumber && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-mono">
                            {booking.invoiceNumber}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row md:flex-col gap-2 items-stretch sm:items-center md:items-end">
                          {booking.status === "CONFIRMED" && (
                            <a
                              href={`/api/bookings/${booking.id}/invoice`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-blue-200 dark:border-blue-800 text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download Invoice
                            </a>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="inline-flex items-center justify-center px-4 py-2 border border-red-200 dark:border-red-800 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              You haven't made any bookings. Browse our top providers and schedule your first appointment.
            </p>
            <Link 
              href="/providers"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Browse Providers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
