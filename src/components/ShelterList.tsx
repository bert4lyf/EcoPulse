"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle } from "lucide-react";
import shelterData from "@/src/data/shelters.json";
import type { Shelter } from "@/src/types/shelter";
import { ShelterCard } from "@/src/components/ShelterCard";
import { db } from "@/src/lib/db";

const shelters = shelterData as Shelter[];

interface ShelterListProps {
  onViewMap: (shelter: Shelter) => void;
}

export function ShelterList({ onViewMap }: ShelterListProps) {
  const [minutesSinceLoaded, setMinutesSinceLoaded] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setMinutesSinceLoaded((minutes) => minutes + 1),
      60_000,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  const medicalReports = useLiveQuery(
    async () =>
      (await db.pending_reports.toArray()).filter(
        (report) =>
          !report.synced && report.reportType === "Medical Emergency",
      ),
    [],
    [],
  );
  const criticalShelterIds = new Set(
    medicalReports.map((report) => report.shelterId),
  );
  const lastUpdatedLabel =
    minutesSinceLoaded === 0
      ? "just now"
      : `${minutesSinceLoaded} minute${minutesSinceLoaded === 1 ? "" : "s"} ago`;

  return (
    <section aria-labelledby="shelters-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-[0.14em] text-red-300">
            Local response
          </p>
          <h2
            id="shelters-heading"
            className="text-2xl font-black tracking-tight text-white sm:text-3xl"
          >
            Emergency shelters
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Last updated: {lastUpdatedLabel}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-lg border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-sm font-semibold text-amber-200">
          <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
          {shelters.length} locations in this offline list
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {shelters.map((shelter, index) => (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            index={index}
            hasMedicalEmergencyReport={criticalShelterIds.has(shelter.id)}
            onViewMap={onViewMap}
          />
        ))}
      </div>
    </section>
  );
}
