import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// PATCH /api/providers/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, categoryId, ownerId } = body;

  if (!name || !categoryId || !ownerId) {
    return NextResponse.json(
      { error: "name, categoryId, and ownerId are required" },
      { status: 400 }
    );
  }

  // Check if owner is already assigned to another provider
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    include: { ownedProvider: true },
  });

  if (!owner) {
    return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  }

  if (owner.ownedProvider && owner.ownedProvider.id !== id) {
    return NextResponse.json(
      { error: "This user already owns another provider" },
      { status: 409 }
    );
  }

  if (owner.role !== "PROVIDER") {
    // Optionally automatically update their role, or enforce it:
    return NextResponse.json(
      { error: "Owner must have the PROVIDER role" },
      { status: 400 }
    );
  }

  const provider = await prisma.provider.update({
    where: { id },
    data: { name: name.trim(), categoryId, ownerId },
    include: {
      category: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { users: true, resources: true, bookings: true } },
    },
  });

  return NextResponse.json(provider);
}

// DELETE /api/providers/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const provider = await prisma.provider.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true, resources: true, users: true } } },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  if (provider._count.bookings > 0) {
    return NextResponse.json(
      { error: `Cannot delete — provider has ${provider._count.bookings} booking(s)` },
      { status: 409 }
    );
  }

  if (provider._count.resources > 0) {
    return NextResponse.json(
      { error: `Cannot delete — provider has ${provider._count.resources} resource(s)` },
      { status: 409 }
    );
  }

  if (provider._count.users > 0) {
    return NextResponse.json(
      { error: `Cannot delete — provider has ${provider._count.users} staff user(s)` },
      { status: 409 }
    );
  }

  await prisma.provider.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
