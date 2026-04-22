import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/bookings
// Query: providerId?, categoryId?, status?, from?, to?, limit?
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const status = searchParams.get("status") as "CONFIRMED" | "CANCELLED" | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const bookings = await prisma.booking.findMany({
    where: {
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
