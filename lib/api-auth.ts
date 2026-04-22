import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type AdminResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse };

/** Guards an API route to ADMIN-only access. */
export async function requireAdmin(): Promise<AdminResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Forbidden — Admin access only" },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}
