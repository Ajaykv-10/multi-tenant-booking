import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureInvoiceNumber } from "@/lib/invoice/ensureInvoiceNumber";
import { InvoiceDocument } from "@/lib/invoice/InvoiceDocument";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

/**
 * GET /api/bookings/:id/invoice
 *
 * Role-based access:
 *  - CUSTOMER  → only their own bookings
 *  - PROVIDER  → bookings tied to their provider
 *  - ADMIN     → all bookings
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const role = session.user.role;
  const userId = session.user.id;

  // ── Fetch the booking with all relations ──────────────────────────────────
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      provider: {
        select: {
          id: true,
          name: true,
          category: { select: { id: true, name: true } },
          ownerId: true,
        },
      },
      resource: { select: { id: true, name: true, price: true, duration: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // ── Role-based access control ─────────────────────────────────────────────
  if (role === "CUSTOMER" && booking.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "PROVIDER") {
    // Check that the provider owns this booking's provider
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ownedProvider: { select: { id: true } } },
    });
    if (!user?.ownedProvider || user.ownedProvider.id !== booking.providerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Only generate invoices for confirmed bookings
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Invoice is only available for confirmed bookings" },
      { status: 400 }
    );
  }

  // ── Ensure invoice number exists (idempotent) ─────────────────────────────
  const bookingWithInvoice = await ensureInvoiceNumber(id);
  if (!bookingWithInvoice) {
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }

  // ── Render PDF ────────────────────────────────────────────────────────────
  try {
    const buffer = await renderToBuffer(
      React.createElement(InvoiceDocument, { booking: bookingWithInvoice })
    );

    const filename = `${bookingWithInvoice.invoiceNumber}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[Invoice] PDF render error:", err);
    return NextResponse.json({ error: "Failed to render PDF" }, { status: 500 });
  }
}
