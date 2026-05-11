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

  // Get the provider ID (either they own it or they are staff)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { providerId: true, ownedProvider: { select: { id: true } } },
  });

  const providerId = user?.ownedProvider?.id || user?.providerId;

  if (!providerId) {
    return {
      session: null,
      providerId: null,
      error: NextResponse.json(
        { error: "Forbidden — You must belong to a provider account" },
        { status: 403 }
      ),
    };
  }

  return { session, providerId, error: null };
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

  console.log(`[requirePermission] User: ${user.email}, Role: ${user.role}, AccessRole: ${user.accessRole?.name}`);

  // 1. Super Admin Bypass (Fallback if no accessRole but user role is ADMIN)
  const roleName = user.accessRole?.name?.toLowerCase().trim();
  if (user.role === "ADMIN" && (!user.accessRole || roleName === "super admin")) {
    return { session, user, error: null };
  }

  // 1b. Provider Owner Bypass (Full access to provider dashboard)
  if (user.role === "PROVIDER" && user.ownedProvider) {
    return { session, user, error: null };
  }

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
