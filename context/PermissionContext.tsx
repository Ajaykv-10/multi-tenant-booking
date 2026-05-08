"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface PermissionsMap {
  [module: string]: string[];
}

interface PermissionContextType {
  permissions: PermissionsMap;
  isSuperAdmin: boolean;
  loading: boolean;
  can: (module: string, action: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
        setPermissions({});
        setIsSuperAdmin(false);
        setLoading(false);
        return;
    }

    try {
      const res = await fetch("/api/auth/permissions");
      if (!res.ok) {
          console.error("[PermissionContext] API error:", res.status, res.statusText);
          return;
      }
      const data = await res.json();
      console.log("[PermissionContext] Fetched permissions:", data);
      setPermissions(data.permissions || {});
      setIsSuperAdmin(data.isSuperAdmin || false);
    } catch (err) {
      console.error("[PermissionContext] Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [status]);

  const can = (module: string, action: string): boolean => {
    if (isSuperAdmin) return true;
    
    const hasWildcard = permissions["*"]?.includes("*") || permissions[module]?.includes("*");
    const hasSpecific = permissions[module]?.includes(action) || false;
    const result = hasWildcard || hasSpecific;
    
    if (module === "roles") {
        console.log(`[can] roles.${action} decision:`, { hasWildcard, hasSpecific, result, permissions: permissions["roles"] });
    }
    
    return result;
  };

  return (
    <PermissionContext.Provider value={{ permissions, isSuperAdmin, loading, can, refresh: fetchPermissions }}>
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
