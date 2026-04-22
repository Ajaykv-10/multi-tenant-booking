import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// PATCH /api/categories/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
  });

  if (existing && existing.id !== id) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim(), slug: normalizedSlug },
    include: { _count: { select: { providers: true } } },
  });

  return NextResponse.json(category);
}

// DELETE /api/categories/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { providers: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (category._count.providers > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${category._count.providers} provider(s) use this category` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
