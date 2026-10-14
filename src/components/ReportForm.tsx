"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import shelterData from "@/src/data/shelters.json";
import { db, type ReportType } from "@/src/lib/db";
import type { Shelter } from "@/src/types/shelter";

const shelters = shelterData as Shelter[];
const reportTypes: ReportType[] = [
  "Shelter Full",
  "Needs Water",
  "Medical Emergency",
];

function isReportType(value: string): value is ReportType {
  return reportTypes.includes(value as ReportType);
}

interface ReportFormProps {
  initialShelterId?: string;
}

export function ReportForm({ initialShelterId = "" }: ReportFormProps) {
  const [shelterId, setShelterId] = useState(initialShelterId);
  const [reportType, setReportType] = useState<ReportType>("Shelter Full");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState<
    { kind: "success" | "error"; text: string } | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    setIsSaving(true);

    try {
      await db.pending_reports.add({
        shelterId,
        reportType,
        details: details.trim(),
        timestamp: Date.now(),
        synced: false,
      });
      setDetails("");
      setMessage({
        kind: "success",
        text: "Report saved locally. It will sync when you are back online.",
      });
    } catch (error) {
      console.error("Could not save the report to local storage.", error);
      setMessage({
        kind: "error",
        text: "Report could not be saved locally. Check your device storage and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      id="report-form"
      aria-labelledby="report-heading"
      className="scroll-mt-28 rounded-xl border border-slate-700 bg-[#1b1e21] p-5 shadow-lg shadow-black/20 sm:p-6"
    >
      <div className="mb-5">
        <p className="mb-1 text-sm font-bold uppercase tracking-[0.14em] text-amber-300">
          Community updates
        </p>
        <h2 id="report-heading" className="text-2xl font-black text-white">
          Report a shelter issue
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Reports are saved on this device only and are not sent to emergency
          services. They sync to the demo admin dashboard when this app is
          online.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Shelter
          <select
            required
            value={shelterId}
            onChange={(event) => setShelterId(event.target.value)}
            className="min-h-12 rounded-lg border border-slate-600 bg-slate-950 px-3 text-base text-white"
          >
            <option value="" disabled>
              Select a shelter
            </option>
            {shelters.map((shelter) => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-200">
          Report type
          <select
            value={reportType}
            onChange={(event) => {
              const value = event.target.value;
              if (isReportType(value)) setReportType(value);
            }}
            className="min-h-12 rounded-lg border border-slate-600 bg-slate-950 px-3 text-base text-white"
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-200 sm:col-span-2">
          Details
          <textarea
            required
            minLength={3}
            maxLength={500}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Share a brief description of what you observed."
            className="min-h-28 resize-y rounded-lg border border-slate-600 bg-slate-950 px-3 py-3 text-base text-white placeholder:text-slate-500"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-12 rounded-lg bg-red-700 px-5 py-3 font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving report…" : "Save report on this device"}
          </button>
          {message && (
            <p
              role={message.kind === "error" ? "alert" : "status"}
              className={`flex items-center gap-2 text-sm font-medium ${
                message.kind === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {message.kind === "success" ? (
                <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
              ) : (
                <TriangleAlert aria-hidden="true" className="size-5 shrink-0" />
              )}
              {message.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
