"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, CloudUpload, LoaderCircle, TriangleAlert } from "lucide-react";
import { db } from "@/src/lib/db";

interface SyncBannerProps {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
  syncNow: () => Promise<boolean>;
}

export function SyncBanner({
  isSyncing,
  lastSyncedAt,
  syncError,
  syncNow,
}: SyncBannerProps) {
  const pendingCount = useLiveQuery(
    async () =>
      (await db.pending_reports.toArray()).filter((report) => !report.synced)
        .length,
    [],
    0,
  );
  const [expiredSyncTimestamp, setExpiredSyncTimestamp] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!lastSyncedAt || pendingCount > 0) return;

    const syncedTimestamp = lastSyncedAt.getTime();
    const remainingTime = Math.max(
      0,
      5000 - (Date.now() - syncedTimestamp),
    );
    const timeout = window.setTimeout(
      () => setExpiredSyncTimestamp(syncedTimestamp),
      remainingTime,
    );
    return () => window.clearTimeout(timeout);
  }, [lastSyncedAt, pendingCount]);
  const showSynced =
    lastSyncedAt !== null &&
    pendingCount === 0 &&
    expiredSyncTimestamp !== lastSyncedAt.getTime();

  if (isSyncing) {
    return (
      <div
        role="status"
        className="mb-6 flex min-h-14 items-center gap-3 rounded-2xl border border-sky-500/25 bg-sky-950/35 p-4 text-sky-100"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-5 shrink-0 animate-spin text-sky-300"
        />
        <span className="text-sm font-semibold">Syncing pending reports…</span>
      </div>
    );
  }

  if (syncError) {
    return (
      <div
        role="alert"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/25 bg-red-950/35 p-4 text-red-100"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
          Sync failed. Your reports remain saved on this device.
        </span>
        <button
          type="button"
          onClick={() => void syncNow()}
          className="min-h-11 rounded-xl border border-red-300/30 px-4 py-2 text-sm font-bold hover:bg-red-900/50"
        >
          Retry sync
        </button>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div
        role="status"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-950/30 p-4 text-amber-100"
      >
        <p className="flex items-start gap-3 text-sm leading-6">
          <CloudUpload
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-amber-300"
          />
          <span>
            <strong>
              You have {pendingCount} unsynced{" "}
              {pendingCount === 1 ? "report" : "reports"}.
            </strong>{" "}
            They will send when you are back online.
          </span>
        </p>
        <button
          type="button"
          onClick={() => void syncNow()}
          className="min-h-11 rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 transition-colors hover:bg-amber-300"
        >
          Sync Now
        </button>
      </div>
    );
  }

  if (showSynced) {
    return (
      <div
        role="status"
        className="mb-6 flex min-h-14 items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/35 p-4 text-emerald-100"
      >
        <CheckCircle2
          aria-hidden="true"
          className="size-5 shrink-0 text-emerald-300"
        />
        <span className="text-sm font-semibold">All reports synced</span>
      </div>
    );
  }

  return null;
}
