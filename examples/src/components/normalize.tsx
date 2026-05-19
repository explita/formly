"use client";

import React from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "./input";
import { Label } from "./label";
import {
  SlidersHorizontal,
  Phone,
  CreditCard,
  Check,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const normalizeSchema = z.object({
  phone: z.string().min(14, "Enter a valid US phone number"),
  card: z.string().min(19, "Enter a valid 16-digit card number"),
  coupon: z.string().optional(),
});

// Format: (123) 456-7890
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Format: 1234 5678 9012 3456
function formatCard(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function NormalizeExample() {
  const form = useForm({
    schema: normalizeSchema,
    defaultValues: { phone: "", card: "", coupon: "" },
    normalize: {
      phone: formatPhone,
      card: formatCard,
      coupon: (value) => value?.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    },
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: "form-normalize",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-sky-500/30 dark:hover:border-sky-500/30 flex flex-col justify-between h-[500px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-sky-500 via-blue-500 to-indigo-500" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400">
                <SlidersHorizontal size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Payment Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto-masking via normalize
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
              normalize
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
                Payment Confirmed!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fields were masked automatically on input.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-sky-600 dark:text-sky-300 space-y-1">
              <div>
                phone:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.phone}
                </span>
              </div>
              <div>
                card:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  •••• •••• •••• {(form.values.card as string).slice(-4)}
                </span>
              </div>
              {form.values.coupon && (
                <div>
                  coupon:{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {form.values.coupon}
                  </span>
                </div>
              )}
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
                name="phone"
                render={(props) => (
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400" /> Phone
                      Number
                    </Label>
                    <Input
                      {...props}
                      placeholder="(555) 000-0000"
                      inputMode="numeric"
                      className="font-mono tracking-wide"
                      focusClassName="focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500/30"
                    />
                  </div>
                )}
              />

              <form.Field
                name="card"
                render={(props) => (
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <CreditCard size={11} className="text-slate-400" /> Card
                      Number
                    </Label>
                    <Input
                      {...props}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="font-mono tracking-widest"
                      focusClassName="focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500/30"
                    />
                  </div>
                )}
              />

              <form.Field
                name="coupon"
                render={(props) => (
                  <div className="space-y-1.5">
                    <Label>
                      Coupon Code{" "}
                      <span className="text-slate-400">(auto-uppercased)</span>
                    </Label>
                    <Input
                      {...props}
                      placeholder="e.g. SAVE20"
                      className="font-mono tracking-widest uppercase"
                      focusClassName="focus:border-sky-500 dark:focus:border-sky-400 focus:ring-sky-500/30"
                    />
                  </div>
                )}
              />
            </div>

            <button
              type="submit"
              disabled={form.submitting}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:from-sky-600/50 disabled:to-sky-500/50 text-white font-semibold text-sm rounded-lg py-2.5 shadow-lg shadow-sky-500/10 active:scale-[0.98] transition-all duration-200"
            >
              {form.submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} /> Pay Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
