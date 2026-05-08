import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { ADMIN_MODULES, PROVIDER_MODULES } from "@/lib/permissions";

/**
 * GET /api/admin/roles/:roleId
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("roles", "view");
  if (error) return error;

  const { id } = await params;
  const role = await prisma.accessRole.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, providers: true }
      }
    }
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  return NextResponse.json(role);
}

/**
 * PATCH /api/admin/roles/:roleId
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("roles", "edit");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, description, permissions } = body;

  const existing = await prisma.accessRole.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  // Constraint: Cannot edit system roles
  if (existing.isSystem) {
    return NextResponse.json({ error: "System roles cannot be edited" }, { status: 403 });
  }

  try {
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    
    if (permissions) {
        // Validate scope-specific modules
        const validModules = existing.scope === "ADMIN" ? ADMIN_MODULES : PROVIDER_MODULES;
        const invalidPermissions = permissions.filter((p: string) => {
            const [mod] = p.split(".");
            return !validModules.includes(mod as any);
        });

        if (invalidPermissions.length > 0) {
            return NextResponse.json({ 
                error: `Invalid modules for ${existing.scope} scope: ${invalidPermissions.join(", ")}` 
            }, { status: 400 });
        }

        // View validation
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
        
        updateData.permissions = permissions;
    }

    const updated = await prisma.accessRole.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Role name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/roles/:roleId
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requirePermission("roles", "delete");
  if (error) return error;

  const { id } = await params;
  const existing = await prisma.accessRole.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, providers: true }
      }
    }
  });

  if (!existing) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  // Constraint: Cannot delete system roles
  if (existing.isSystem) {
    return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 403 });
  }

  // Constraint: Cannot delete if assigned to users/providers
  if (existing._count.users > 0 || existing._count.providers > 0) {
    return NextResponse.json({ 
      error: "Cannot delete role while it is assigned to users or providers" 
    }, { status: 409 });
  }

  await prisma.accessRole.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
