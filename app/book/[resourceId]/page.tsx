"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SlotPicker } from "@/components/SlotPicker";
import { BookingSummary } from "@/components/BookingSummary";
import Link from "next/link";

export default function BookResourcePage() {
  const { data: session, status } = useSession();
  const { resourceId } = useParams() as { resourceId: string };
  const router = useRouter();

  const [resource, setResource] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  
  const [isFetchingResource, setIsFetchingResource] = useState(true);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // AUTH CHECK
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: window.location.href });
    }
  }, [status]);

  // Fetch resource details
  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/resources/${resourceId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setResource(data);
          setIsFetchingResource(false);
        })
        .catch(() => setIsFetchingResource(false));
    }
  }, [resourceId, status]);

  // Fetch availability when date changes
  useEffect(() => {
    if (status !== "authenticated" || !selectedDate) return;
    
    setIsFetchingSlots(true);
    setSelectedSlot(null);
    setErrorMessage("");

    fetch(`/api/availability?resourceId=${resourceId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.slots) setSlots(data.slots);
        setIsFetchingSlots(false);
      })
      .catch(() => setIsFetchingSlots(false));
  }, [resourceId, selectedDate, status]);

  const handleConfirm = async () => {
    if (!selectedSlot || !resource) return;
    
    setIsBooking(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          start: selectedSlot.start,
          end: selectedSlot.end
        })
      });

      if (res.ok) {
        router.push("/booking/success");
      } else {
        const error = await res.json();
        setErrorMessage(error.error || "Failed to create booking");
        setIsBooking(false);
        // Refresh availability
        fetch(`/api/availability?resourceId=${resourceId}&date=${selectedDate}`)
          .then(res => res.json())
          .then(data => {
            if (data.slots) setSlots(data.slots);
          });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred. Please try again.");
      setIsBooking(false);
    }
  };

  // Block UI while redirecting to login or checking auth
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isFetchingResource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Resource not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href={`/providers/${resource.providerId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Provider
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete your booking
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Select a convenient date and time to book {resource.name}.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg shadow-sm flex items-center transition-all">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 dark:text-red-400 font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">1. Select Date</h2>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                2. Select Time
                {isFetchingSlots && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
              </h2>
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                isLoading={isFetchingSlots}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSummary
                resourceName={resource.name}
                price={resource.price}
                duration={resource.duration}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onConfirm={handleConfirm}
                isBooking={isBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
