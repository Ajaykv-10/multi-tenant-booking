import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "./generateInvoiceNumber";
import { Prisma } from "@prisma/client";

// Full booking shape needed for the invoice
export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
    provider: {
      select: { id: true; name: true; category: { select: { id: true; name: true } } };
    };
    resource: { select: { id: true; name: true; price: true; duration: true } };
  };
}>;

/**
 * Idempotent: fetches the booking with all invoice-relevant relations.
 * If no invoiceNumber exists yet, generates one and persists it.
 * Returns the fully-loaded booking (always fresh from DB).
 */
export async function ensureInvoiceNumber(
  bookingId: string
): Promise<BookingWithRelations | null> {
  const include = {
    user: { select: { id: true, name: true, email: true } },
    provider: {
      select: {
        id: true,
        name: true,
        category: { select: { id: true, name: true } },
      },
    },
    resource: { select: { id: true, name: true, price: true, duration: true } },
  } as const;

  let booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include,
  });

  if (!booking) return null;

  // Only generate if not already assigned
  if (!booking.invoiceNumber) {
    const invoiceNumber = await generateInvoiceNumber();

    booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        invoiceNumber,
        invoiceGeneratedAt: new Date(),
      },
      include,
    });
  }

  return booking;
}
