import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

// GET /api/provider/bookings?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { providerId, error } = await requirePermission("bookings", "view");
  if (error) return error;

  if (!providerId) {
    return NextResponse.json({ error: "Provider ID not found for user" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json(
      { error: "date parameter is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  // Parse start of day and end of day in local time or UTC as needed
  // For simplicity, we assume dateParam is YYYY-MM-DD and we construct date boundaries
  const startOfDay = new Date(`${dateParam}T00:00:00.000`);
  const endOfDay = new Date(`${dateParam}T23:59:59.999`);

  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      start: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      user: { select: { name: true, email: true } },
      resource: { select: { id: true, name: true, price: true, duration: true } },
    },
    orderBy: { start: "asc" },
  });

  return NextResponse.json(bookings);
}
