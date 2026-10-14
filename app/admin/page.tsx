import { Suspense } from "react";
import { AdminReports } from "@/src/components/admin/AdminReports";

function AdminReportsFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101214] text-slate-300">
      Loading report filters…
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminReportsFallback />}>
      <AdminReports />
    </Suspense>
  );
}
