import Link from "next/link";
import { MoreDetailsSection } from "@/components/public/MoreDetailsSection";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResourceDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, category: { select: { name: true } } }
      },
      customFields: {
        where: { value: { not: null } },
        orderBy: { order: "asc" }
      }
    }
  });
  console.log("resource", resource)
  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        Resource not found.
      </div>
    );
  }

  const validFields = resource.customFields.filter((f) => f.value && f.value.trim() !== "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/providers/${resource.providerId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Provider
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
                  {resource.provider.name}
                </span>
                <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  {resource.type}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {resource.name}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Price</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400">${resource.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Duration</h3>
                <p className="text-gray-600 dark:text-gray-400">{resource.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-50 dark:bg-green-900/30 p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Working Hours</h3>
                <p className="text-gray-600 dark:text-gray-400">{resource.startTime} - {resource.endTime}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Capacity</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {resource.capacity} total seats 
                  {resource.isGroupBookingEnabled && " (Group booking enabled)"}
                </p>
              </div>
            </div>

            {resource.maxBookingPerUser && (
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Booking Limit</h3>
                  <p className="text-gray-600 dark:text-gray-400">Max {resource.maxBookingPerUser} seats per user</p>
                </div>
              </div>
            )}
          </div>

          <MoreDetailsSection fields={validFields} />

          {/* Added Book Now CTA */}
          <div className="pt-8 mt-4 flex flex-col items-center border-t border-gray-100 dark:border-gray-700">
            <Link
              href={`/book/${resource.id}`}
              className="inline-flex w-full sm:w-auto items-center justify-center px-12 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
