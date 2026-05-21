"use client";

import React from "react";
import { z } from "zod";
import { Form, useForm } from "@/dist";
import { Input } from "./input";
import { Label } from "./label";
import {
  Receipt,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Item name is required"),
        price: z.coerce.number().min(0.01, "Price must be greater than zero"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

const schema = { title: "", price: 0, quantity: 1 };

export function NestedArrayFormExample() {
  const form = useForm({
    schema: orderSchema,
    defaultValues: {
      customerName: "",
      notes: "",
      items: [schema],
    },
    computed: {
      // Automatically calculate invoice totals dynamically in real-time!
      totals: {
        fn: (values) => {
          const subtotal = (values.items || []).reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return sum + price * qty;
          }, 0);
          const tax = subtotal * 0.08; // 8% sales tax
          const total = subtotal + tax;
          return { subtotal, tax, total };
        },
        deps: ["items"],
      },
    },
    onSubmit: (values, ctx) => {
      console.log("Submitting Order payload:", values);
      ctx.meta.set("submitted", true);
    },
    id: "form-nested-array",
  });

  const items = form.array("items");
  const totals = form.watch("totals");

  function handleReset() {
    form.reset();
    form.meta.delete("submitted");
  }

  return (
    <Form use={form}>
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 flex flex-col justify-between h-[450px]">
        {/* Decorative Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-purple-500 via-pink-500 to-indigo-500" />

        {/* Card Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  Invoice Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Computed items & dynamic arrays
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20">
              Computed API
            </span>
          </div>

          <hr className="border-slate-200 dark:border-slate-800/60 mb-3" />
        </div>

        {form.meta.get("submitted") ? (
          /* Checkout Complete Receipt Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShoppingBag size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Order Placed Successfully!
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Client:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {form.values.customerName}
                </span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-left text-xs font-mono space-y-1 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-1.5">
                <span>ITEM ({form.values.items.length})</span>
                <span>SUBTOTAL</span>
              </div>
              <div className="max-h-[60px] overflow-y-auto space-y-1 pr-1 text-[11px]">
                {form.values.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[150px]">
                      {item.title || "Untitled Item"} (x{item.quantity})
                    </span>
                    <span>
                      ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-850 pt-1.5 mt-1.5 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-500">
                  <span>Sales Tax (8%):</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-600 dark:text-indigo-400 text-xs border-t border-dashed border-slate-200 dark:border-slate-800 pt-1">
                  <span>TOTAL:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/50 rounded-lg px-3 py-1.5 transition-all duration-200"
            >
              <RotateCcw size={12} />
              New Invoice
            </button>
          </div>
        ) : (
          /* Active Line Items Array Form Screen */
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              {/* Customer Name */}
              <form.Field
                name="customerName"
                render={(props) => (
                  <>
                    <Label className="text-[11px] font-semibold">
                      Customer Name
                    </Label>
                    <Input
                      {...props}
                      placeholder="e.g. John Doe"
                      className="text-xs py-1.5"
                      focusClassName="focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/30"
                    />
                  </>
                )}
              />

              {/* Dynamic Order Line Items */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-semibold">
                    Line Items
                  </Label>
                  <button
                    type="button"
                    onClick={() => items.push(schema)}
                    className="flex items-center gap-1 text-[10px] bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-650 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 rounded px-2 py-0.5 font-bold transition-all duration-200"
                  >
                    <Plus size={10} />
                    Add Item
                  </button>
                </div>

                {/* Styled Scrollable list to keep layout tightly within cards */}
                <div className="max-h-[110px] overflow-y-auto space-y-2 pr-1 border border-slate-200 dark:border-slate-800/40 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-950/20">
                  {items.value.map((_, index) => (
                    <div
                      key={items.keys[index]}
                      className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-200"
                    >
                      <div className="flex-1">
                        <form.Field
                          name={`items.${index}.title`}
                          hideError={true}
                          render={(props) => (
                            <Input
                              {...props}
                              placeholder="Item title"
                              className="text-[11px] px-2 py-1 bg-white dark:bg-slate-950"
                              focusClassName="focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/30"
                            />
                          )}
                        />
                      </div>
                      <div className="w-[65px]">
                        <form.Field
                          name={`items.${index}.price`}
                          transform={Number}
                          // hideError={true}
                          render={(props) => (
                            <Input
                              {...props}
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              className="text-[11px] px-2 py-1 bg-white dark:bg-slate-950 text-right"
                              focusClassName="focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/30"
                            />
                          )}
                        />
                      </div>
                      <div className="w-[45px]">
                        <form.Field
                          name={`items.${index}.quantity`}
                          hideError={true}
                          render={(props) => (
                            <Input
                              {...props}
                              type="number"
                              placeholder="Qty"
                              className="text-[11px] px-2 py-1 bg-white dark:bg-slate-950 text-center"
                              focusClassName="focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/30"
                            />
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (items.length > 1) {
                            items.remove(index);
                          }
                        }}
                        disabled={items.length <= 1}
                        className="text-slate-450 dark:text-slate-500 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-450 transition-all duration-200"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Receipt calculation table */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-xl p-2.5 space-y-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  ${totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  ${totals.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-indigo-650 dark:text-indigo-400 text-xs border-t border-slate-200 dark:border-slate-800/80 pt-1 mt-1">
                <span>Grand Total:</span>
                <span className="drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  ${totals.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold text-sm rounded-lg py-2 shadow-lg shadow-purple-500/10 active:scale-[0.98] transition-all duration-200"
            >
              <Check size={14} />
              Submit Invoice Order
            </button>
          </div>
        )}
      </div>
    </Form>
  );
}
