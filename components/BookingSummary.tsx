import { memo } from "react";

interface BookingSummaryProps {
  resourceName: string;
  resourceType?: "EVENT" | "HOTEL";
  price: number;
  duration: number;
  selectedDate: string;
  selectedSlot: { start: string; end: string } | null;
  onConfirm: () => void;
  isBooking: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

export const BookingSummary = memo(function BookingSummary({
  resourceName,
  resourceType = "EVENT",
  price,
  duration,
  selectedDate,
  selectedSlot,
  onConfirm,
  isBooking,
  checkInTime,
  checkOutTime
}: BookingSummaryProps) {
  const isHotel = resourceType === "HOTEL";
  
  const formatTo12Hour = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  let numDays = 1;
  if (isHotel && selectedSlot) {
    const start = new Date(selectedSlot.start.split('T')[0]);
    const end = new Date(selectedSlot.end.split('T')[0]);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start/end
  }

  const totalPrice = isHotel ? price * numDays : price;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Booking Summary</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Resource</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{resourceName}</span>
        </div>
        
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Date</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {selectedDate ? new Date(selectedDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Not selected'}
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">{isHotel ? 'Date Range' : duration === 1440 ? 'Date Range' : 'Time'}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {selectedSlot 
              ? isHotel || duration === 1440
                ? `${new Date(selectedSlot.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(selectedSlot.end).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                : `${new Date(selectedSlot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
              : 'Not selected'}
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-500 dark:text-gray-400">Duration</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {isHotel ? `${numDays} Days` : duration === 1440 ? '1 Day' : `${duration} mins`}
          </span>
        </div>

        {isHotel && checkInTime && checkOutTime && (
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Check-in</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatTo12Hour(checkInTime)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Check-out</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatTo12Hour(checkOutTime)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            ${(totalPrice / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedSlot || isBooking}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          !selectedSlot
             ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
             : isBooking 
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] text-white'
        }`}
      >
        {isBooking ? 'Processing...' : 'Confirm Booking'}
      </button>
    </div>
  );
});
