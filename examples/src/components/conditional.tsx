"use client";

import React from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "./input";
import { Label } from "./label";
import {
  Layers,
  User,
  Building,
  Check,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const conditionalSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  fullName: z.string().min(1, "Full name is required"),
  // Personal only
  dateOfBirth: z.string().optional(),
  // Business only
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  employeeCount: z.string().optional(),
});

export function ConditionalExample() {
  const form = useForm({
    schema: conditionalSchema,
    defaultValues: {
      accountType: "personal",
      fullName: "",
      dateOfBirth: "",
      companyName: "",
      taxId: "",
      employeeCount: "",
    },
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: "form-conditional",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  const accountType = form.watch("accountType");
  const isBusiness = accountType === "business";

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-rose-500/30 dark:hover:border-rose-500/30 flex flex-col justify-between h-[500px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-rose-500 via-fuchsia-500 to-violet-500" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Account Setup
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Conditional field visibility
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
              watch()
            </span>
          </div>
          <hr className="border-slate-200 dark:border-slate-800/60 mb-4" />
        </div>

        {form.meta.get("submitted") ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShieldCheck size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Account Created!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBusiness ? "Business" : "Personal"} account configured.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-rose-600 dark:text-rose-300 space-y-1">
              <div>
                type:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.accountType}
                </span>
              </div>
              <div>
                name:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.fullName}
                </span>
              </div>
              {isBusiness && form.values.companyName && (
                <div>
                  company:{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {form.values.companyName}
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
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              {/* Account Type Toggle */}
              <form.Field
                name="accountType"
                render={(props, { value, onChange }) => (
                  <>
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["personal", "business"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            onChange(type);
                            // Clear fields that don't apply
                            if (type === "personal") {
                              form.setValues({
                                companyName: "",
                                taxId: "",
                                employeeCount: "",
                              });
                            } else {
                              form.setValue("dateOfBirth", "");
                            }
                          }}
                          className={`flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg border transition-all duration-200 ${
                            value === type
                              ? "bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-500/20"
                              : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300 dark:hover:border-rose-500/30"
                          }`}
                        >
                          {type === "personal" ? (
                            <User size={12} />
                          ) : (
                            <Building size={12} />
                          )}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              />

              {/* Full Name - always visible */}
              <form.Field
                name="fullName"
                render={(props) => (
                  <>
                    <Label>Full Name</Label>
                    <Input
                      {...props}
                      placeholder="Your legal name"
                      focusClassName="focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-500/30"
                    />
                  </>
                )}
              />

              {/* Personal fields */}
              {!isBusiness && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <form.Field
                    name="dateOfBirth"
                    render={(props) => (
                      <>
                        <Label>Date of Birth</Label>
                        <Input
                          {...props}
                          type="date"
                          focusClassName="focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </>
                    )}
                  />
                </div>
              )}

              {/* Business fields */}
              {isBusiness && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <form.Field
                    name="companyName"
                    render={(props) => (
                      <>
                        <Label>Company Name</Label>
                        <Input
                          {...props}
                          placeholder="Acme Corp"
                          focusClassName="focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-500/30"
                        />
                      </>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <form.Field
                      name="taxId"
                      render={(props) => (
                        <>
                          <Label>Tax ID</Label>
                          <Input
                            {...props}
                            placeholder="EIN / VAT"
                            focusClassName="focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-500/30"
                          />
                        </>
                      )}
                    />
                    <form.Field
                      name="employeeCount"
                      render={(props) => (
                        <>
                          <Label>Employees</Label>
                          <select
                            {...props}
                            className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-rose-500 dark:focus:border-rose-400 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 appearance-none"
                          >
                            <option value="">Select</option>
                            <option value="1-10">1–10</option>
                            <option value="11-50">11–50</option>
                            <option value="51-200">51–200</option>
                            <option value="200+">200+</option>
                          </select>
                        </>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={form.submitting}
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:from-rose-600/50 disabled:to-rose-500/50 text-white font-semibold text-sm rounded-lg py-2 shadow-lg shadow-rose-500/10 active:scale-[0.98] transition-all duration-200"
            >
              {form.submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={14} /> Create Account
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
