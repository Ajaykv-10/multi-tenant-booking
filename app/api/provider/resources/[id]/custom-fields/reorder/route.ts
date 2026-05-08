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

  const body = await req.json();
  const { order } = body; // Expecting { order: [{ id: "uuid", order: 0 }, ...] }

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: "Invalid order array format" }, { status: 400 });
  }

  // Validate that all field IDs belong to the resource
  const fieldIds = order.map((item: any) => item.id);
  const existingFields = await prisma.resourceCustomField.findMany({
    where: {
      id: { in: fieldIds },
      resourceId: id,
    },
  });

  if (existingFields.length !== fieldIds.length) {
    return NextResponse.json(
      { error: "One or more fields do not belong to this resource" },
      { status: 400 }
    );
  }

  try {
    // Transactional update for ordering
    await prisma.$transaction(
      order.map((item: any) =>
        prisma.resourceCustomField.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    // Fetch and return the updated sorted list
    const updatedFields = await prisma.resourceCustomField.findMany({
      where: { resourceId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(updatedFields);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to reorder custom fields" },
      { status: 500 }
    );
  }
}
