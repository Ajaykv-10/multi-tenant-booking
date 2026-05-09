import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    // ── Credentials: ADMIN & PROVIDER only ──────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error("INVALID_EMAIL");
        }

        // Customers must sign in with Google
        if (user.role === "CUSTOMER") {
          throw new Error("UNAUTHORIZED_ROLE");
        }

        if (!user.password) {
          throw new Error("INVALID_PASSWORD");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("INVALID_PASSWORD");
        }

        const userWithRole = await prisma.user.findUnique({
          where: { id: user.id },
          include: { accessRole: true, ownedProvider: true },
        });

        // Resolve status
        const isSuperAdmin = userWithRole?.role === "ADMIN" && 
          (!userWithRole.accessRole || userWithRole.accessRole.name.toLowerCase().trim() === "super admin");
        
        const isOwner = userWithRole?.role === "PROVIDER" && !!userWithRole.ownedProvider;
        const providerId = userWithRole?.ownedProvider?.id || user.providerId;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          roleId: user.roleId,
          providerId,
          isSuperAdmin,
          isOwner,
          permissions: userWithRole?.accessRole?.permissions || [],
        };
      },
    }),

    // ── Google: CUSTOMER only ────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // On Google sign-in: find or create a CUSTOMER record in the DB
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existing) {
            const userWithRole = await prisma.user.findUnique({
              where: { id: existing.id },
              include: { accessRole: true, ownedProvider: true },
            });
            user.id = existing.id;
            user.role = existing.role;
            user.roleId = existing.roleId;
            (user as any).isSuperAdmin = existing.role === "ADMIN" && 
              (!userWithRole?.accessRole || userWithRole.accessRole.name.toLowerCase().trim() === "super admin");
            (user as any).isOwner = existing.role === "PROVIDER" && !!userWithRole?.ownedProvider;
            (user as any).providerId = userWithRole?.ownedProvider?.id || existing.providerId;
            (user as any).permissions = userWithRole?.accessRole?.permissions || [];
          } else {
            const created = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? null,
                role: "CUSTOMER",
              },
            });
            user.id = created.id;
            user.role = "CUSTOMER";
            user.roleId = null;
            (user as any).isSuperAdmin = false;
            (user as any).isOwner = false;
            (user as any).providerId = null;
            (user as any).permissions = [];
          }
        } catch {
          return false; // Block sign-in on DB error
        }
      }
      return true;
    },

    // Persist id + role into the JWT on first sign-in
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.providerId = (user as any).providerId;
        token.isSuperAdmin = (user as any).isSuperAdmin;
        token.isOwner = (user as any).isOwner;
        token.permissions = (user as any).permissions;
      }
      return token;
    },

    // Expose permissions on the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).roleId = token.roleId;
        (session.user as any).providerId = token.providerId;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).isOwner = token.isOwner;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
};
