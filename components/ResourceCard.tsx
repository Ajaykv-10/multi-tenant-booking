import Link from "next/link";
import { memo } from "react";

interface ResourceCardProps {
  id: string;
  name: string;
  duration: number;
  price: number;
  startTime?: string;
  endTime?: string;
}

export const ResourceCard = memo(function ResourceCard({ id, name, duration, price, startTime, endTime }: ResourceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duration} mins
        </div>
        <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ${price?.toFixed(2)}
        </div>
        {startTime && endTime && (
          <div className="flex items-center w-full mt-2">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Available: {startTime} - {endTime}
          </div>
        )}
      </div>
      <Link 
        href={`/resources/${id}`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors duration-200"
      >
        View Details
      </Link>
    </div>
  );
});
