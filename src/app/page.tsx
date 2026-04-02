"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, CalendarHeart, TrendingUp } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient orbs */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[128px]" />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <Logo size="xl" className="mx-auto mb-8" />

        {/* Heading */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          EduCatch
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {" "}
            Lite
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-lg text-slate-400 sm:text-xl">
          The smart catch-up planner for students who miss classes. Track
          lessons, plan your study schedule, and stay on top of your academics.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-indigo-500"
          >
            Get Started Free
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: <BookOpen className="mb-3 mx-auto h-8 w-8 text-violet-400" />,
              title: "Track Lessons",
              desc: "Record missed classes with details",
            },
            {
              icon: <CalendarHeart className="mb-3 mx-auto h-8 w-8 text-indigo-400" />,
              title: "Smart Planning",
              desc: "Auto-generated catch-up schedules",
            },
            {
              icon: <TrendingUp className="mb-3 mx-auto h-8 w-8 text-emerald-400" />,
              title: "Progress Tracking",
              desc: "Monitor your completion status",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/[0.06] bg-slate-800/30 p-6 text-center transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-800/50"
            >
              {feature.icon}
              <h3 className="mb-1 text-sm font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
