import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// force HMR

export const dynamic = "force-dynamic";

// GET /api/resources/[id]
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  try {
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
  } catch (error) {
    console.error("Error fetching resource details:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
