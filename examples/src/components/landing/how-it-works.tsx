"use client";

import React from "react";
import { ScrollText, Layers, FormInput, ArrowDown } from "lucide-react";

const STEPS = [
  {
    icon: <ScrollText size={16} />,
    label: "Define Schema",
    code: `import { z } from "zod";\n\nconst schema = z.object({\n  email: z.string().email(),\n  age: z.number().min(18),\n});`,
    description: "Create a Zod schema describing your form data shape and validation rules.",
  },
  {
    icon: <Layers size={16} />,
    label: "Create Form",
    code: `const form = useForm({\n  schema,\n  defaultValues: { email: "", age: 18 },\n  onSubmit: (values) => api.submit(values),\n});`,
    description: "Call useForm with your schema and defaults. Returns a fully typed form controller.",
  },
  {
    icon: <FormInput size={16} />,
    label: "Render Fields",
    code: `<Form use={form}>\n  <form.Field name="email"\n    render={(props) => <Input {...props} />}\n  />\n</Form>`,
    description: "Render fields with the <Form> component. Each update targets only the changing input.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Three Steps to a Form
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Define your validation schema once, then wire it up with clean,
          type-safe components.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, index) => (
          <div key={index} className="relative flex flex-col">
            {index < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-8 left-[calc(50%+1.5rem)] w-[calc(100%-3rem)] h-px bg-linear-to-r from-violet-300 to-purple-300 dark:from-violet-700 dark:to-purple-700" />
            )}

            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 shadow-lg shadow-violet-500/20">
                <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-950">
                  {index + 1}
                </span>
                {step.icon}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {step.label}
              </h3>

              <div className="w-full bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-xl p-3 text-left">
                <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">
                  {step.code}
                </pre>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            {index < STEPS.length - 1 && (
              <div className="flex md:hidden justify-center py-2 text-slate-300 dark:text-slate-600">
                <ArrowDown size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
