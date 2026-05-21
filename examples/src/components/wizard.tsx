"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "./input";
import { Label } from "./label";
import {
  Sparkles,
  User,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

const wizardSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be at least 18 years old"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(5, "ZIP code must be 5 digits"),
  agreed: z.boolean().refine((v) => v, {
    error: (ctx) => (!ctx.value ? "You must accept the terms" : undefined),
  }),
});

export function WizardFormExample() {
  const form = useForm({
    schema: wizardSchema,
    defaultValues: {
      fullName: "",
      age: 18,
      city: "",
      zipCode: "",
      agreed: false,
    },
    // Define wizard step constraints
    steps: [
      ["fullName", "age"], // Step 0
      ["city", "zipCode"], // Step 1
      ["agreed"], // Step 2
    ],
    onSubmit: (values, ctx) => {
      console.log("Wizard fully completed!", values);
      ctx.meta.set("submitted", true);
    },
    id: "form-wizard",
  });

  const { current, isFirst, isLast, next, prev } = form.steps;

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await next();
    if (!isValid) {
      console.log("Step validation failed");
    }
  };

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  const stepLabels = ["Profile", "Address", "Confirm"];

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 flex flex-col justify-between h-[450px]">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-pink-500 via-indigo-500 to-emerald-500" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-55 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 text-pink-650 dark:text-pink-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Checkout Wizard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step layout & validations
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-55 dark:bg-pink-500/10 text-pink-650 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
              Wizard API
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60 mb-4" />
        </div>

        {form.meta.get("submitted") ? (
          /* Final Completion Success Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShieldCheck size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Registration Complete!
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                Wizard verified step constraints beautifully.
              </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-855 rounded-xl p-3 text-left font-mono text-[11px] text-indigo-650 dark:text-indigo-300 grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                Name:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.fullName}
                </span>
              </div>
              <div>
                Age:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.age}
                </span>
              </div>
              <div>
                City:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.city}
                </span>
              </div>
              <div>
                ZIP:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.zipCode}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} />
              Reset Wizard
            </button>
          </div>
        ) : (
          /* Interactive Step Form Panel */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Custom Premium Wizard Step Tracker */}
            <div className="flex items-center justify-between px-2">
              {stepLabels.map((label, stepIdx) => {
                const isActive = current === stepIdx;
                const isCompleted = current > stepIdx;
                return (
                  <div
                    key={stepIdx}
                    className="flex items-center flex-1 last:flex-initial"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                          isActive
                            ? "bg-pink-500 border-pink-400 text-white shadow-md shadow-pink-500/25 scale-105"
                            : isCompleted
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {isCompleted ? <Check size={10} /> : stepIdx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-medium hidden sm:inline ${
                          isActive
                            ? "text-slate-900 dark:text-slate-100 font-bold"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {stepIdx < stepLabels.length - 1 && (
                      <div
                        className={`h-px flex-1 mx-3 transition-colors duration-300 ${
                          isCompleted
                            ? "bg-emerald-500/30"
                            : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Steps Container Area */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Step 1: Personal Info */}
              {current === 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250">
                  <form.Field
                    name="fullName"
                    render={(props) => (
                      <>
                        <Label className="text-[11px] flex items-center gap-1.5">
                          <User
                            size={11}
                            className="text-slate-400 dark:text-slate-500"
                          />
                          Full Name
                        </Label>
                        <Input
                          {...props}
                          placeholder="e.g. Jane Doe"
                          className="text-xs py-1.5"
                          focusClassName="focus:border-pink-500 dark:focus:border-pink-400 focus:ring-pink-500/30"
                        />
                      </>
                    )}
                  />

                  <form.Field
                    name="age"
                    render={(props, { onChange }) => (
                      <>
                        <Label className="text-[11px]">Age</Label>
                        <Input
                          {...props}
                          type="number"
                          onChange={(e) => onChange(Number(e.target.value))}
                          className="text-xs py-1.5"
                          focusClassName="focus:border-pink-500 dark:focus:border-pink-400 focus:ring-pink-500/30"
                        />
                      </>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Address Info */}
              {current === 1 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250">
                  <form.Field
                    name="city"
                    render={(props) => (
                      <>
                        <Label className="text-[11px] flex items-center gap-1.5">
                          <MapPin
                            size={11}
                            className="text-slate-400 dark:text-slate-550"
                          />
                          City
                        </Label>
                        <Input
                          {...props}
                          placeholder="e.g. San Francisco"
                          className="text-xs py-1.5"
                          focusClassName="focus:border-pink-500 dark:focus:border-pink-400 focus:ring-pink-500/30"
                        />
                      </>
                    )}
                  />

                  <form.Field
                    name="zipCode"
                    render={(props) => (
                      <>
                        <Label className="text-[11px]">ZIP Code</Label>
                        <Input
                          {...props}
                          placeholder="e.g. 94103"
                          className="text-xs py-1.5"
                          focusClassName="focus:border-pink-500 dark:focus:border-pink-400 focus:ring-pink-500/30"
                        />
                      </>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Terms Agreement */}
              {current === 2 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-3 duration-250">
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                      Almost there!
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                      Confirming registrations requires that you review the
                      profile and address coordinates. All operations are
                      safe-checked on step boundaries.
                    </p>

                    <form.Field
                      name="agreed"
                      render={(props, { value, onChange }) => (
                        <>
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              {...props}
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) => onChange(e.target.checked)}
                              className="mt-0.5 rounded border-slate-200 dark:border-slate-800 text-pink-500 focus:ring-pink-550/30"
                            />
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 leading-normal">
                              I accept terms and verify that all details
                              provided are correct.
                            </span>
                          </label>
                        </>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Actions Footer */}
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
                >
                  <ArrowLeft size={13} />
                  Back
                </button>
              )}

              {!isLast ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-semibold text-xs rounded-lg py-2 shadow-lg shadow-pink-500/10 active:scale-[0.98] transition-all duration-200"
                >
                  Continue
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={form.submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs rounded-lg py-2 shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200"
                >
                  {form.submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={13} />
                      Complete Checkout
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
