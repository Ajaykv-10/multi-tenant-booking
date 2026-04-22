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

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
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
            user.id = existing.id;
            user.role = existing.role;
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
      }
      return token;
    },

    // Expose id + role on the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
