import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

// GET /api/provider — Fetch current provider's details
export async function GET() {
  const { providerId, error } = await requirePermission("provider", "view");
  if (error) return error;

  if (!providerId) {
    return NextResponse.json({ error: "No provider association found" }, { status: 404 });
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      category: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } }
    }
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found in database" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

// PATCH /api/provider — Update current provider's details
export async function PATCH(req: NextRequest) {
  const { providerId, error } = await requirePermission("provider", "edit");
  if (error) return error;

  if (!providerId) {
    return NextResponse.json({ error: "No provider association found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: { name: name.trim() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update provider info" }, { status: 500 });
  }
}
