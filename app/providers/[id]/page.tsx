"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ResourceCard } from "@/components/ResourceCard";
import Link from "next/link";

export default function ProviderDetailsPage() {
  const { id } = useParams() as { id: string };
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resources?providerId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setResources(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/providers" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Providers
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Services Available
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Select a service to book an appointment
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                name={resource.name}
                duration={resource.duration}
                price={resource.price}
                startTime={resource.startTime}
                endTime={resource.endTime}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-gray-500 dark:text-gray-400 text-lg">No services listed yet for this provider.</div>
          </div>
        )}
      </div>
    </div>
  );
}
