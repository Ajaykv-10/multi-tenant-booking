"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface PermissionsMap {
  [module: string]: string[];
}

interface PermissionContextType {
  permissions: PermissionsMap;
  isSuperAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  can: (module: string, action: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    console.log("[PermissionContext] fetchPermissions status:", status);
    if (status === "loading") return;

    if (status === "unauthenticated") {
      console.log("[PermissionContext] Unauthenticated state detected");
      setPermissions({});
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    if (session?.user) {
      const user = session.user as any;
      console.log("[PermissionContext] DEBUG Session User:", {
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        isOwner: user.isOwner,
        providerId: user.providerId,
        permissions: user.permissions
      });

      const permsArray = Array.isArray(user.permissions) ? user.permissions : [];
      const map: Record<string, string[]> = {};

      permsArray.forEach((p: string) => {
        if (typeof p !== "string") return;
        const [mod, act] = p.split(".");
        if (mod && act) {
          if (!map[mod]) map[mod] = [];
          map[mod].push(act);
        }
      });

      setPermissions(map);
      setIsSuperAdmin(user.isSuperAdmin || false);
      setIsOwner(user.isOwner || false);
      setLoading(false);
    } else if (status === "authenticated") {
      // If we are authenticated but session is not available yet, we stay in loading.
      // But if session is definitely empty, we should stop loading.
      if (session === null) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [status, session]);

  const can = (module: string, action: string): boolean => {
    if (isSuperAdmin) return true;
    if (isOwner) return true;

    const hasWildcard = permissions["*"]?.includes("*") || permissions[module]?.includes("*");
    const hasSpecific = permissions[module]?.includes(action) || false;
    const result = hasWildcard || hasSpecific;

    if (!result && (module === "users" || module === "roles")) {
      console.warn(`[PermissionContext] Access DENIED for ${module}.${action}. User info:`, {
        isSuperAdmin,
        isOwner,
        perms: permissions[module]
      });
    }

    return result;
  };

  return (
    <PermissionContext.Provider value={{ permissions, isSuperAdmin, isOwner, loading, can, refresh: fetchPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
