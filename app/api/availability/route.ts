import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get("resourceId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!resourceId || !dateStr) {
    return NextResponse.json({ error: "resourceId and date are required" }, { status: 400 });
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Find existing confirmed bookings for this date
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const bookings = await prisma.booking.findMany({
    where: {
      resourceId,
      status: "CONFIRMED",
      start: { gte: startOfDay },
      end: { lte: endOfDay }
    }
  });

  // Calculate slots
  const [startHour, startMin] = resource.startTime.split(":").map(Number);
  const [endHour, endMin] = resource.endTime.split(":").map(Number);
  
  const slots: { start: string; end: string; available: boolean }[] = [];
  let current = new Date(startOfDay);
  current.setUTCHours(startHour, startMin, 0, 0);

  const end = new Date(startOfDay);
  end.setUTCHours(endHour, endMin, 0, 0);

  const durationMs = resource.duration * 60000;

  while (current.getTime() + durationMs <= end.getTime()) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + durationMs);

    // Check if slot overlaps with any booking
    const isBooked = bookings.some(b => {
      // Overlap if max(start1, start2) < min(end1, end2)
      return Math.max(slotStart.getTime(), b.start.getTime()) < Math.min(slotEnd.getTime(), b.end.getTime());
    });

    // Also check if slot is in the past
    // If dateStr is today, we check against Date.now()
    const isPast = slotStart.getTime() < Date.now();

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: !isBooked && !isPast
    });

    current = new Date(current.getTime() + durationMs);
  }

  return NextResponse.json({ slots });
}
