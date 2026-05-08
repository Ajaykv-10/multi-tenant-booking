import { AccessRole } from "@prisma/client";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export const ADMIN_MODULES = [
  "categories",
  "providers",
  "users",
  "roles",
  "bookings",
  "dashboard"
] as const;

export const PROVIDER_MODULES = [
  "resources",
  "bookings",
  "custom_fields",
  "roles",
  "users",
  "dashboard"
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number];
export type ProviderModule = (typeof PROVIDER_MODULES)[number];

/**
 * Checks if a set of permissions allows a specific action on a module.
 * Convention: "module.action" (e.g., "users.create")
 * Special wildcards: "*.*" or "module.*"
 */
export function checkPermission(
  permissions: any,
  module: string,
  action: string
): boolean {
  if (!Array.isArray(permissions)) return false;

  const perms = permissions as string[];

  return (
    perms.includes("*.*") ||
    perms.includes(`${module}.*`) ||
    perms.includes(`${module}.${action}`)
  );
}

/**
 * Resolves permissions for a role, ensuring Super Admin bypasses checks.
 */
export function getPermissionsMap(role: AccessRole | null) {
  if (!role) return {};

  const permissions = role.permissions as string[];
  const map: Record<string, string[]> = {};

  permissions.forEach((p) => {
    const [mod, act] = p.split(".");
    if (!map[mod]) map[mod] = [];
    map[mod].push(act);
  });

  return map;
}
