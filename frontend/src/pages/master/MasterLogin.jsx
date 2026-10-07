import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";

const masterLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Master email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Master password is required"),
});

export const MasterLogin = () => {
  const { masterLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/master/admins";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterLoginSchema),
    defaultValues: {
      email: "satyaranjan@gmail.com",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await masterLogin(data);
      navigate(from, { replace: true });
    } catch {
      // Error toasted in auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue("email", "satyaranjan@gmail.com");
    setValue("password", "Master@2026");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0b1329] text-white font-sans">
      <div className="max-w-md w-full space-y-7 bg-[#0f172a] p-8 sm:p-10 rounded-2xl border border-slate-800 shadow-2xl">
        {/* Master Badge Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 mb-1 border border-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Master Governance Console
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
            Master Access Login
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Authorized master credentials only. Master accounts hold platform governance and administrator auditing privileges.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Master Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="satyaranjan@gmail.com"
                className={`w-full bg-slate-900 text-white border ${
                  errors.email ? "border-rose-500 ring-rose-500/30" : "border-slate-700 focus:border-[#ed1d24]"
                } rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed1d24]/20 transition-all placeholder:text-slate-500`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={`w-full bg-slate-900 text-white border ${
                  errors.password ? "border-rose-500 ring-rose-500/30" : "border-slate-700 focus:border-[#ed1d24]"
                } rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed1d24]/20 transition-all placeholder:text-slate-500`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={ArrowRight}
            className="w-full mt-4 bg-[#ed1d24] hover:bg-[#d32f2f] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ed1d24]/25 border-0"
          >
            Authenticate as Master
          </Button>

          {/* Quick autofill helper for developer testing */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Autofill Seed Master Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterLogin;
