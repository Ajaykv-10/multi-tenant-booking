import Link from "next/link";
import { memo } from "react";

interface ProviderCardProps {
  id: string;
  name: string;
  category: { name: string };
  counts: { resources: number };
}

export const ProviderCard = memo(function ProviderCard({ id, name, category, counts }: ProviderCardProps) {
  return (
    <Link href={`/providers/${id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            {category?.name || "Uncategorized"}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {counts?.resources || 0} resources
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mt-4">
          View Details
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </div>
    </Link>
  );
});
