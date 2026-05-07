import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const params = await props.params;
  const { id } = params;

  // Validate ownership
  const existing = await prisma.resource.findUnique({ where: { id } });
  if (!existing || existing.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const customFields = await prisma.resourceCustomField.findMany({
    where: { resourceId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(customFields);
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const params = await props.params;
  const { id } = params;

  // Validate ownership
  const existing = await prisma.resource.findUnique({ where: { id } });
  if (!existing || existing.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const body = await req.json();
  const { label, type, placeholder, isRequired, order } = body;

  const trimmedLabel = label?.trim();
  const trimmedPlaceholder = placeholder?.trim();

  if (!trimmedLabel || trimmedLabel.length > 100) {
    return NextResponse.json(
      { error: "Label is required and must be max 100 characters." },
      { status: 422 }
    );
  }

  if (type !== "short_text" && type !== "description") {
    return NextResponse.json(
      { error: "Type must be 'short_text' or 'description'." },
      { status: 422 }
    );
  }

  if (trimmedPlaceholder && trimmedPlaceholder.length > 150) {
    return NextResponse.json(
      { error: "Placeholder must be max 150 characters." },
      { status: 422 }
    );
  }

  if (typeof isRequired !== "boolean" || typeof order !== "number" || order < 0) {
    return NextResponse.json(
      { error: "Invalid isRequired or order value." },
      { status: 422 }
    );
  }

  try {
    const customField = await prisma.resourceCustomField.create({
      data: {
        resourceId: id,
        label: trimmedLabel,
        type,
        placeholder: trimmedPlaceholder || null,
        isRequired,
        order,
      },
    });

    return NextResponse.json(customField, { status: 201 });
  } catch (err: any) {
    console.error("Prisma Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create custom field" },
      { status: 500 }
    );
  }
}
