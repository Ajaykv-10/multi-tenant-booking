import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/categories — list all categories with provider count
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { providers: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

// POST /api/categories — create a new category
// Body: { name: string, slug: string }
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    );
  }

  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A category with this slug already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: { name: name.trim(), slug: normalizedSlug },
    include: { _count: { select: { providers: true } } },
  });

  return NextResponse.json(category, { status: 201 });
}
