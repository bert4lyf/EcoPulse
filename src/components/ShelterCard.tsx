"use client";

import { motion } from "framer-motion";
import {
  Accessibility,
  MapPin,
  Stethoscope,
  Users,
  Map,
  AlertTriangle,
} from "lucide-react";
import type { Shelter } from "@/src/types/shelter";

interface ShelterCardProps {
  shelter: Shelter;
  index: number;
  hasMedicalEmergencyReport: boolean;
  onViewMap: (shelter: Shelter) => void;
}

export function ShelterCard({
  shelter,
  index,
  hasMedicalEmergencyReport,
  onViewMap,
}: ShelterCardProps) {
  const isOpen = shelter.status === "Open";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className={`rounded-xl border bg-[#1b1e21] p-5 shadow-lg shadow-black/20 transition-colors sm:p-6 ${
        isOpen
          ? "border-slate-700 hover:border-emerald-700"
          : "border-red-800/90 hover:border-red-500"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Emergency shelter
          </p>
          <h3 className="text-xl font-extrabold leading-snug text-white">
            {shelter.name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-extrabold ${
            isOpen
              ? "border-emerald-700 bg-emerald-950/70 text-emerald-300"
              : "border-red-600 bg-red-950 text-red-200"
          }`}
        >
          {shelter.status}
        </span>
      </div>

      {hasMedicalEmergencyReport && (
        <div className="mt-4 inline-flex min-h-8 items-center gap-2 rounded-full border border-red-500/60 bg-red-950/70 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-red-200">
          <AlertTriangle aria-hidden="true" className="size-4" />
          Critical · Medical report
        </div>
      )}

      <div className="mt-6 grid gap-4 border-t border-slate-700/80 pt-5 sm:grid-cols-2">
        <div className="flex items-center gap-3 text-slate-300">
          <Users aria-hidden="true" className="size-5 shrink-0 text-amber-400" />
          <span>
            Capacity{" "}
            <strong className="font-bold text-white">{shelter.capacity}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <MapPin aria-hidden="true" className="size-5 shrink-0 text-red-400" />
          <span className="tabular-nums">
            {shelter.lat.toFixed(4)}, {shelter.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <ul
        aria-label="Shelter accessibility and support"
        className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-700/80 pt-5"
      >
        <li
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
            shelter.ada_accessible
              ? "border-sky-800 bg-sky-950/50 text-sky-200"
              : "border-slate-700 bg-slate-900/50 text-slate-500"
          }`}
        >
          <Accessibility aria-hidden="true" className="size-5 shrink-0" />
          ADA {shelter.ada_accessible ? "accessible" : "not available"}
        </li>
        <li
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${
            shelter.medical_support
              ? "border-violet-800 bg-violet-950/50 text-violet-200"
              : "border-slate-700 bg-slate-900/50 text-slate-500"
          }`}
        >
          <Stethoscope aria-hidden="true" className="size-5 shrink-0" />
          Medical {shelter.medical_support ? "support" : "not available"}
        </li>
      </ul>

      <button
        type="button"
        onClick={() => onViewMap(shelter)}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-amber-400 hover:bg-slate-700"
      >
        <Map aria-hidden="true" className="size-4" />
        View on map
      </button>
    </motion.article>
  );
}
