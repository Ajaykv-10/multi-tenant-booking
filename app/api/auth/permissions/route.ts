import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPermissionsMap } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ permissions: {} });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accessRole: true },
  });

  if (!user) {
    return NextResponse.json({ permissions: {} });
  }

  // If Super Admin, we can return a special flag or full map
  // Fallback: If they have the legacy "ADMIN" role but no granular role yet, treat as Super Admin
  const roleName = user.accessRole?.name?.toLowerCase().trim();
  if (user.role === "ADMIN" && (!user.accessRole || roleName === "super admin")) {
      return NextResponse.json({
          isSuperAdmin: true,
          permissions: { "*": ["*"] }
      });
  }

  const permissions = getPermissionsMap(user.accessRole);

  return NextResponse.json({
    isSuperAdmin: false,
    permissions,
  });
}
