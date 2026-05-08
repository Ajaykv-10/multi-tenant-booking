import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/stats-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { BookingsChart } from "@/components/admin/bookings-chart";

async function getDashboardData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalBookings,
    totalProviders,
    totalUsers,
    latestBookings,
    recentBookings,
    resourcesWithBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.provider.count(),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true } },
        resource: { select: { name: true, price: true } },
      },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.resource.findMany({
      select: { price: true, bookings: { select: { status: true } } },
    }),
  ]);

  const revenue = resourcesWithBookings.reduce(
    (sum: number, r: any) =>
      sum + r.price * r.bookings.filter((b: any) => b.status === "CONFIRMED").length,
    0
  );

  const trendMap: Record<string, number> = {};
  recentBookings.forEach((b: any) => {
    const date = b.createdAt.toISOString().split("T")[0];
    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  return {
    totalBookings,
    totalProviders,
    totalUsers,
    revenue,
    trend: Object.entries(trendMap).map(([date, count]) => ({ date, count })),
    latestBookings,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your booking platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={data.totalBookings.toLocaleString()}
          accent="indigo"
          sub="All time"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Providers"
          value={data.totalProviders.toLocaleString()}
          accent="violet"
          sub="Active"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
          }
        />
        <StatsCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          accent="blue"
          sub="Registered"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Revenue"
          value={`₹${(data.revenue / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`}
          accent="emerald"
          sub="Confirmed bookings"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Chart + quick info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Booking Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 days</p>
            </div>
          </div>
          <BookingsChart data={data.trend} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: "Avg. bookings/day", value: data.trend.length ? Math.round(data.totalBookings / 30) : 0 },
              { label: "Providers active", value: data.totalProviders },
              { label: "Customers signed up", value: data.totalUsers },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest bookings */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Latest Bookings</h2>
          <a href="/admin/bookings" className="text-xs font-medium text-indigo-600 hover:underline">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Customer", "Provider", "Resource", "Date & Time", "Status"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.latestBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                data.latestBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{booking.user.name ?? "—"}</p>
                      <p className="text-xs text-slate-400">{booking.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{booking.provider.name}</td>
                    <td className="px-6 py-4 text-slate-700">{booking.resource.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(booking.start).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      <span className="text-slate-400">
                        {new Date(booking.start).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status as "CONFIRMED" | "CANCELLED"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
