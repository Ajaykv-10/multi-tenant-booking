import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

// PATCH /api/provider/bookings/[id] — Cancel booking
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (status !== "CANCELLED") {
    return NextResponse.json(
      { error: "Only cancelling is supported via this endpoint" },
      { status: 400 }
    );
  }

  // Validate ownership
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing || existing.providerId !== providerId) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (existing.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
