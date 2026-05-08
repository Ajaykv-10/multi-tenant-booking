import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

// GET /api/provider/resources
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requirePermission("resources", "view");
  if (error) return error;

  const providerId = user?.ownedProvider?.id;
  if (!providerId) {
    return NextResponse.json({ error: "Forbidden — No provider owned" }, { status: 403 });
  }

  try {
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
  } catch (error) {
    console.error("Error fetching provider resources:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

// POST /api/provider/resources
export async function POST(req: NextRequest) {
  const { user, error } = await requirePermission("resources", "create");
  if (error) return error;

  const providerId = user?.ownedProvider?.id;
  if (!providerId) {
    return NextResponse.json({ error: "Forbidden — No provider owned" }, { status: 403 });
  }

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
