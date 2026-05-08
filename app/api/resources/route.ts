import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resources?providerId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId");

  if (!providerId) {
    return NextResponse.json({ error: "providerId is required" }, { status: 400 });
  }

  const resources = await prisma.resource.findMany({
    where: { providerId },
    include: {
      customFields: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json(resources);
}
