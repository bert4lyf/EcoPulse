import { NextResponse } from "next/server";

const reportTypes = [
  "Shelter Full",
  "Needs Water",
  "Medical Emergency",
] as const;

type ReportType = (typeof reportTypes)[number];

interface IncomingReport {
  id: number;
  shelterId: string;
  reportType: ReportType;
  details: string;
  timestamp: number;
}

export interface SyncedReport extends IncomingReport {
  syncedAt: number;
}

const globalForSync = globalThis as typeof globalThis & {
  ecopulseSyncedReports?: SyncedReport[];
};
const syncedReports = (globalForSync.ecopulseSyncedReports ??= []);

function isIncomingReport(value: unknown): value is IncomingReport {
  if (typeof value !== "object" || value === null) return false;
  const report = value as Record<string, unknown>;

  return (
    Number.isSafeInteger(report.id) &&
    typeof report.shelterId === "string" &&
    report.shelterId.length > 0 &&
    typeof report.reportType === "string" &&
    reportTypes.includes(report.reportType as ReportType) &&
    typeof report.details === "string" &&
    Number.isSafeInteger(report.timestamp) &&
    (report.timestamp as number) >= 0
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("reports" in body) ||
    !Array.isArray(body.reports) ||
    !body.reports.every(isIncomingReport)
  ) {
    return NextResponse.json(
      { success: false, error: "Expected an array of valid reports." },
      { status: 400 },
    );
  }

  const reports = body.reports as IncomingReport[];
  const syncedAt = Date.now();
  const knownIds = new Set(syncedReports.map((report) => report.id));

  for (const report of reports) {
    if (!knownIds.has(report.id)) {
      syncedReports.push({
        id: report.id,
        shelterId: report.shelterId,
        reportType: report.reportType,
        details: report.details,
        timestamp: report.timestamp,
        syncedAt,
      });
      knownIds.add(report.id);
    }
  }

  return NextResponse.json({
    success: true,
    syncedIds: reports.map((report) => report.id),
  });
}

export async function GET() {
  try {
    return NextResponse.json(
      { reports: syncedReports },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Failed to read synced EcoPulse reports.", error);
    return NextResponse.json(
      { error: "Failed to load synced reports." },
      { status: 500 },
    );
  }
}
