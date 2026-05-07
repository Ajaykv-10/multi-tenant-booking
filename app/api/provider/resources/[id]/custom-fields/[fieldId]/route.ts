import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/api-auth";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string; fieldId: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const params = await props.params;
  const { id, fieldId } = params;

  // Validate resource ownership
  const existingResource = await prisma.resource.findUnique({ where: { id } });
  if (!existingResource || existingResource.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const existingField = await prisma.resourceCustomField.findUnique({
    where: { id: fieldId, resourceId: id },
  });

  if (!existingField) {
    return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
  }

  const body = await req.json();
  const { label, type, placeholder, value, isRequired, order } = body;

  const dataToUpdate: any = {};

  if (label !== undefined) {
    const trimmedLabel = label?.trim();
    if (!trimmedLabel || trimmedLabel.length > 100) {
      return NextResponse.json(
        { error: "Label must be max 100 characters and non-empty." },
        { status: 422 }
      );
    }
    dataToUpdate.label = trimmedLabel;
  }

  const newType = type !== undefined ? type : existingField.type;
  if (type !== undefined) {
    if (type !== "short_text" && type !== "description") {
      return NextResponse.json(
        { error: "Type must be 'short_text' or 'description'." },
        { status: 422 }
      );
    }
    dataToUpdate.type = type;
  }

  if (placeholder !== undefined) {
    const trimmedPlaceholder = placeholder?.trim();
    if (trimmedPlaceholder && trimmedPlaceholder.length > 150) {
      return NextResponse.json(
        { error: "Placeholder must be max 150 characters." },
        { status: 422 }
      );
    }
    dataToUpdate.placeholder = trimmedPlaceholder || null;
  }

  if (isRequired !== undefined) {
    if (typeof isRequired !== "boolean") {
      return NextResponse.json({ error: "isRequired must be boolean." }, { status: 422 });
    }
    dataToUpdate.isRequired = isRequired;
  }

  if (order !== undefined) {
    if (typeof order !== "number" || order < 0) {
      return NextResponse.json({ error: "Invalid order value." }, { status: 422 });
    }
    dataToUpdate.order = order;
  }

  if (value !== undefined) {
    const trimmedValue = value?.trim() || "";
    
    // Changing type to short_text and existing value is too long
    if (type === "short_text" && existingField.type === "description" && trimmedValue.length > 120) {
        dataToUpdate.value = trimmedValue.substring(0, 120);
    } else {
        const maxLength = newType === "short_text" ? 120 : 500;
        if (trimmedValue.length > maxLength) {
            return NextResponse.json(
                { error: `Value exceeds maximum length of ${maxLength} characters.` },
                { status: 422 }
            );
        }
        dataToUpdate.value = trimmedValue || null;
    }
  } else if (type === "short_text" && existingField.type === "description" && existingField.value) {
      // Type changed but value not in payload, check if we need to truncate existing value
      if (existingField.value.length > 120) {
          dataToUpdate.value = existingField.value.substring(0, 120);
      }
  }

  try {
    const updatedField = await prisma.resourceCustomField.update({
      where: { id: fieldId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedField);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update custom field" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; fieldId: string }> }
) {
  const { providerId, error } = await requireProvider();
  if (error) return error;

  const params = await props.params;
  const { id, fieldId } = params;

  // Validate resource ownership
  const existingResource = await prisma.resource.findUnique({ where: { id } });
  if (!existingResource || existingResource.providerId !== providerId) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const existingField = await prisma.resourceCustomField.findUnique({
    where: { id: fieldId, resourceId: id },
  });

  if (!existingField) {
    return NextResponse.json({ error: "Custom field not found" }, { status: 404 });
  }

  try {
    await prisma.resourceCustomField.delete({
      where: { id: fieldId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete custom field" },
      { status: 500 }
    );
  }
}
