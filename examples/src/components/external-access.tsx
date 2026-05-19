"use client";

import React from "react";
import { z } from "zod";
import { useForm, useFormById, Form } from "@explita/formly";
import { Input } from "./input";
import { Label } from "./label";
import {
  Activity,
  User,
  Mail,
  MessageSquare,
  Check,
  RotateCcw,
  Circle,
  CircleDot,
} from "lucide-react";

const FORM_ID = "form-external-access";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ─── This component lives OUTSIDE <Form/> ────────────────────────────────────
function FormMonitor() {
  // Access the form from anywhere by its ID — no Context, no prop drilling
  const form = useFormById<{
    name: string;
    email: string;
    message: string;
  }>(FORM_ID);

  if (!form) return null;

  const values = form.getValues();
  const errors = form.errors;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Live Monitor
        </span>
        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">
          id: {FORM_ID}
        </span>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { label: "Dirty", value: form.isDirty, color: "amber" },
            { label: "Valid", value: form.validated, color: "emerald" },
            { label: "Submitting", value: form.submitting, color: "violet" },
          ] as const
        ).map(({ label, value, color }) => (
          <div
            key={label}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200 ${
              value
                ? color === "amber"
                  ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
                  : color === "emerald"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400"
                : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
            }`}
          >
            {value ? <CircleDot size={8} /> : <Circle size={8} />}
            {label}
          </div>
        ))}
        {hasErrors && (
          <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400">
            <CircleDot size={8} />
            Errors ({Object.values(errors).filter(Boolean).length})
          </div>
        )}
      </div>

      {/* Live Values */}
      <div className="font-mono text-[10px] space-y-0.5 text-slate-500 dark:text-slate-400">
        {(["name", "email", "message"] as const).map((key) => (
          <div key={key} className="flex gap-1.5 truncate">
            <span className="text-violet-500 dark:text-violet-400 shrink-0">
              {key}:
            </span>
            <span className="text-slate-700 dark:text-slate-300 truncate">
              {String(values[key] || "").length > 0 ? (
                String(values[key])
              ) : (
                <span className="italic text-slate-300 dark:text-slate-600">
                  empty
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Example ─────────────────────────────────────────────────────────────
export function ExternalAccessExample() {
  const form = useForm({
    schema: contactSchema,
    defaultValues: { name: "", email: "", message: "" },
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: FORM_ID,
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-violet-500/30 dark:hover:border-violet-500/30 flex flex-col justify-between h-[500px]">
      <div>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-500" />

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Contact Form
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  External state access via{" "}
                  <code className="text-violet-500 dark:text-violet-400 font-mono text-[10px]">
                    useFormById
                  </code>
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20">
              Registry
            </span>
          </div>
          <hr className="border-slate-200 dark:border-slate-800/60 mb-3" />
        </div>

        {!!form.meta.get("submitted") && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <Check size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Message Sent!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The monitor component read state without any prop drilling.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        )}

        {!form.meta.get("submitted") && (
          <div className="flex-1 flex flex-col justify-between space-y-2.5">
            {/* <Form> wraps only the fields + submit — FormMonitor is a sibling OUTSIDE */}
            <Form use={form}>
              <div className="space-y-2">
                {/* Name */}
                <form.Field
                  name="name"
                  render={(props) => (
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1.5">
                        <User size={11} className="text-slate-400" /> Name
                      </Label>
                      <Input
                        {...props}
                        placeholder="e.g. Jane Doe"
                        focusClassName="focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/30"
                      />
                    </div>
                  )}
                />

                {/* Email */}
                <form.Field
                  name="email"
                  render={(props) => (
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-400" /> Email
                      </Label>
                      <Input
                        {...props}
                        type="email"
                        placeholder="e.g. jane@example.com"
                        focusClassName="focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-500/30"
                      />
                    </div>
                  )}
                />

                {/* Message */}
                <form.Field
                  name="message"
                  render={(props) => (
                    <div className="space-y-1">
                      <Label className="flex items-center gap-1.5">
                        <MessageSquare size={11} className="text-slate-400" />{" "}
                        Message
                      </Label>
                      <textarea
                        {...props}
                        rows={2}
                        placeholder="Write something..."
                        className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 resize-none focus:border-violet-500 dark:focus:border-violet-400"
                      />
                    </div>
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={form.submitting}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-600/50 disabled:to-indigo-600/50 text-white font-semibold text-sm rounded-lg py-2 shadow-lg shadow-violet-500/10 active:scale-[0.98] transition-all duration-200"
              >
                {form.submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} /> Send Message
                  </>
                )}
              </button>
            </Form>

            {/* FormMonitor is OUTSIDE <Form/> — accesses state purely via useFormById registry */}
            <FormMonitor />
          </div>
        )}
      </div>
    </div>
  );
}
