import Dexie, { type Table } from "dexie";

export type ReportType =
  | "Shelter Full"
  | "Needs Water"
  | "Medical Emergency";

export interface PendingReport {
  id?: number;
  shelterId: string;
  reportType: ReportType;
  details: string;
  timestamp: number;
  synced: boolean;
}

export class EcoPulseDB extends Dexie {
  pending_reports!: Table<PendingReport, number>;

  constructor() {
    super("EcoPulseDB");
    this.version(1).stores({
      pending_reports: "++id, shelterId, reportType, timestamp",
    });
  }
}

export const db = new EcoPulseDB();
