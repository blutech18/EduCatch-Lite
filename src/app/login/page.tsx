"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import bcrypt from "bcryptjs";
import Logo from "@/components/ui/Logo";
import { parseConvexError } from "@/lib/errors";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useMutation(api.users.login);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter both your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation({ email: normalizedEmail, password });

      // Compare password on client side
      const isValid = await bcrypt.compare(password, result.hashedPassword);
      if (!isValid) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      login(
        {
          _id: result._id,
          name: result.name,
          email: result.email,
          role: result.role,
          createdAt: result.createdAt,
        },
        result.sessionToken
      );

      // Dynamic redirect based on role
      if (result.role === "admin") router.push("/admin");
      else if (result.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    } catch (err) {
      const message = parseConvexError(err, "Sign in failed. Please try again.");
      // Unify both "user not found" and "wrong password" under one friendly message
      if (/invalid email or password/i.test(message)) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[128px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
            <Logo size="lg" />
            <span className="text-xl font-semibold text-white">
              EduCatch<span className="text-violet-400"> Lite</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/6 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-400 transition-colors hover:text-violet-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
