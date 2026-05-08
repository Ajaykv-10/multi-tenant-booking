import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "./permissions";

type AdminResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse };

/** Guards an API route to ADMIN-only access. */
export async function requireAdmin(): Promise<AdminResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Forbidden — Admin access only" },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

type ProviderResult =
  | { session: Session; providerId: string; error: null }
  | { session: null; providerId: null; error: NextResponse };

/** Guards an API route to PROVIDER-only access and injects providerId. */
export async function requireProvider(): Promise<ProviderResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      providerId: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "PROVIDER") {
    return {
      session: null,
      providerId: null,
      error: NextResponse.json(
        { error: "Forbidden — Provider access only" },
        { status: 403 }
      ),
    };
  }

  // Get the provider ID that this user owns
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ownedProvider: { select: { id: true } } },
  });

  if (!user?.ownedProvider) {
    return {
      session: null,
      providerId: null,
      error: NextResponse.json(
        { error: "Forbidden — You must own a provider account" },
        { status: 403 }
      ),
    };
  }

  return { session, providerId: user.ownedProvider.id, error: null };
}

/**
 * Universal permission guard.
 * Checks both session role (ADMIN/PROVIDER) and granular AccessRole permissions.
 */
export async function requirePermission(module: string, action: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Fetch user with role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accessRole: true, ownedProvider: { select: { id: true } } },
  });

  if (!user) {
    return {
      session: null,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  // 1. Super Admin Bypass (Fallback if no accessRole but user role is ADMIN)
  if (user.role === "ADMIN" && (!user.accessRole || user.accessRole.name === "Super Admin")) {
    return { session, user, error: null };
  }

  // 2. Check granular permissions
  const hasPerm = checkPermission(user.accessRole?.permissions, module, action);

  if (!hasPerm) {
    return {
      session: null,
      error: NextResponse.json(
        { error: `Forbidden — Missing ${module}.${action} permission` },
        { status: 403 }
      ),
    };
  }

  return { session, user, error: null };
}
