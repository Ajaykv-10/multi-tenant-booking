import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { ADMIN_MODULES, PROVIDER_MODULES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/roles
 * List all roles, optional ?scope= filter
 */
export async function GET(req: NextRequest) {
  const { error } = await requirePermission("roles", "view");
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const scope = searchParams.get("scope");

  const roles = await prisma.accessRole.findMany({
    where: scope ? { scope: scope as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, providers: true }
      }
    }
  });

  return NextResponse.json(roles);
}

/**
 * POST /api/admin/roles
 * Create a new role
 */
export async function POST(req: NextRequest) {
  const { error } = await requirePermission("roles", "create");
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description, scope, permissions } = body;

    // Basic validation
    if (!name || !scope || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate scope-specific modules
    const validModules = scope === "ADMIN" ? ADMIN_MODULES : PROVIDER_MODULES;
    const invalidPermissions = permissions.filter((p: string) => {
        const [mod] = p.split(".");
        return !validModules.includes(mod as any);
    });

    if (invalidPermissions.length > 0) {
        return NextResponse.json({ 
            error: `Invalid modules for ${scope} scope: ${invalidPermissions.join(", ")}` 
        }, { status: 400 });
    }

    // "View must be present if other actions are present" validation
    const modulesWithActions = new Set<string>();
    permissions.forEach((p: string) => {
        const [mod, act] = p.split(".");
        if (act !== "view") modulesWithActions.add(mod);
    });

    const missingView = Array.from(modulesWithActions).filter(mod => !permissions.includes(`${mod}.view`));
    if (missingView.length > 0) {
        return NextResponse.json({ 
            error: `View permission required for: ${missingView.join(", ")}` 
        }, { status: 400 });
    }

    const role = await prisma.accessRole.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        scope,
        permissions,
        isSystem: false,
      },
    });

    return NextResponse.json(role);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
