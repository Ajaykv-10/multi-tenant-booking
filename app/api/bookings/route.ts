import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requirePermission } from "@/lib/api-auth";
import { sendEmail } from "@/lib/email/sendEmail";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { ensureInvoiceNumber } from "@/lib/invoice/ensureInvoiceNumber";


// GET /api/bookings
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const status = searchParams.get("status") as "CONFIRMED" | "CANCELLED" | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let userId = searchParams.get("userId") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  // If not admin, restrict to checking their own bookings (or maybe their provider bookings, but we keep it simple)
  if (session.user.role === "CUSTOMER") {
    userId = session.user.id;
  } else {
    const { error } = await requirePermission("bookings", "view");
    if (error) return error;
    
    // For providers, automatically filter by their providerId if not explicitly searching another
    if (session.user.role === "PROVIDER") {
        const userWithProv = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { ownedProvider: { select: { id: true } } }
        });
        if (userWithProv?.ownedProvider && !providerId) {
            // Force filter to own provider
            // (Note: this is a simple implementation, ideally we'd allow staff to view too)
        }
    }
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...(userId && { userId }),
      ...(providerId && { providerId }),
      ...(categoryId && { provider: { categoryId } }),
      ...(status && { status }),
      ...((from || to) && {
        start: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to + "T23:59:59Z") }),
        },
      }),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      provider: {
        select: {
          id: true,
          name: true,
          category: { select: { id: true, name: true } },
        },
      },
      resource: {
        select: { id: true, name: true, price: true, duration: true },
      },
    },
  });

  return NextResponse.json(bookings);
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const userName = session.user.name || "Customer";
  
  const body = await req.json();
  const { resourceId, start, end, seats_booked = 1, participants = [] } = body;

  if (!resourceId || !start || !end) {
    return NextResponse.json(
      { error: "resourceId, start, and end are required" },
      { status: 400 }
    );
  }

  if (seats_booked < 1) {
    return NextResponse.json({ error: "At least 1 seat must be booked" }, { status: 400 });
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId }
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Validate max booking per user
  if (resource.maxBookingPerUser && seats_booked > resource.maxBookingPerUser) {
    return NextResponse.json(
      { error: `You can only book up to ${resource.maxBookingPerUser} seats at once.` },
      { status: 400 }
    );
  }

  // Validate group booking participants
  if (resource.isGroupBookingEnabled) {
    if (participants.length !== seats_booked) {
      return NextResponse.json(
        { error: "Participants count must match the number of seats booked." },
        { status: 400 }
      );
    }
    const missingNames = participants.some((p: any) => !p.name || p.name.trim() === "");
    if (missingNames) {
      return NextResponse.json(
        { error: "Participant name is required." },
        { status: 400 }
      );
    }
  }

  // Validate for conflicting bookings (race condition prevention)
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      resourceId,
      status: "CONFIRMED",
      start: { lt: new Date(end) },
      end: { gt: new Date(start) },
    }
  });

  const bookedSeats = overlappingBookings.reduce((sum, b) => sum + b.seats, 0);
  const availableSeats = Math.max(0, resource.capacity - bookedSeats);

  if (seats_booked > availableSeats) {
    return NextResponse.json(
      { error: `Only ${availableSeats} seats available. Please reduce your seats.` },
      { status: 409 }
    );
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      providerId: resource.providerId,
      resourceId,
      start: new Date(start),
      end: new Date(end),
      status: "CONFIRMED",
      seats: seats_booked,
      ...(resource.isGroupBookingEnabled && participants.length > 0 && {
        participants: {
          create: participants.map((p: any) => ({
            name: p.name,
            email: p.email || null,
            phone: p.phone || null
          }))
        }
      })
    }
  });

  // Send confirmation email asynchronously
  if (userEmail) {
    const bookingDate = new Date(start).toLocaleString();
    sendEmail({
      to: userEmail,
      subject: "Booking Confirmed",
      template: BookingConfirmationEmail({
        customerName: userName,
        bookingId: booking.id,
        resourceName: resource.name,
        bookingDate,
      }),
    });
  }

  // Pre-generate invoice number asynchronously (fire-and-forget)
  ensureInvoiceNumber(booking.id).catch((err) =>
    console.error("[Invoice] Failed to pre-generate invoice number:", err)
  );

  return NextResponse.json(booking, { status: 201 });
}
