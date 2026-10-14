"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Clock3,
  Eye,
  Home,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import shelterData from "@/src/data/shelters.json";
import type { PendingReport, ReportType } from "@/src/lib/db";
import type { Shelter } from "@/src/types/shelter";
import { ReportFilters, type ReportTypeFilter } from "./ReportFilters";

interface SyncedReport extends Omit<PendingReport, "synced"> {
  id: number;
  syncedAt: number;
}

interface ReportsResponse {
  reports: SyncedReport[];
}

const shelters = shelterData as Shelter[];
const shelterNames = new Map(
  shelters.map((shelter) => [shelter.id, shelter.name]),
);
const validReportTypes: ReportType[] = [
  "Shelter Full",
  "Needs Water",
  "Medical Emergency",
];

const statCardClass =
  "rounded-2xl border border-white/[0.08] bg-[#171a1c] p-5 shadow-lg shadow-black/10";

function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return <>{text}</>;

  const index = text
    .toLocaleLowerCase()
    .indexOf(normalizedQuery.toLocaleLowerCase());
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-400/25 px-0.5 text-amber-100">
        {text.slice(index, index + normalizedQuery.length)}
      </mark>
      {text.slice(index + normalizedQuery.length)}
    </>
  );
}

export function AdminReports() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") ?? "";
  const requestedType = searchParams.get("type") ?? "All";
  const urlType: ReportTypeFilter = validReportTypes.includes(
    requestedType as ReportType,
  )
    ? (requestedType as ReportType)
    : "All";
  const requestedShelter = searchParams.get("shelter") ?? "All";

  const [reports, setReports] = useState<SyncedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SyncedReport | null>(
    null,
  );
  const [queryDraft, setQueryDraft] = useState({
    sourceUrlQuery: urlQuery,
    value: urlQuery,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryInput =
    queryDraft.sourceUrlQuery === urlQuery ? queryDraft.value : urlQuery;

  useEffect(() => {
    if (!selectedReport) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedReport(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedReport]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      try {
        const response = await fetch("/api/sync", {
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        const result: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : `Could not load reports (${response.status}).`;
          throw new Error(message);
        }

        if (
          typeof result !== "object" ||
          result === null ||
          !("reports" in result) ||
          !Array.isArray(result.reports)
        ) {
          throw new Error("The reports response has an invalid format.");
        }
        setReports(result.reports as ReportsResponse["reports"]);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        console.error("Admin reports fetch error:", cause);
        setError(
          cause instanceof Error &&
            cause.message !== "Failed to fetch" &&
            cause.message !== "Load failed"
            ? cause.message
            : "Failed to load reports. Is the server running?",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadReports();
    return () => controller.abort();
  }, []);

  const updateUrlParam = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim() && value !== defaultValue) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => updateUrlParam("query", queryInput, ""),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [queryInput, updateUrlParam]);

  const shelterOptions = useMemo(() => {
    const optionsById = new Map(
      shelters.map((shelter) => [shelter.id, shelter.name]),
    );
    for (const report of reports) {
      if (!optionsById.has(report.shelterId)) {
        optionsById.set(report.shelterId, report.shelterId);
      }
    }
    return [...optionsById.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [reports]);

  const shelterFilter =
    requestedShelter === "All" ||
    shelterOptions.some((shelter) => shelter.id === requestedShelter)
      ? requestedShelter
      : "All";

  const filteredReports = useMemo(() => {
    const normalizedQuery = urlQuery.trim().toLocaleLowerCase();

    return reports.filter((report) => {
      if (urlType !== "All" && report.reportType !== urlType) return false;
      if (shelterFilter !== "All" && report.shelterId !== shelterFilter) {
        return false;
      }

      if (!normalizedQuery) return true;
      const shelterName =
        shelterNames.get(report.shelterId) ?? report.shelterId;
      return [shelterName, report.details, report.reportType]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
  }, [reports, shelterFilter, urlQuery, urlType]);

  const criticalReportCount = reports.filter(
    (report) => report.reportType === "Medical Emergency",
  ).length;
  const activeShelterCount = new Set(
    reports.map(
      (report) => shelterNames.get(report.shelterId) ?? report.shelterId,
    ),
  ).size;
  const latestSyncTimestamp = reports.reduce<number | null>(
    (latest, report) =>
      latest === null || report.syncedAt > latest ? report.syncedAt : latest,
    null,
  );
  const latestSyncLabel = latestSyncTimestamp
    ? new Date(latestSyncTimestamp).toLocaleString()
    : "—";

  return (
    <main className="min-h-screen bg-[#101214] px-4 py-8 text-slate-100 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to EcoPulse
        </Link>

        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">
            Operations · Demo
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Synced reports
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Read-only view of reports received by this running mock server.
            In-memory data resets when the server process restarts.
          </p>
        </header>

        <section
          aria-label="Report summary"
          className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <article className={statCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Total Reports
                </p>
                <p className="mt-3 text-3xl font-black tabular-nums text-white">
                  {reports.length}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-950/70 text-sky-300">
                <Activity aria-hidden="true" className="size-5" />
              </span>
            </div>
          </article>

          <article className={statCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Critical Alerts
                </p>
                <p className="mt-3 text-3xl font-black tabular-nums text-red-200">
                  {criticalReportCount}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-red-950/70 text-red-300">
                <AlertTriangle aria-hidden="true" className="size-5" />
              </span>
            </div>
          </article>

          <article className={statCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Active Shelters
                </p>
                <p className="mt-3 text-3xl font-black tabular-nums text-white">
                  {activeShelterCount}
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-950/70 text-emerald-300">
                <Home aria-hidden="true" className="size-5" />
              </span>
            </div>
          </article>

          <article className={statCardClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-400">Last Sync</p>
                <p
                  title={latestSyncTimestamp ? latestSyncLabel : undefined}
                  className="mt-3 truncate text-base font-bold text-white"
                >
                  {latestSyncLabel}
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-950/70 text-amber-300">
                <Clock3 aria-hidden="true" className="size-5" />
              </span>
            </div>
          </article>
        </section>

        <section
          aria-label="Search and filter reports"
          className="mb-6 rounded-2xl border border-white/[0.08] bg-[#171a1c] p-4 sm:p-5"
        >
          <ReportFilters
            query={queryInput}
            onSearch={(value) =>
              setQueryDraft({ sourceUrlQuery: urlQuery, value })
            }
            searchPlaceholder="Search shelters, details, or report type"
            reportType={urlType}
            shelterId={shelterFilter}
            shelterOptions={shelterOptions}
            onReportTypeChange={(value) => updateUrlParam("type", value, "All")}
            onShelterChange={(value) =>
              updateUrlParam("shelter", value, "All")
            }
          />
        </section>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#171a1c] text-slate-300">
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            Loading synced reports…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-950/35 p-5 text-red-100"
          >
            <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
            {error}
          </div>
        ) : (
          <>
            <p
              aria-live="polite"
              className="mb-3 text-sm font-semibold text-slate-400"
            >
              Showing{" "}
              <span className="text-white">{filteredReports.length}</span> of{" "}
              <span className="text-white">{reports.length}</span> reports
            </p>
            {filteredReports.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#171a1c] px-5 py-14 text-center">
                <ClipboardList
                  aria-hidden="true"
                  className="mx-auto size-8 text-slate-500"
                />
                <h2 className="mt-4 text-lg font-bold text-white">
                  {reports.length === 0
                    ? "No synced reports yet"
                    : "No reports match your filters"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {reports.length === 0
                    ? "Reports synced during this server session will appear here."
                    : "Try a different search or choose another filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171a1c] shadow-xl shadow-black/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-left">
                    <thead className="bg-white/[0.025]">
                      <tr className="border-b border-white/[0.08] text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th scope="col" className="px-5 py-4">
                          Shelter
                        </th>
                        <th scope="col" className="px-5 py-4">
                          Report type
                        </th>
                        <th scope="col" className="px-5 py-4">
                          Details
                        </th>
                        <th scope="col" className="px-5 py-4">
                          Received
                        </th>
                        <th scope="col" className="px-5 py-4">
                          Status
                        </th>
                        <th scope="col" className="px-5 py-4 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.07]">
                      {filteredReports.map((report) => {
                        const shelterName =
                          shelterNames.get(report.shelterId) ??
                          report.shelterId;
                        const isCritical =
                          report.reportType === "Medical Emergency";

                        return (
                          <tr
                            key={`${report.id}-${report.syncedAt}`}
                            className="transition-colors hover:bg-white/[0.035]"
                          >
                            <td className="px-5 py-5 align-top">
                              <p className="font-bold text-white">
                                <HighlightedText
                                  text={shelterName}
                                  query={urlQuery}
                                />
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {report.shelterId}
                              </p>
                            </td>
                            <td className="px-5 py-5 align-top">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                  isCritical
                                    ? "border-red-700/60 bg-red-950/50 text-red-200"
                                    : "border-amber-700/50 bg-amber-950/40 text-amber-200"
                                }`}
                              >
                                {report.reportType}
                              </span>
                            </td>
                            <td className="max-w-sm px-5 py-5 align-top text-sm leading-6 text-slate-300">
                              <p className="break-words">
                                <HighlightedText
                                  text={report.details || "—"}
                                  query={urlQuery}
                                />
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-5 py-5 align-top">
                              <time
                                dateTime={new Date(report.timestamp).toISOString()}
                                className="text-sm text-slate-400"
                              >
                                {new Date(report.timestamp).toLocaleString()}
                              </time>
                            </td>
                            <td className="px-5 py-5 align-top">
                              <span
                                className={`inline-flex items-center gap-2 text-sm font-semibold ${
                                  isCritical
                                    ? "text-red-200"
                                    : "text-slate-400"
                                }`}
                              >
                                <span
                                  className={`size-2 rounded-full ${
                                    isCritical
                                      ? "animate-pulse bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.75)]"
                                      : "bg-slate-500"
                                  }`}
                                />
                                {isCritical ? "Critical" : "Standard"}
                              </span>
                            </td>
                            <td className="px-5 py-5 text-right align-top">
                              <button
                                type="button"
                                title={`View report from ${shelterName}`}
                                aria-label={`View report from ${shelterName}`}
                                onClick={() => setSelectedReport(report)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition-colors hover:border-amber-500/50 hover:bg-amber-950/30 hover:text-amber-100"
                              >
                                <Eye aria-hidden="true" className="size-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReport(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-detail-title"
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1b1e20] p-5 shadow-2xl shadow-black/60 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                  Report details · #{selectedReport.id}
                </p>
                <h2
                  id="report-detail-title"
                  className="mt-2 text-2xl font-black text-white"
                >
                  {shelterNames.get(selectedReport.shelterId) ??
                    selectedReport.shelterId}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close report details"
                onClick={() => setSelectedReport(null)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-white/[0.07] bg-black/15 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Report type
                </p>
                <p className="mt-1 font-semibold text-amber-200">
                  {selectedReport.reportType}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Priority
                </p>
                <p
                  className={`mt-1 font-semibold ${
                    selectedReport.reportType === "Medical Emergency"
                      ? "text-red-200"
                      : "text-slate-200"
                  }`}
                >
                  {selectedReport.reportType === "Medical Emergency"
                    ? "Critical"
                    : "Standard"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Shelter ID
                </p>
                <p className="mt-1 break-all text-sm text-slate-200">
                  {selectedReport.shelterId}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Report received
                </p>
                <time
                  dateTime={new Date(selectedReport.timestamp).toISOString()}
                  className="mt-1 block text-sm text-slate-200"
                >
                  {new Date(selectedReport.timestamp).toLocaleString()}
                </time>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Details
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-white/[0.07] bg-[#101214] p-3 text-sm leading-6 text-slate-200">
                  {selectedReport.details || "No additional details provided."}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Received by server
                </p>
                <time
                  dateTime={new Date(selectedReport.syncedAt).toISOString()}
                  className="mt-1 block text-sm text-slate-400"
                >
                  {new Date(selectedReport.syncedAt).toLocaleString()}
                </time>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="min-h-11 rounded-xl bg-slate-700 px-5 text-sm font-bold text-white transition hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
