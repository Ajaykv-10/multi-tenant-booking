import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// force HMR

export const dynamic = "force-dynamic";

// GET /api/resources/[id]
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      provider: {
        select: { id: true, name: true, category: { select: { name: true } } }
      },
      customFields: {
        where: { value: { not: null } },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  return NextResponse.json({ ...resource, debug_compiled: true });
}
