import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  // Find all custom fields for this resource where value is not null and not empty
  const customFields = await prisma.resourceCustomField.findMany({
    where: {
      resourceId: id,
      value: { not: null },
      // Prisma doesn't have a direct 'not empty string' operator, we'll filter below or just use simple conditions
    },
    orderBy: { order: "asc" },
  });

  // Filter out empty strings after trimming
  const validFields = customFields.filter((field) => field.value && field.value.trim() !== "");

  return NextResponse.json(validFields);
}
