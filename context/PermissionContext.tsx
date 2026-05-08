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
    if (status !== "authenticated") {
        setPermissions({});
        setIsSuperAdmin(false);
        setLoading(false);
        return;
    }

    try {
      const res = await fetch("/api/auth/permissions");
      const data = await res.json();
      setPermissions(data.permissions || {});
      setIsSuperAdmin(data.isSuperAdmin || false);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [status]);

  const can = (module: string, action: string): boolean => {
    if (isSuperAdmin) return true;
    
    // Check for wildcard module or wildcard action
    if (permissions["*"]?.includes("*")) return true;
    if (permissions[module]?.includes("*")) return true;
    
    return permissions[module]?.includes(action) || false;
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
