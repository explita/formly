"use client";

import React from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "./input";
import { Label } from "./label";
import {
  AtSign,
  User,
  Check,
  RotateCcw,
  Loader2,
  ShieldCheck,
  CircleX,
  CircleCheck,
} from "lucide-react";

const asyncSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
});

// Simulated server checks
const takenUsernames = ["alice", "bob", "admin", "root", "test"];
const takenEmails = ["alice@example.com", "bob@example.com"];

const checkUsername = async (value: string): Promise<string | null> => {
  await new Promise((r) => setTimeout(r, 700));
  return takenUsernames.includes(value.toLowerCase())
    ? "Username is already taken"
    : null;
};

const checkEmail = async (value: string): Promise<string | null> => {
  await new Promise((r) => setTimeout(r, 900));
  return takenEmails.includes(value.toLowerCase())
    ? "Email is already registered"
    : null;
};

export function AsyncValidationExample() {
  const form = useForm({
    schema: asyncSchema,
    defaultValues: { username: "", email: "" },
    asyncValidate: {
      username: {
        debounce: 600,
        fn: checkUsername,
      },
      email: {
        debounce: 600,
        fn: checkEmail,
      },
    },
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: "form-async",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  const usernameValidating = form.validatingFields.username;
  const emailValidating = form.validatingFields.email;

  const getFieldStatus = (name: "username" | "email") => {
    const isValidating = form.validatingFields[name];
    const hasError = !!form.errors[name];
    const value = form.values[name] as string;
    const isDirty = value?.length >= 3;
    if (isValidating) return "validating";
    if (!isDirty) return "idle";
    if (hasError) return "error";
    return "ok";
  };

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-violet-500/30 dark:hover:border-violet-500/30 flex flex-col justify-between h-[450px]">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400">
                <AtSign size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Availability Check
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Debounced async field validation
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20">
              Async API
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
                Account Reserved!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Both fields passed server-side uniqueness checks.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-violet-600 dark:text-violet-300 space-y-1">
              <div>
                username:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.username}
                </span>
              </div>
              <div>
                email:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} />
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Username */}
              <form.Field
                name="username"
                render={(props) => {
                  const status = getFieldStatus("username");
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5">
                          <User
                            size={12}
                            className="text-slate-400 dark:text-slate-500"
                          />
                          Username
                        </Label>
                        {status === "validating" && (
                          <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium">
                            <Loader2 size={10} className="animate-spin" />
                            Checking...
                          </span>
                        )}
                        {status === "ok" && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                            <CircleCheck size={11} />
                            Available
                          </span>
                        )}
                        {status === "error" && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                            <CircleX size={11} />
                            Taken
                          </span>
                        )}
                      </div>
                      <Input
                        {...props}
                        placeholder="e.g. jane_dev (try: alice, bob)"
                        className={
                          status === "ok"
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : ""
                        }
                        focusClassName={
                          status !== "ok"
                            ? "focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/30"
                            : undefined
                        }
                      />
                    </>
                  );
                }}
              />

              {/* Email */}
              <form.Field
                name="email"
                render={(props) => {
                  const status = getFieldStatus("email");
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5">
                          <AtSign
                            size={12}
                            className="text-slate-400 dark:text-slate-500"
                          />
                          Email Address
                        </Label>
                        {status === "validating" && (
                          <span className="flex items-center gap-1 text-[10px] text-violet-500 font-medium">
                            <Loader2 size={10} className="animate-spin" />
                            Checking...
                          </span>
                        )}
                        {status === "ok" && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                            <CircleCheck size={11} />
                            Available
                          </span>
                        )}
                        {status === "error" && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
                            <CircleX size={11} />
                            Registered
                          </span>
                        )}
                      </div>
                      <Input
                        {...props}
                        type="email"
                        placeholder="e.g. jane@dev.com (try: alice@example.com)"
                        className={
                          status === "ok"
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : ""
                        }
                        focusClassName={
                          status !== "ok"
                            ? "focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/30"
                            : undefined
                        }
                      />
                    </>
                  );
                }}
              />

              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                Tip: type "alice", "bob", or "alice@example.com" to see taken
                errors.
              </p>
            </div>

            <button
              type="submit"
              disabled={form.submitting || form.isValidating}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:from-violet-600/50 disabled:to-violet-500/50 text-white font-semibold text-sm rounded-lg py-2.5 shadow-lg shadow-violet-500/10 active:scale-[0.98] transition-all duration-200"
            >
              {form.submitting || usernameValidating || emailValidating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  Reserve Account
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
