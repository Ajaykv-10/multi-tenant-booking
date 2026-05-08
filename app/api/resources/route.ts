import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resources?providerId=xxx
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const providerId = searchParams.get("providerId");

  if (!providerId) {
    return NextResponse.json({ error: "providerId is required" }, { status: 400 });
  }

  try {
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
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
