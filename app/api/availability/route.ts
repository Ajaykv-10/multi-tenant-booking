import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get("resourceId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const endDateStr = searchParams.get("endDate"); // YYYY-MM-DD (Optional, for hotels)

  if (!resourceId || !dateStr) {
    return NextResponse.json({ error: "resourceId and date are required" }, { status: 400 });
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Find existing confirmed bookings that overlap with the day(s)
  const startQuery = new Date(`${dateStr}T00:00:00.000Z`);
  const endQuery = new Date(`${endDateStr || dateStr}T23:59:59.999Z`);

  const bookings = await prisma.booking.findMany({
    where: {
      resourceId,
      status: "CONFIRMED",
      OR: [
        { start: { lte: endQuery }, end: { gte: startQuery } }
      ]
    }
  });

  if (resource.type === "HOTEL") {
    // For hotels, check specific stay availability
    if (endDateStr) {
      const stayStart = new Date(`${dateStr}T${resource.startTime}:00Z`);
      const stayEnd = new Date(`${endDateStr}T${resource.endTime}:00Z`);
      
      const overlappingBookings = bookings.filter(b => 
        Math.max(stayStart.getTime(), b.start.getTime()) < Math.min(stayEnd.getTime(), b.end.getTime())
      );
      const bookedSeats = overlappingBookings.reduce((sum, b) => sum + b.seats, 0);
      const availableSeats = Math.max(0, resource.capacity - bookedSeats);

      return NextResponse.json({ 
        slots: [{ 
          start: stayStart.toISOString(), 
          end: stayEnd.toISOString(), 
          available: availableSeats > 0 && stayStart.getTime() >= Date.now(),
          availableSeats,
          totalCapacity: resource.capacity
        }] 
      });
    }
    // If no endDate provided for a hotel, return empty/placeholder or basic info
    return NextResponse.json({ slots: [] });
  }

  // Calculate slots for EVENT type
  const [startHour, startMin] = resource.startTime.split(":").map(Number);
  const [endHour, endMin] = resource.endTime.split(":").map(Number);
  
  const slots: { start: string; end: string; available: boolean; availableSeats: number; totalCapacity: number }[] = [];
  let current = new Date(startQuery);
  current.setUTCHours(startHour, startMin, 0, 0);

  const endLimit = new Date(startQuery);
  endLimit.setUTCHours(endHour, endMin, 0, 0);

  const durationMs = resource.duration * 60000;

  while (current.getTime() + durationMs <= endLimit.getTime()) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + durationMs);

    const overlappingBookings = bookings.filter(b => 
      Math.max(slotStart.getTime(), b.start.getTime()) < Math.min(slotEnd.getTime(), b.end.getTime())
    );
    const bookedSeats = overlappingBookings.reduce((sum, b) => sum + b.seats, 0);
    const availableSeats = Math.max(0, resource.capacity - bookedSeats);

    const isPast = slotStart.getTime() < Date.now();

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: availableSeats > 0 && !isPast,
      availableSeats,
      totalCapacity: resource.capacity
    });

    current = new Date(current.getTime() + durationMs);
  }

  return NextResponse.json({ slots });
}
