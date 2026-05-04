import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { ensureInvoiceNumber } from "@/lib/invoice/ensureInvoiceNumber";


// PATCH /api/bookings/[id] — update booking status and time
// Body: { status?, start?, end? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { status, start, end } = body;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (status && !["CONFIRMED", "CANCELLED"].includes(status)) {
    return NextResponse.json(
      { error: "status must be CONFIRMED or CANCELLED" },
      { status: 400 }
    );
  }

  let startDate = booking.start;
  let endDate = booking.end;

  if (start && end) {
    startDate = new Date(start);
    endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(start && { start: startDate }),
      ...(end && { end: endDate }),
    },
    include: {
      user: { select: { name: true, email: true } },
      provider: { select: { name: true } },
      resource: { select: { name: true } },
    },
  });

  // If status just changed to CONFIRMED, pre-generate invoice number
  if (status === "CONFIRMED" && !booking.invoiceNumber) {
    ensureInvoiceNumber(id).catch((err) =>
      console.error("[Invoice] Failed to generate invoice on CONFIRM:", err)
    );
  }

  return NextResponse.json(updated);
}


// DELETE /api/bookings/[id] — hard delete a booking
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
