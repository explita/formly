"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, Form } from "@explita/formly";
import { Input } from "./input";
import { Label } from "./label";
import { User, Mail, Check, RotateCcw, ShieldCheck } from "lucide-react";

// 1. Define the validation schema using Zod
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  newsletter: z.boolean().default(false),
});

export function BasicFormExample() {
  // 2. Initialize the Formly controller
  const form = useForm({
    schema: profileSchema,
    defaultValues: {
      username: "",
      email: "",
      newsletter: false,
    },
    onSubmit: (values, ctx) => {
      console.log("Form successfully submitted:", values);
      ctx.meta.set("submitted", true);
    },
    errorParser: (message) => {
      return message.charAt(0).toUpperCase() + message.slice(1);
    },
    id: "form-basic",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 flex flex-col justify-between h-[450px]">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Update Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type-safe validation using Zod
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              Basic Hook
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60 mb-5" />
        </div>

        {form.meta.get("submitted") ? (
          /* Success Presentation Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShieldCheck size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Profile Updated!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data reactively passed to the onSubmit handler.
              </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-850 rounded-xl p-3 text-left">
              <pre className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 overflow-x-auto">
                {JSON.stringify(form.getValues(), null, 2)}
              </pre>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} />
              Reset Form
            </button>
          </div>
        ) : (
          /* Active Form Screen */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Username Input Field */}
              <form.Field
                name="username"
                render={(props) => (
                  <div className="space-y-1.5">
                    <Label>
                      <User
                        size={12}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      Username
                    </Label>
                    <Input {...props} placeholder="e.g. alex_developer" />
                  </div>
                )}
              />

              {/* Email Input Field */}
              <form.Field
                name="email"
                render={(props) => (
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <Mail
                        size={12}
                        className="text-slate-400 dark:text-slate-500"
                      />
                      Email Address
                    </Label>
                    <Input
                      {...props}
                      type="email"
                      placeholder="e.g. alex@example.com"
                    />
                  </div>
                )}
              />

              {/* Newsletter Toggle Switch (Subtle micro-interaction) */}
              <form.Field
                name="newsletter"
                render={(props, { value, onChange }) => (
                  <label className="flex items-center justify-between cursor-pointer group py-1.5">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      Subscribe to Newsletter
                    </span>
                    <div className="relative">
                      <input
                        {...props}
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-9 h-5 rounded-full transition-colors duration-250 ${
                          value
                            ? "bg-indigo-500"
                            : "bg-slate-200 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all duration-250 shadow-md ${
                            value ? "right-1" : "left-1"
                          }`}
                        />
                      </div>
                    </div>
                  </label>
                )}
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={form.submitting}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-indigo-600/50 disabled:to-indigo-500/50 text-white font-semibold text-sm rounded-lg py-2.5 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all duration-200"
            >
              {form.submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
