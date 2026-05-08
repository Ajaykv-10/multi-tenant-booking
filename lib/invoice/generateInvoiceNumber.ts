import { prisma } from "@/lib/prisma";

/**
 * Atomically generates the next invoice number for the current year.
 * Format: INV-{YEAR}-{SEQUENCE} e.g. INV-2026-0001
 *
 * Uses a Prisma transaction + upsert on InvoiceCounter to guarantee
 * uniqueness even under concurrent requests.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Atomic increment inside a transaction
  const counter = await prisma.$transaction(async (tx) => {
    // Upsert: create row for the year if it doesn't exist, then increment
    return tx.invoiceCounter.upsert({
      where: { year },
      create: { year, sequence: 1 },
      update: { sequence: { increment: 1 } },
    });
  });

  const seq = String(counter.sequence).padStart(4, "0");
  return `INV-${year}-${seq}`;
}
