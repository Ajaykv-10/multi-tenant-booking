import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await props.params;
  const { id } = params;

  const booking = await prisma.booking.findUnique({
    where: { id }
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Ensure current user owns the booking or is admin/provider
  if (booking.userId !== session.user.id && session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" }
  });

  return NextResponse.json(updatedBooking);
}
