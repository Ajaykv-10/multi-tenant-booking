import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

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
    // Latest 10 bookings with full relations
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true } },
        resource: { select: { name: true, price: true } },
      },
    }),
    // Last 30 days for trend chart
    prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // For revenue calculation
    prisma.resource.findMany({
      select: {
        price: true,
        bookings: { select: { status: true } },
      },
    }),
  ]);

  // Revenue = price × confirmed bookings per resource
  const revenue = resourcesWithBookings.reduce(
    (sum, r) =>
      sum + r.price * r.bookings.filter((b) => b.status === "CONFIRMED").length,
    0
  );

  // Group by date for trend chart
  const trendMap: Record<string, number> = {};
  recentBookings.forEach((b) => {
    const date = b.createdAt.toISOString().split("T")[0];
    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  return NextResponse.json({
    totalBookings,
    totalProviders,
    totalUsers,
    revenue,
    trend: Object.entries(trendMap).map(([date, count]) => ({ date, count })),
    latestBookings,
  });
}
