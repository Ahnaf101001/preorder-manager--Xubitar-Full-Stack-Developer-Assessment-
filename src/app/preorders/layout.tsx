import { Suspense } from "react";

export default function PreordersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#f3f4f6" }}>
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <span className="spinner inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
