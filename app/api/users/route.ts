import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

// GET /api/users — list all users
// Query: ?role=ADMIN|PROVIDER|CUSTOMER
export async function GET(req: NextRequest) {
  const { user: currentUser, error } = await requirePermission("users", "view");
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") as "ADMIN" | "PROVIDER" | "CUSTOMER" | null;

  const whereClause: any = role ? { role } : {};
  if (currentUser.role === "PROVIDER") {
      const pId = currentUser.ownedProvider?.id;
      if (pId) {
          whereClause.providerId = pId;
          whereClause.role = "PROVIDER"; // Providers can only see other providers (staff)
      } else {
          return NextResponse.json({ error: "Provider not found" }, { status: 403 });
      }
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      provider: { select: { id: true, name: true } },
      ownedProvider: { select: { id: true, name: true } },
      accessRole: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Strip passwords before returning
  return NextResponse.json(
    users.map(({ password: _pw, ...u }) => u)
  );
}

// POST /api/users — create a user
// Body: { email, password, name?, role, providerId?, roleId? }
export async function POST(req: NextRequest) {
  const { user: currentUser, error } = await requirePermission("users", "create");
  if (error) return error;

  const body = await req.json();
  const { email, password, name, role, providerId, roleId } = body;

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: "email, password, and role are required" },
      { status: 400 }
    );
  }

  if (!["ADMIN", "PROVIDER", "CUSTOMER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // If provider is creating a user, force providerId and role
  let finalProviderId = providerId;
  let finalRole = role;

  if (currentUser.role === "PROVIDER") {
    const pId = currentUser.ownedProvider?.id;
    if (!pId) return NextResponse.json({ error: "Provider not found" }, { status: 403 });
    finalProviderId = pId;
    finalRole = "PROVIDER";
  }

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name?.trim() || null,
      role: finalRole,
      providerId: finalRole === "PROVIDER" && finalProviderId ? finalProviderId : null,
      roleId: roleId || null,
    },
    include: {
      provider: { select: { id: true, name: true } },
      ownedProvider: { select: { id: true, name: true } },
      accessRole: true,
    },
  });

  const { password: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
