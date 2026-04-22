import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/provider/sidebar";
import { Header } from "@/components/provider/header";
import { prisma } from "@/lib/prisma";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/login?error=unauthorized");
  }

  // Ensure they own a provider
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ownedProvider: true },
  });

  if (!user?.ownedProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center px-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Provider Account</h1>
          <p className="text-slate-500">You must own a provider account to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <Header />
        {children}
      </div>
    </div>
  );
}
