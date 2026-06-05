import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Zap, ArrowRight, Building2, ShoppingCart, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import type { UserRole } from "@/types";

const steps = [
  { label: "Role", desc: "Choose your role" },
  { label: "Business", desc: "Company details" },
  { label: "Security", desc: "Password & OTP" },
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "buyer" },
  });

  const nextStep = async () => {
    const fields: (keyof RegisterInput)[][] = [
      ["role"],
      ["businessName", "contactName", "email", "mobile", "gstin"],
      ["password", "confirmPassword"],
    ];
    const valid = await trigger(fields[step] as any);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: RegisterInput) => {
    await new Promise((r) => setTimeout(r, 1000));
    navigate("/otp");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">O3 Procurement</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join 2000+ businesses on O3</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-100 text-slate-400"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === step ? "text-indigo-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${i < step ? "bg-indigo-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Select your role</h2>
                <p className="text-sm text-slate-500 mb-6">How will you use O3?</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "buyer", label: "Buyer", icon: ShoppingCart, desc: "Source chemicals from verified suppliers" },
                    { value: "supplier", label: "Supplier", desc: "List your products and receive RFQs", icon: Building2 },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedRole(value as UserRole)}
                      className={`p-5 rounded-xl border-2 text-left transition-all ${
                        selectedRole === value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${selectedRole === value ? "text-indigo-600" : "text-slate-400"}`} />
                      <p className={`font-semibold text-sm ${selectedRole === value ? "text-indigo-700" : "text-slate-700"}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Business Information</h2>
                <p className="text-sm text-slate-500 mb-6">Tell us about your company</p>
                <div className="space-y-4">
                  {[
                    { name: "businessName", label: "Business Name", placeholder: "Hindustan Paints Ltd" },
                    { name: "contactName", label: "Contact Name", placeholder: "Arjun Malhotra" },
                    { name: "email", label: "Email Address", placeholder: "arjun@hplpaints.com", type: "email" },
                    { name: "mobile", label: "Mobile Number", placeholder: "9812345678" },
                    { name: "gstin", label: "GSTIN", placeholder: "27AABHP1234A1Z2" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        {...register(field.name as keyof RegisterInput)}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {errors[field.name as keyof RegisterInput] && (
                        <p className="text-xs text-rose-500 mt-1">
                          {errors[field.name as keyof RegisterInput]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Set Password</h2>
                <p className="text-sm text-slate-500 mb-6">Create a secure password for your account</p>
                <div className="space-y-4">
                  {[
                    { name: "password", label: "Password" },
                    { name: "confirmPassword", label: "Confirm Password" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          {...register(field.name as keyof RegisterInput)}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors[field.name as keyof RegisterInput] && (
                        <p className="text-xs text-rose-500 mt-1">
                          {errors[field.name as keyof RegisterInput]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Back
                </button>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
