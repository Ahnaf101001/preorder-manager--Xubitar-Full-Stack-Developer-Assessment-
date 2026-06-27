"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PreorderForm from "@/components/PreorderForm";
import { Preorder } from "@/types";

export default function EditPreorderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [preorder, setPreorder] = useState<Preorder | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      setFetchLoading(true);
      try {
        const res = await fetch(`/api/preorders/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setPreorder(data);
      } finally {
        setFetchLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line

  const handleSubmit = async (data: {
    name: string;
    products: number;
    preorder_when: string;
    starts_at: string;
    ends_at: string;
    status: boolean;
  }) => {
    if (!preorder) return;
    setSaveLoading(true);
    try {
      const res = await fetch(`/api/preorders/${preorder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/preorders");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update preorder");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f3f4f6" }}>
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <span className="spinner inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full" />
          <span className="text-sm">Loading preorder...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f3f4f6" }}>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Preorder not found</p>
          <button
            onClick={() => router.push("/preorders")}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Go back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <PreorderForm
      initial={preorder ?? undefined}
      onSubmit={handleSubmit}
      loading={saveLoading}
    />
  );
}
