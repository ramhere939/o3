import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Zap, ArrowRight, Building2, ShoppingCart, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useApp } from "@/context/AppContext";
import type { UserRole } from "@/types";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { setRole } = useApp();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: "buyer" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginInput) => {
    await new Promise((r) => setTimeout(r, 800));
    setRole(data.role as UserRole);
    navigate(data.role === "buyer" ? "/buyer/catalog" : "/supplier/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left panel */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">O3</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-4">
              India's Smart Chemical Procurement Platform
            </h1>
            <p className="text-indigo-200 text-base">
              Connect with verified suppliers, compare quotes intelligently, and manage your chemical procurement end-to-end.
            </p>
          </div>
          <div className="space-y-4 mt-8">
            {[
              { stat: "2,000+", label: "Verified Suppliers" },
              { stat: "50,000+", label: "Products Listed" },
              { stat: "₹500Cr+", label: "Transactions Facilitated" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                <span className="text-white font-semibold">{item.stat}</span>
                <span className="text-indigo-200 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white p-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-8">Sign in to your O3 account</p>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { value: "buyer", label: "Buyer", icon: ShoppingCart },
                { value: "supplier", label: "Supplier", icon: Building2 },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("role", value as UserRole)}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    selectedRole === value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
              <a
                href={import.meta.env.VITE_ADMIN_URL || "https://o3-eqzc.vercel.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-slate-300 transition-all text-sm font-medium hover:bg-slate-50"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </a>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">
                Create account
              </Link>
            </p>

            {/* Demo hint */}
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">Demo Mode</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Use any email & password. Select Buyer or Supplier to explore different portals.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
