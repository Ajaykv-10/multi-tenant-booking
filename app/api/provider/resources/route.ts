import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

// GET /api/provider/resources
export async function GET() {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const resources = await prisma.resource.findMany({
    where: { providerId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { bookings: true } },
      customFields: {
        orderBy: { order: "asc" }
      }
    },
  });

  return NextResponse.json(resources);
}

// POST /api/provider/resources
export async function POST(req: NextRequest) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const body = await req.json();
  const { name, type, duration, price, startTime, endTime, capacity, isGroupBookingEnabled, maxBookingPerUser } = body;

  if (!name || (type === "EVENT" && duration == null) || price == null || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.create({
    data: {
      name: name.trim(),
      type: type || "EVENT",
      duration: type === "HOTEL" ? 1440 : Number(duration), // Use 1440 (1 day) as default for HOTEL
      price: Number(price),
      startTime,
      endTime,
      capacity: capacity ? Number(capacity) : 1,
      isGroupBookingEnabled: Boolean(isGroupBookingEnabled),
      maxBookingPerUser: maxBookingPerUser ? Number(maxBookingPerUser) : null,
      providerId,
    },
  });

  return NextResponse.json(resource);
}
