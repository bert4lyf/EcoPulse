"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db, type PendingReport } from "@/src/lib/db";

interface SyncResponse {
  success: boolean;
  syncedIds: number[];
  error?: string;
}

export function useSyncEngine() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (inFlight.current || !navigator.onLine) return false;

    inFlight.current = true;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const pending = (await db.pending_reports.toArray()).filter(
        (report): report is PendingReport & { id: number } =>
          !report.synced && typeof report.id === "number",
      );

      if (pending.length === 0) return false;

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports: pending }),
      });

      const result: SyncResponse = await response.json();
      if (!response.ok || !result.success || !Array.isArray(result.syncedIds)) {
        throw new Error(
          result.error ?? `Report sync failed with status ${response.status}.`,
        );
      }

      const submittedIds = new Set(pending.map((report) => report.id));
      const idsToMarkSynced = [
        ...new Set(
          result.syncedIds.filter(
            (id) => Number.isSafeInteger(id) && submittedIds.has(id),
          ),
        ),
      ];

      if (idsToMarkSynced.length !== pending.length) {
        throw new Error("The server did not acknowledge every pending report.");
      }

      await db.transaction("rw", db.pending_reports, async () => {
        await db.pending_reports.bulkUpdate(
          idsToMarkSynced.map((key) => ({
            key,
            changes: { synced: true },
          })),
        );
      });

      setLastSyncedAt(new Date());
      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected sync error occurred.";
      console.error("EcoPulse report sync failed.", error);
      setSyncError(message);
      return false;
    } finally {
      inFlight.current = false;
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      void syncNow();
    };

    window.addEventListener("online", handleOnline);
    if (navigator.onLine) handleOnline();

    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow]);

  return { isSyncing, lastSyncedAt, syncError, syncNow };
}
