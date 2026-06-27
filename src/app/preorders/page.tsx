"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Preorder, SortField, SortOrder, FilterTab } from "@/types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 6l3-3 3 3M11 10l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11.013 2.513a1.75 1.75 0 012.475 2.475L5.8 12.676l-3.014.335.335-3.014 7.892-7.484z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0l-.667 9.333A1.333 1.333 0 0110.667 14.667H5.333A1.333 1.333 0 014 13.333L3.333 4h9.334z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="toggle-switch" style={{ opacity: disabled ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </label>
  );
}

function DeleteModal({
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Delete preorder?</h3>
        <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            {loading && <span className="spinner inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PreordersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = (searchParams.get("filter") as FilterTab) || "all";
  const sortField = (searchParams.get("sortField") as SortField) || "created_at";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";
  const page = parseInt(searchParams.get("page") || "1");

  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 8;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const buildUrl = useCallback(
    (overrides: Record<string, string | number>) => {
      const params = new URLSearchParams({
        filter,
        sortField,
        sortOrder,
        page: String(page),
        ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, String(v)])),
      });
      return `${pathname}?${params.toString()}`;
    },
    [filter, sortField, sortOrder, page, pathname]
  );

  const fetchPreorders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/preorders?filter=${filter}&sortField=${sortField}&sortOrder=${sortOrder}&page=${page}&pageSize=${PAGE_SIZE}`
      );
      const data = await res.json();
      setPreorders(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [filter, sortField, sortOrder, page]);

  useEffect(() => {
    fetchPreorders();
  }, [fetchPreorders]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(preorders.map((p) => p.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleToggleStatus = async (preorder: Preorder) => {
    setTogglingId(preorder.id);
    try {
      const res = await fetch(`/api/preorders/${preorder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: preorder.status === 0 }),
      });
      if (res.ok) {
        setPreorders((prev) =>
          prev.map((p) => (p.id === preorder.id ? { ...p, status: preorder.status === 0 ? 1 : 0 } : p))
        );
        showToast(`Status updated to ${preorder.status === 0 ? "Active" : "Inactive"}`);
      } else {
        showToast("Failed to update status", "error");
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/preorders/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Preorder deleted");
        setDeleteId(null);
        fetchPreorders();
      } else {
        showToast("Failed to delete", "error");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const allSelected = preorders.length > 0 && preorders.every((p) => selectedIds.has(p.id));
  const someSelected = preorders.some((p) => selectedIds.has(p.id)) && !allSelected;

  const sortLabels: Record<SortField, string> = {
    name: "Name",
    created_at: "Created At",
    starts_at: "Starts At",
    ends_at: "Ends At",
  };

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen" style={{ background: "#f3f4f6" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg transition-all ${
            toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <DeleteModal
        open={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Preorders</h1>
          <Link href="/preorders/create">
            <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Create Preorder
            </button>
          </Link>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs + Sort */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-gray-100">
            <div className="flex gap-1">
              {(["all", "active", "inactive"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => router.push(buildUrl({ filter: tab, page: 1 }))}
                  className={`px-3 py-2 text-sm font-medium rounded-t-md capitalize transition-colors border-b-2 -mb-px ${
                    filter === tab
                      ? "text-gray-900 border-gray-900 bg-white"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort button */}
            <div className="relative mb-1" ref={sortRef}>
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sort"
              >
                <SortIcon />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-48">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sort by</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {(Object.entries(sortLabels) as [SortField, string][]).map(([field, label]) => (
                      <label key={field} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sortField"
                          checked={sortField === field}
                          onChange={() => {
                            router.push(buildUrl({ sortField: field, page: 1 }));
                          }}
                          className="accent-gray-900"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {(["asc", "desc"] as SortOrder[]).map((order) => (
                      <button
                        key={order}
                        onClick={() => {
                          router.push(buildUrl({ sortOrder: order, page: 1 }));
                          setSortOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          sortOrder === order
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span>{order === "asc" ? "↑" : "↓"}</span>
                        {order === "asc" ? "Ascending" : "Descending"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Products</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Preorder when</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Starts at</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ends at</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="spinner inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : preorders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <rect x="6" y="10" width="28" height="24" rx="3" stroke="#d1d5db" strokeWidth="2" />
                          <path d="M13 18h14M13 24h8" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                          <path d="M20 6v4" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="text-sm font-medium">No preorders found</span>
                        <span className="text-xs">Create your first preorder to get started</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  preorders.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                        selectedIds.has(p.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.products}</td>
                      <td className="px-4 py-3 text-gray-600">{p.preorder_when}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(p.starts_at)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(p.ends_at)}</td>
                      <td className="px-4 py-3">
                        <ToggleSwitch
                          checked={p.status === 1}
                          onChange={() => handleToggleStatus(p)}
                          disabled={togglingId === p.id}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/preorders/${p.id}`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-center gap-3 px-4 py-4 border-t border-gray-100">
              <button
                onClick={() => router.push(buildUrl({ page: page - 1 }))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Showing {start} to {end} from {total}
              </span>
              <button
                onClick={() => router.push(buildUrl({ page: page + 1 }))}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
