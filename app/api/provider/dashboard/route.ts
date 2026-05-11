import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

// GET /api/provider/dashboard
export async function GET() {
  const { providerId, error } = await requirePermission("dashboard", "view");
  if (error) return error;

  if (!providerId) {
    return NextResponse.json({ error: "Provider association not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Get Provider + Resources + Bookings
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      resources: true,
      bookings: {
        where: {
          start: { gte: today }, // Only future/today bookings matter for preview & upcoming
        },
        include: {
          user: { select: { name: true, email: true } },
          resource: { select: { name: true, price: true } },
        },
        orderBy: { start: "asc" },
      },
      // Get all-time bookings to calculate revenue if needed, but let's just do an aggregate
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const allBookingsForRevenue = await prisma.booking.findMany({
    where: { providerId, status: "CONFIRMED" },
    include: { resource: { select: { price: true } } },
  });

  const totalRevenue = allBookingsForRevenue.reduce(
    (sum, b) => sum + (b.resource.price || 0),
    0
  );

  const todayBookings = provider.bookings.filter(
    (b) => b.start >= today && b.start < tomorrow
  );

  const upcomingBookings = provider.bookings.filter(
    (b) => b.start >= tomorrow
  );

  return NextResponse.json({
    providerName: provider.name,
    totalResources: provider.resources.length,
    todayBookingsCount: todayBookings.length,
    upcomingBookingsCount: upcomingBookings.length,
    revenue: totalRevenue,
    todaySchedule: todayBookings,
  });
}
