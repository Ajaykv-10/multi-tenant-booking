import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const params = await props.params;
  const { id } = params;

  // Validate ownership
  const existingResource = await prisma.resource.findUnique({ where: { id } });
  if (!existingResource || existingResource.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Find all required custom fields for this resource
  const requiredFields = await prisma.resourceCustomField.findMany({
    where: {
      resourceId: id,
      isRequired: true,
    },
  });

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const val = field.value?.trim();
    if (!val) {
      missingFields.push(field.label);
    }
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: "required_custom_fields_incomplete",
        message: "Some required custom fields have no value.",
        fields: missingFields,
      },
      { status: 422 }
    );
  }

  try {
    const updated = await prisma.resource.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to publish resource" },
      { status: 500 }
    );
  }
}
