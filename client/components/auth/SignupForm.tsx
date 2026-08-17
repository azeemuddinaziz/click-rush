"use client";

import { useAuth } from "@/hooks/useAuth";
import { SignupInput, signupSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gamepad2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function SignupForm() {
  const router = useRouter();
  const { signupMutation } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupInput) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="bg-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
          <UserPlus className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-white text-2xl font-bold">Create Account</h2>
        <p className="text-slate-400 text-sm mt-1">
          Join the leaderboard today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {signupMutation.isError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md">
            {(signupMutation.error as any).response?.data?.error ||
              "Registration failed. Username or email might be taken."}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Username
          </label>
          <input
            {...register("username")}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
            placeholder="speed_demon"
          />
          {errors.username && (
            <p className="text-xs text-red-400 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Confirm Password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {signupMutation.isPending ? "Creating Account..." : "Signup"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
        <span className="h-px bg-slate-800 flex-1"></span>
        <span className="px-4">OR</span>
        <span className="h-px bg-slate-800 flex-1"></span>
      </div>

      <button
        onClick={() => router.push("/")}
        className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Gamepad2 className="w-5 h-5 text-slate-400" />
        Play as Guest (Scores won't save)
      </button>

      <p className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-medium"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
