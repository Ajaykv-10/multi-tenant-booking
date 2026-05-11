import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "PROVIDER" | "CUSTOMER";
      roleId: string | null;
      providerId: string | null;
      isSuperAdmin: boolean;
      isOwner: boolean;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "ADMIN" | "PROVIDER" | "CUSTOMER";
    roleId: string | null;
    providerId: string | null;
    isSuperAdmin: boolean;
    isOwner: boolean;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "ADMIN" | "PROVIDER" | "CUSTOMER";
    roleId: string | null;
    providerId: string | null;
    isSuperAdmin: boolean;
    isOwner: boolean;
    permissions: string[];
  }
}
