import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

// GET /api/provider/resources/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });

  if (!resource || resource.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}

// PATCH /api/provider/resources/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, type, duration, price, startTime, endTime, capacity, isGroupBookingEnabled, maxBookingPerUser } = body;

  // Validate ownership
  const existing = await prisma.resource.findUnique({ where: { id } });
  if (!existing || existing.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const dataToUpdate: any = {};
  if (name !== undefined) dataToUpdate.name = name.trim();
  if (type !== undefined) dataToUpdate.type = type;
  if (duration !== undefined) dataToUpdate.duration = Number(duration);
  else if (type === "HOTEL" && existing.type !== "HOTEL") dataToUpdate.duration = 1440;
  
  if (price !== undefined) dataToUpdate.price = Number(price);
  if (startTime !== undefined) dataToUpdate.startTime = startTime;
  if (endTime !== undefined) dataToUpdate.endTime = endTime;

  if (capacity !== undefined) dataToUpdate.capacity = Number(capacity);
  if (isGroupBookingEnabled !== undefined) dataToUpdate.isGroupBookingEnabled = Boolean(isGroupBookingEnabled);
  if (maxBookingPerUser !== undefined) dataToUpdate.maxBookingPerUser = maxBookingPerUser ? Number(maxBookingPerUser) : null;

  const updated = await prisma.resource.update({
    where: { id },
    data: dataToUpdate,
  });

  return NextResponse.json(updated);
}

// DELETE /api/provider/resources/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const { id } = await params;

  // Validate ownership
  const existing = await prisma.resource.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!existing || existing.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Guard against deleting resources with bookings
  if (existing._count.bookings > 0) {
    return NextResponse.json(
      { error: `Cannot delete — resource has ${existing._count.bookings} booking(s)` },
      { status: 409 }
    );
  }

  await prisma.resource.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
