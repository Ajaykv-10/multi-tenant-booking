import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/resources/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, category: { select: { name: true } } }
      }
    }
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json(resource);
}
