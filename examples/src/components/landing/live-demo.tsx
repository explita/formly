"use client";

import React from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "../input";
import { Label } from "../label";
import { Check, Mail, User, Info, Activity } from "lucide-react";
//@ts-ignore
import DemoCode from "./demo-code.mdx";

const demoSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Enter a valid email address"),
});

export function LiveDemo() {
  const form = useForm({
    schema: demoSchema,
    defaultValues: {
      fullName: "",
      email: "",
    },
    onSubmit: (values) => {
      alert(`Submitted values:\n${JSON.stringify(values, null, 2)}`);
    },
    id: "live-landing-demo",
  });

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          See It In Action
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Clean syntax paired with peak rendering performance. Open your browser
          console to verify: inputs update directly without rendering the
          container layout.
        </p>
      </div>

      {/* Side-by-side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Simulated Code Editor */}
        <div className="lg:col-span-6 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 dark:border-slate-800 shadow-xl overflow-hidden h-[480px]">
          {/* Editor Tabs bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-400 font-semibold font-mono ml-2">
                MyForm.tsx
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              React TSX
            </span>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-y-auto text-left select-none nextra-scrollbar bg-slate-950 text-slate-300 p-4">
            <DemoCode />
          </div>
        </div>

        {/* Right Column: Live Interactive Demo */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-purple-500 to-indigo-500" />

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500 animate-pulse" />
                Live Formly Instance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submit and modify inputs below to inspect real-time form state
                parameters.
              </p>
              <hr className="border-slate-200 dark:border-slate-800/60 mt-3" />
            </div>

            <Form use={form} className="space-y-4" devTools={true}>
              <form.Field
                name="fullName"
                render={(props) => (
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      Full Name
                    </Label>
                    <Input
                      {...props}
                      placeholder="Enter your full name"
                      className="py-2 text-xs"
                    />
                  </div>
                )}
              />

              <form.Field
                name="email"
                render={(props) => (
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      Email Address
                    </Label>
                    <Input
                      {...props}
                      type="email"
                      placeholder="Enter your email"
                      className="py-2 text-xs"
                    />
                  </div>
                )}
              />

              <button
                type="submit"
                disabled={form.submitting}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-200 dark:disabled:from-slate-800 disabled:to-slate-300 disabled:text-slate-500 dark:disabled:text-slate-600 text-white font-bold text-xs rounded-xl py-2.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200"
              >
                <Check size={14} />
                Submit and View State
              </button>
            </Form>
          </div>

          {/* Form State notice card referencing DevTools */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-3 items-start animate-in fade-in duration-300">
            <Activity
              className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0"
              size={16}
            />
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Interactive DevTools Active!
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                Observe the floating{" "}
                <strong className="text-indigo-600 dark:text-indigo-400">
                  Formly DevTools
                </strong>{" "}
                bubble in the bottom-right corner! Type into the inputs above
                and notice how the DevTools track live dirty states, validate
                schema criteria, and register event changes with zero container
                component re-renders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
