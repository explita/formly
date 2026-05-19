"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, Form } from "@explita/formly";
import { Globe, MapPin, Check, RotateCcw, Loader2 } from "lucide-react";

const cascadingSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
});

// Mock async API calls for country-city mappings
const mockFetchCities = async (country: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Latency simulator
  if (country === "US") return ["New York", "San Francisco", "Chicago"];
  if (country === "CA") return ["Toronto", "Vancouver", "Montreal"];
  if (country === "UK") return ["London", "Manchester", "Birmingham"];
  return [];
};

export function CascadingFormExample() {
  const form = useForm({
    schema: cascadingSchema,
    defaultValues: {
      country: "",
      city: "",
    },
    // Define cascading dropdown mappings
    cascade: {
      city: {
        watch: ["country"],
        fn: async (values) => {
          if (!values.country) return [];
          return await mockFetchCities(values.country);
        },
      },
    },
    onSubmit: (values, ctx) => {
      console.log("Cascading values submitted:", values);
      ctx.meta.set("submitted", true);
    },
    id: "form-cascade",
  });

  const getCountryName = (code: string) => {
    if (code === "US") return "United States";
    if (code === "CA") return "Canada";
    if (code === "UK") return "United Kingdom";
    return code;
  };

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 flex flex-col justify-between h-[450px]">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-emerald-500 via-indigo-500 to-purple-500" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Globe size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Cascading Selector
                </h3>
                <p className="text-xs text-slate-505 dark:text-slate-400">
                  Reactive dynamic field loading
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              Cascade API
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60 mb-5" />
        </div>

        {form.meta.get("submitted") ? (
          /* Success Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <MapPin size={24} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-slate-100">
                Location Verified!
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                Sub-options fetched and validated smoothly.
              </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl p-4 text-center">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                {form.values.city}, {getCountryName(form.values.country)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-4 py-2 transition-all duration-200"
            >
              <RotateCcw size={12} />
              Reset Selection
            </button>
          </div>
        ) : (
          /* Active Dropdowns Screen */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Country Selection */}
              <form.Field
                name="country"
                render={(props, { onChange }) => (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Globe
                        size={12}
                        className="text-slate-400 dark:text-slate-550"
                      />
                      Country
                    </label>
                    <div className="relative">
                      <select
                        {...props}
                        onChange={(e) => {
                          onChange(e.target.value);
                          form.setValue("city", ""); // Reset dependent city when country changes
                        }}
                        className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 appearance-none focus:border-emerald-500 dark:focus:border-emerald-455"
                      >
                        <option
                          value=""
                          className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400"
                        >
                          -- Choose Country --
                        </option>
                        <option
                          value="US"
                          className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        >
                          United States
                        </option>
                        <option
                          value="CA"
                          className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        >
                          Canada
                        </option>
                        <option
                          value="UK"
                          className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                        >
                          United Kingdom
                        </option>
                      </select>
                      <span className="absolute right-3 top-3 pointer-events-none text-slate-500 text-[10px]">
                        ▼
                      </span>
                    </div>
                  </div>
                )}
              />

              {/* City Selection (Dependant on Country) */}
              <form.Field
                name="city"
                render={(props) => {
                  const isCityLoading = !!form.cascade.city?.isLoading;
                  const isCountrySelected = !!form.getValue("country");
 
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MapPin
                            size={12}
                            className="text-slate-400 dark:text-slate-550"
                          />
                          City
                        </label>
                        {isCityLoading && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <Loader2 size={10} className="animate-spin" />
                            Fetching...
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          {...props}
                          disabled={!isCountrySelected || isCityLoading}
                          className="w-full text-sm bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 appearance-none disabled:opacity-40 disabled:cursor-not-allowed focus:border-emerald-500 dark:focus:border-emerald-455"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400"
                          >
                            -- Choose City --
                          </option>
                          {(form.cascade.city?.data || []).map(
                            (city: string) => (
                              <option
                                key={city}
                                value={city}
                                className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                              >
                                {city}
                              </option>
                            ),
                          )}
                        </select>
                        <span className="absolute right-3 top-3 pointer-events-none text-slate-500 text-[10px]">
                          ▼
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm rounded-lg py-2.5 shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200"
            >
              <Check size={16} />
              Confirm Location
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
