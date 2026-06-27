"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PreorderForm from "@/components/PreorderForm";

export default function CreatePreorderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    products: number;
    preorder_when: string;
    starts_at: string;
    ends_at: string;
    status: boolean;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/preorders");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create preorder");
      }
    } finally {
      setLoading(false);
    }
  };

  return <PreorderForm onSubmit={handleSubmit} loading={loading} />;
}
