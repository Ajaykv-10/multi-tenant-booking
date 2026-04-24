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
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
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

  // Fetch availability when date changes (for EVENT or HOTEL)
  useEffect(() => {
    if (status !== "authenticated" || !selectedDate || !resource) return;
    
    // For Hotel, we only fetch if endDate is also set and >= selectedDate
    if (resource.type === "HOTEL" && (!endDate || endDate < selectedDate)) {
      setSelectedSlot(null);
      return;
    }

    setIsFetchingSlots(true);
    setErrorMessage("");

    const url = resource.type === "HOTEL" 
      ? `/api/availability?resourceId=${resourceId}&date=${selectedDate}&endDate=${endDate}`
      : `/api/availability?resourceId=${resourceId}&date=${selectedDate}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.slots) {
          if (resource.type === "EVENT") {
            setSlots(data.slots);
            setSelectedSlot(null);
          } else {
            // For HOTEL, the API returns the single range slot
            const slot = data.slots[0];
            setSelectedSlot(slot?.available ? slot : null);
            if (slot && !slot.available) {
              setErrorMessage("The selected dates are unfortunately not available.");
            }
          }
        }
        setIsFetchingSlots(false);
      })
      .catch(() => setIsFetchingSlots(false));
  }, [resourceId, selectedDate, endDate, status, resource]);

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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {resource.type === "HOTEL" ? "1. Select Stay Dates" : "1. Select Date"}
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-500 mb-2">{resource.type === "HOTEL" ? "Check-in" : "Date"}</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {resource.type === "HOTEL" && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Check-out</label>
                    <input
                      type="date"
                      min={selectedDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {resource.type === "HOTEL" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  {isFetchingSlots ? (
                    <div className="flex items-center text-blue-600 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Checking availability...
                    </div>
                  ) : selectedSlot ? (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Great! These dates are available for your stay.
                    </div>
                  ) : !errorMessage && (
                    <div className="text-gray-500 text-sm italic">
                      Please select check-in and check-out dates.
                    </div>
                  )}
                </div>
              )}
            </div>

            {resource.type === "EVENT" && (
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
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingSummary
                resourceName={resource.name}
                resourceType={resource.type}
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
