import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

// PATCH /api/users/[id] — update user details
// Body: { name?, email?, password?, role?, providerId? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, email, password, role, providerId } = body;

  // Prevent admin from downgrading their own role
  if (session!.user.id === id && role && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (role && !["ADMIN", "PROVIDER", "CUSTOMER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  let newEmail = email ? email.toLowerCase().trim() : undefined;
  if (newEmail && newEmail !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email is already taken" }, { status: 409 });
    }
  }

  let hashedPassword = undefined;
  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    hashedPassword = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() || null }),
      ...(newEmail && { email: newEmail }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(role && { role }),
      ...(providerId !== undefined && { providerId: providerId || null }),
    },
    include: { provider: { select: { id: true, name: true } } },
  });

  const { password: _pw, ...safeUser } = updated;
  return NextResponse.json(safeUser);
}

// DELETE /api/users/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  // Prevent self-deletion
  if (session!.user.id === id) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { ownedProvider: true, _count: { select: { bookings: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.ownedProvider) {
    return NextResponse.json(
      { error: `Cannot delete — user owns a provider (${user.ownedProvider.name})` },
      { status: 409 }
    );
  }

  if (user._count.bookings > 0) {
    return NextResponse.json(
      { error: `Cannot delete — user has ${user._count.bookings} booking(s)` },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
