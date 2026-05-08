import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In — BookingEngine",
  description: "Sign in to your BookingEngine account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* ── Left panel — branding hero ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 flex-col justify-between p-12">
        {/* Gradient orbs */}
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none"
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">BookingEngine</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Your booking
            <br />
            <span className="text-indigo-400">command center.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Manage providers, resources, and appointments — all in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              "Real-time appointment scheduling",
              "Multi-provider management",
              "Role-based access control",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-slate-600 text-xs">
          © {new Date().getFullYear()} BookingEngine. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-slate-900 px-6 py-12">
        <LoginForm />
      </div>
    </main>
  );
}
