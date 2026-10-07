import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, Eye, EyeOff, Store, ArrowRight } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await registerAuth({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      navigate("/", { replace: true });
    } catch {
      // Error is toasted in auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#ed1d24] text-white shadow-md shadow-[#ed1d24]/20 mb-1">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Create an Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join EzzyShop for rapid checkout and order tracking
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Full Name"
            required
            type="text"
            placeholder="John Doe"
            leftIcon={User}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email Address"
            required
            type="email"
            placeholder="you@example.com"
            leftIcon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm Password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            leftIcon={Lock}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={ArrowRight}
            className="w-full mt-3 shadow-md shadow-[#ed1d24]/20 py-3.5 rounded-xl font-bold"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#ed1d24] hover:text-[#d32f2f] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
