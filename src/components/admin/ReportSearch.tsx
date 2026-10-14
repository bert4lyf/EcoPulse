"use client";

import { Search, X } from "lucide-react";

interface ReportSearchProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder: string;
}

export function ReportSearch({
  value,
  onSearch,
  placeholder,
}: ReportSearchProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={placeholder}
        aria-label="Search reports"
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-[#111315] py-3 pl-10 pr-11 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-red-500/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onSearch("")}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
