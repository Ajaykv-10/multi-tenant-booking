import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/providers — list all providers with category, owner, and counts
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const providers = await prisma.provider.findMany({
    include: {
      category: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { users: true, resources: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(providers);
}

// POST /api/providers — create a provider
// Body: { name: string, categoryId: string, ownerId: string }
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, categoryId, ownerId } = body;

  if (!name || !categoryId || !ownerId) {
    return NextResponse.json(
      { error: "name, categoryId, and ownerId are required" },
      { status: 400 }
    );
  }

  // Validate category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  // Validate owner exists and is PROVIDER role
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    return NextResponse.json({ error: "Owner user not found" }, { status: 404 });
  }

  // Check owner doesn't already own a provider
  const existingProvider = await prisma.provider.findUnique({ where: { ownerId } });
  if (existingProvider) {
    return NextResponse.json(
      { error: "This user already owns a provider" },
      { status: 409 }
    );
  }

  const provider = await prisma.provider.create({
    data: { name: name.trim(), categoryId, ownerId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { users: true, resources: true, bookings: true } },
    },
  });

  return NextResponse.json(provider, { status: 201 });
}
