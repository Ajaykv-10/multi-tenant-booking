import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

// GET /api/provider/resources
export async function GET() {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const resources = await prisma.resource.findMany({
    where: { providerId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return NextResponse.json(resources);
}

// POST /api/provider/resources
export async function POST(req: NextRequest) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const body = await req.json();
  const { name, duration, price, startTime, endTime } = body;

  if (!name || duration == null || price == null || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const resource = await prisma.resource.create({
    data: {
      name: name.trim(),
      duration: Number(duration),
      price: Number(price),
      startTime,
      endTime,
      providerId,
    },
  });

  return NextResponse.json(resource);
}
