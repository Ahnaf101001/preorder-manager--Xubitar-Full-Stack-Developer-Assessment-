"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preorder } from "@/types";

interface PreorderFormProps {
  initial?: Partial<Preorder>;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

type FormData = {
  name: string;
  products: number;
  preorder_when: string;
  starts_at: string;
  ends_at: string;
  status: boolean;
};

function toLocalDatetimeValue(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  // Format to yyyy-MM-ddTHH:mm for datetime-local input
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PreorderForm({ initial, onSubmit, loading }: PreorderFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name || "");
  const [products, setProducts] = useState(initial?.products ?? 1);
  const [preorderWhen, setPreorderWhen] = useState(initial?.preorder_when || "regardless-of-stock");
  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(initial?.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(initial?.ends_at));
  const [status, setStatus] = useState(initial?.status !== undefined ? initial.status === 1 : true);
  const [errors, setErrors] = useState<{ name?: string; startsAt?: string }>({});

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setProducts(initial.products ?? 1);
      setPreorderWhen(initial.preorder_when || "regardless-of-stock");
      setStartsAt(toLocalDatetimeValue(initial.starts_at));
      setEndsAt(toLocalDatetimeValue(initial.ends_at));
      setStatus(initial.status !== undefined ? initial.status === 1 : true);
    }
  }, [initial?.id]); // eslint-disable-line

  const validate = () => {
    const errs: { name?: string; startsAt?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!startsAt) errs.startsAt = "Start date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      products,
      preorder_when: preorderWhen,
      starts_at: startsAt ? new Date(startsAt).toISOString() : "",
      ends_at: endsAt ? new Date(endsAt).toISOString() : "",
      status,
    });
  };

  const labelClass = "text-sm font-semibold text-gray-700 min-w-[180px]";
  const inputClass = "w-full max-w-sm px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors bg-white";
  const descClass = "text-xs text-gray-400 mt-1";
  const rowClass = "flex items-start gap-6 py-5 border-b border-gray-100 last:border-0";

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => router.push("/preorders")}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/preorders")}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <span className="spinner inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Preorder details</h2>
          <p className="text-sm text-gray-400 mb-6">
            These values appear in the preorders list.
          </p>

          <div>
            {/* Name */}
            <div className={rowClass}>
              <div className={labelClass}>
                Name <span className="text-red-500">*</span>
                <p className={descClass}>A label to recognize this preorder by.</p>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                  placeholder="e.g. Summer Sale Preorder"
                  className={`${inputClass} ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Products */}
            <div className={rowClass}>
              <div className={labelClass}>
                Products
                <p className={descClass}>Number of products covered by this preorder.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={products}
                  onChange={(e) => setProducts(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`${inputClass} w-24`}
                />
                <span className="text-sm text-gray-500">product(s)</span>
              </div>
            </div>

            {/* Preorder when */}
            <div className={rowClass}>
              <div className={labelClass}>
                Preorder when
                <p className={descClass}>When customers are allowed to preorder.</p>
              </div>
              <select
                value={preorderWhen}
                onChange={(e) => setPreorderWhen(e.target.value)}
                className={`${inputClass}`}
              >
                <option value="regardless-of-stock">regardless-of-stock</option>
                <option value="out-of-stock">out-of-stock</option>
              </select>
            </div>

            {/* Starts at */}
            <div className={rowClass}>
              <div className={labelClass}>
                Starts at
                <p className={descClass}>When the preorder window opens.</p>
              </div>
              <div className="flex-1">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => { setStartsAt(e.target.value); setErrors((prev) => ({ ...prev, startsAt: undefined })); }}
                  className={`${inputClass} ${errors.startsAt ? "border-red-400" : ""}`}
                />
                {errors.startsAt && <p className="text-xs text-red-500 mt-1">{errors.startsAt}</p>}
              </div>
            </div>

            {/* Ends at */}
            <div className={rowClass}>
              <div className={labelClass}>
                Ends at
                <p className={descClass}>Leave empty for no end date.</p>
              </div>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div className={rowClass}>
              <div className={labelClass}>
                Status
                <p className={descClass}>Active preorders are visible to customers.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="toggle-switch">
                  <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span className="text-sm text-gray-600">{status ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => router.push("/preorders")}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <span className="spinner inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
