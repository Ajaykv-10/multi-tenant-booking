"use client";

import { SessionProvider } from "next-auth/react";
import { PermissionProvider } from "@/context/PermissionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </SessionProvider>
  );
}
