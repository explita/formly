"use client";

import React from "react";
import { z } from "zod";
import { useForm, Form } from "@explita/formly";
import { Input } from "./input";
import { Label } from "./label";
import {
  HardDrive,
  FileText,
  Check,
  RotateCcw,
  Trash2,
  Save,
} from "lucide-react";

const draftSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  tags: z.string().optional(),
});

export function DraftPersistenceExample() {
  const form = useForm({
    schema: draftSchema,
    defaultValues: { title: "", body: "", tags: "" },
    savedFormFirst: true,
    onSubmit: (_values, ctx) => {
      ctx.meta.set("submitted", true);
    },
    id: "formly-example-draft",
  });

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  function handleDiscard() {
    form.reset();
  }

  const isDirty = Object.keys(form.getChanges()).length > 0;

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-teal-500/30 dark:hover:border-teal-500/30 flex flex-col justify-between h-[500px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-teal-500 via-cyan-500 to-sky-500" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-teal-600 dark:text-teal-400">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Draft Editor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto-saves to localStorage
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-500/20">
              persistKey
            </span>
          </div>

          {/* Draft status badge */}
          <div className="flex items-center gap-2 mb-3">
            {isDirty ? (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 rounded-full px-2 py-0.5">
                <Save size={9} />
                Draft saved
              </div>
            )}
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              — persists across page reloads
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60 mb-4" />
        </div>

        {form.meta.get("submitted") ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <Check size={26} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Published!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Draft cleared from localStorage.
              </p>
            </div>
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left font-mono text-[11px] text-teal-600 dark:text-teal-300 space-y-1">
              <div>
                title:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.title}
                </span>
              </div>
              {form.values.tags && (
                <div>
                  tags:{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">
                    {form.values.tags}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} /> New Draft
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <form.Field
                name="title"
                render={(props) => (
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1.5">
                      <FileText size={11} className="text-slate-400" /> Title
                    </Label>
                    <Input
                      {...props}
                      placeholder="Post title..."
                      focusClassName="focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-500/30"
                    />
                  </div>
                )}
              />

              <form.Field
                name="body"
                render={(props) => (
                  <div className="space-y-1">
                    <Label>
                      Body
                    </Label>
                    <textarea
                      {...props}
                      rows={3}
                      placeholder="Write your content... (auto-saved as you type)"
                      className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200 resize-none focus:border-teal-500 dark:focus:border-teal-400"
                    />
                  </div>
                )}
              />

              <form.Field
                name="tags"
                render={(props) => (
                  <div className="space-y-1">
                    <Label>
                      Tags <span className="text-slate-400">(optional)</span>
                    </Label>
                    <Input
                      {...props}
                      placeholder="e.g. react, forms, typescript"
                      focusClassName="focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-500/30"
                    />
                  </div>
                )}
              />
            </div>

            <div className="flex gap-2">
              {isDirty && (
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 transition-all duration-200"
                >
                  <Trash2 size={12} /> Discard
                </button>
              )}
              <button
                type="submit"
                disabled={form.submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:from-teal-600/50 disabled:to-teal-500/50 text-white font-semibold text-sm rounded-lg py-2 shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all duration-200"
              >
                {form.submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={14} /> Publish
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
