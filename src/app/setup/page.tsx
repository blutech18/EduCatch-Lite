"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import bcrypt from "bcryptjs";
import { ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function SetupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const createAdmin = useMutation(api.users.createInitialAdmin);
  const adminExists = useQuery(api.admin.adminExists);

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If admin already exists, redirect to login
  if (adminExists === true) {
    router.push("/login");
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const result = await createAdmin({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: hashedPassword,
      });

      login(
        {
          _id: result.userId,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: "admin",
          createdAt: Date.now(),
        },
        result.sessionToken
      );

      router.push("/admin");
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-600/10 blur-[128px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Initial Setup</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create the first admin account to get started
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <ShieldCheck className="h-3 w-3" /> One-time setup — page locks after admin is created
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {globalError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {globalError}
              </div>
            )}

            <Input
              label="Admin Name"
              type="text"
              placeholder="System Administrator"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@school.edu"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              error={errors.email}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              error={errors.password}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Create Admin Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already set up?{" "}
            <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
