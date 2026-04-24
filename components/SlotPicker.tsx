import { memo } from "react";

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

interface SlotPickerProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
  isLoading?: boolean;
}

export const SlotPicker = memo(function SlotPicker({ slots, selectedSlot, onSelectSlot, isLoading }: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No slots available for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.start === slot.start;
        const durationMins = (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000;
        const isOneDay = durationMins === 1440;
        
        let displayString;
        if (isOneDay) {
          const startDate = new Date(slot.start).toLocaleDateString([], { month: 'short', day: 'numeric' });
          const endDate = new Date(slot.end).toLocaleDateString([], { month: 'short', day: 'numeric' });
          displayString = `${startDate} - ${endDate}`;
        } else {
          displayString = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        return (
          <button
            key={slot.start}
            disabled={!slot.available}
            onClick={() => onSelectSlot(slot)}
            className={`
              py-3 px-4 rounded-xl text-center font-medium transition-all duration-200 border
              ${!slot.available 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed' 
                : isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]'
                  : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 hover:border-blue-600 hover:shadow-sm'
              }
            `}
          >
            {displayString}
          </button>
        );
      })}
    </div>
  );
});
