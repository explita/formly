"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, Form } from "@explita/formly";
import { Input } from "./input";
import { Label } from "./label";
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

/**
 * CrossFieldCheckExample demonstrates custom error styling and layout.
 * 
 * By using `hideError={true}` on `<form.Field>`, we prevent the default 
 * automatic error message banner from rendering. We then use the callback 
 * context's `hasError` and `error` parameters to manually bind error states 
 * directly to input borders and custom error markup.
 */
export function CrossFieldCheckExample() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    schema: passwordSchema,
    defaultValues: { password: "", confirmPassword: "" },
    check: (values) => {
      if (
        values.password &&
        values.confirmPassword &&
        values.password !== values.confirmPassword
      ) {
        return { confirmPassword: "Passwords do not match" };
      }
      return {};
    },
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: "form-check",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  const password = (form.values.password as string) || "";
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[A-Z]/.test(password) &&
              /[0-9]/.test(password) &&
              /[^A-Za-z0-9]/.test(password)
            ? 4
            : 3;

  const strengthLabel = ["", "Weak", "Fair", "Strong", "Very Strong"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-400",
  ][strength];
  const strengthTextColor = [
    "",
    "text-red-400",
    "text-amber-400",
    "text-emerald-500",
    "text-emerald-400",
  ][strength];

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-amber-500/30 dark:hover:border-amber-500/30 flex flex-col justify-between h-[450px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-amber-500 via-orange-500 to-red-500" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Password Setup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cross-field check validation
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
              Check API
            </span>
          </div>
          <hr className="border-slate-200 dark:border-slate-800/60 mb-5" />
        </div>

        {form.meta.get("submitted") ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShieldCheck size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Password Set!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cross-field validation passed successfully.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center font-mono text-xs">
              <span className="text-slate-400 dark:text-slate-500">
                password:{" "}
              </span>
              <span className="text-slate-800 dark:text-slate-200">
                {"•".repeat(form.values.password.length)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <form.Field
                name="password"
                hideError={true}
                render={(props, { hasError, error }) => (
                  <div className="space-y-1.5">
                    <Label>
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...props}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        hasError={hasError}
                        className="pr-10"
                        focusClassName="focus:border-amber-500 dark:focus:border-amber-400 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= level ? strengthColor : "bg-slate-200 dark:bg-slate-800"}`}
                            />
                          ))}
                        </div>
                        <p
                          className={`text-[10px] font-medium ${strengthTextColor}`}
                        >
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                    {hasError && (
                      <p className="text-[11px] text-red-400 font-medium animate-in slide-in-from-top-1 duration-200">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              />

              <form.Field
                name="confirmPassword"
                hideError={true}
                render={(props, { hasError, error }) => (
                  <div className="space-y-1.5">
                    <Label>
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...props}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        hasError={hasError}
                        className="pr-10"
                        focusClassName="focus:border-amber-500 dark:focus:border-amber-400 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {hasError && (
                      <p className="text-[11px] text-red-400 font-medium animate-in slide-in-from-top-1 duration-200">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <button
              type="submit"
              disabled={form.submitting}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-amber-600/50 disabled:to-amber-500/50 text-white font-semibold text-sm rounded-lg py-2.5 shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all duration-200"
            >
              {form.submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} /> Set Password
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
