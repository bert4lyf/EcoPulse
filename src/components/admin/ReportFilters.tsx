"use client";

import { ReportSearch } from "@/src/components/admin/ReportSearch";
import type { ReportType } from "@/src/lib/db";

export type ReportTypeFilter = "All" | ReportType;

export interface ShelterFilterOption {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  query: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  reportType: ReportTypeFilter;
  shelterId: string;
  shelterOptions: ShelterFilterOption[];
  onReportTypeChange: (value: ReportTypeFilter) => void;
  onShelterChange: (value: string) => void;
}

const reportTypes: ReportTypeFilter[] = [
  "All",
  "Shelter Full",
  "Needs Water",
  "Medical Emergency",
];

const selectClassName =
  "min-h-12 w-full rounded-xl border border-slate-700 bg-[#111315] px-3 text-sm font-medium text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-red-500/30";

export function ReportFilters({
  query,
  onSearch,
  searchPlaceholder,
  reportType,
  shelterId,
  shelterOptions,
  onReportTypeChange,
  onShelterChange,
}: ReportFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(22rem,0.9fr)] lg:items-end">
      <ReportSearch
        value={query}
        onSearch={onSearch}
        placeholder={searchPlaceholder}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Report type
          <select
            value={reportType}
            onChange={(event) =>
              onReportTypeChange(event.target.value as ReportTypeFilter)
            }
            className={selectClassName}
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Shelter
          <select
            value={shelterId}
            onChange={(event) => onShelterChange(event.target.value)}
            className={selectClassName}
          >
            <option value="All">All Shelters</option>
            {shelterOptions.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
