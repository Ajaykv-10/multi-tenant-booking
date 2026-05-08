import React from 'react';

interface SeatSelectorProps {
  seatsSelected: number;
  setSeatsSelected: (seats: number) => void;
  availableSeats: number;
  maxBookingPerUser?: number;
}

export function SeatSelector({
  seatsSelected,
  setSeatsSelected,
  availableSeats,
  maxBookingPerUser,
}: SeatSelectorProps) {
  const maxAllowed = maxBookingPerUser ? Math.min(availableSeats, maxBookingPerUser) : availableSeats;

  const handleIncrement = () => {
    if (seatsSelected < maxAllowed) {
      setSeatsSelected(seatsSelected + 1);
    }
  };

  const handleDecrement = () => {
    if (seatsSelected > 1) {
      setSeatsSelected(seatsSelected - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Seats</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-300">How many seats do you need?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {availableSeats} / {availableSeats} seats available
          </p>
          {maxBookingPerUser && (
            <p className="text-xs text-blue-500 mt-1">
              Max {maxBookingPerUser} per booking.
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDecrement}
            disabled={seatsSelected <= 1}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="text-xl font-bold text-gray-900 dark:text-white w-8 text-center">
            {seatsSelected}
          </span>
          
          <button
            onClick={handleIncrement}
            disabled={seatsSelected >= maxAllowed}
            className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 disabled:opacity-50 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {seatsSelected >= maxAllowed && maxAllowed > 0 && (
        <p className="text-sm text-amber-500 mt-4 text-right">
          Maximum allowed seats reached.
        </p>
      )}
    </div>
  );
}
