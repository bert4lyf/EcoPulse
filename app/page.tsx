"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  Bot,
  Building2,
  ClipboardPlus,
  Map,
  Menu,
  Settings2,
  ShieldAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { AITriage } from "@/src/components/AITriage";
import { ReportForm } from "@/src/components/ReportForm";
import { ShelterList } from "@/src/components/ShelterList";
import { ShelterMap } from "@/src/components/ShelterMap";
import { SyncBanner } from "@/src/components/SyncBanner";
import { db } from "@/src/lib/db";
import { useSyncEngine } from "@/src/lib/useSyncEngine";
import shelterData from "@/src/data/shelters.json";
import type { Shelter } from "@/src/types/shelter";

const shelters = shelterData as Shelter[];

const navigation = [
  { id: "map", label: "Map", icon: Map },
  { id: "shelters", label: "Shelters", icon: Building2 },
  { id: "report", label: "Report", icon: ClipboardPlus },
  { id: "triage", label: "AI Triage", icon: Bot },
] as const;

type View = (typeof navigation)[number]["id"];

const viewHeadings: Record<View, { eyebrow: string; title: string }> = {
  map: { eyebrow: "Live area overview", title: "Shelter map" },
  shelters: { eyebrow: "Local response", title: "Emergency shelters" },
  report: { eyebrow: "Community updates", title: "Report an issue" },
  triage: { eyebrow: "Guidance when you need it", title: "AI triage" },
};

export default function Home() {
  const [activeView, setActiveView] = useState<View>("map");
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [reportShelterId, setReportShelterId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [showSosToast, setShowSosToast] = useState(false);
  const { isSyncing, lastSyncedAt, syncError, syncNow } = useSyncEngine();

  useEffect(() => {
    if (!showSosToast) return;
    const timeoutId = window.setTimeout(() => setShowSosToast(false), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [showSosToast]);

  useEffect(() => {
    if (!isSosOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSosOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSosOpen]);

  const pendingReports = useLiveQuery(
    async () =>
      (await db.pending_reports.toArray()).filter((report) => !report.synced),
    [],
    [],
  );
  const pendingCount = pendingReports.length;
  const currentHeading = viewHeadings[activeView];

  function navigateTo(view: View) {
    setActiveView(view);
    setMobileMenuOpen(false);
  }

  function viewShelterOnMap(shelter: Shelter) {
    setSelectedShelter(shelter);
    navigateTo("map");
  }

  function reportShelter(shelterId: string) {
    setReportShelterId(shelterId);
    navigateTo("report");
  }

  return (
    <div className="min-h-screen bg-[#101214] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.07] bg-[#151719] px-4 py-6 lg:flex xl:w-72">
        <Link href="/" className="mb-9 flex items-center gap-3 px-2">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-red-700 text-white shadow-lg shadow-red-950/40">
            <Activity aria-hidden="true" className="size-6" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-white">
              EcoPulse
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Community response
            </span>
          </span>
        </Link>

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Emergency tools
        </p>
        <nav aria-label="Primary" className="grid gap-1.5">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigateTo(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-active-nav"
                    className="absolute inset-0 rounded-xl border border-red-500/20 bg-red-950/55"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  aria-hidden="true"
                  className={`relative size-5 ${
                    active ? "text-red-300" : ""
                  }`}
                />
                <span className="relative">{label}</span>
                {id === "report" && pendingCount > 0 && (
                  <span className="relative ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-slate-950">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <Link
          href="/admin"
          className="mt-5 hidden min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white lg:flex"
        >
          <Settings2 aria-hidden="true" className="size-5" />
          Admin dashboard
        </Link>

        <div className="mt-auto rounded-2xl border border-red-900/50 bg-red-950/20 p-4">
          <ShieldAlert
            aria-hidden="true"
            className="mb-3 size-5 text-red-300"
          />
          <p className="text-sm font-bold text-white">Need urgent help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Contact your local emergency services if someone is in immediate
            danger.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#101214]/90 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[4.5rem] max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.05] lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" className="size-5" />
                ) : (
                  <Menu aria-hidden="true" className="size-5" />
                )}
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  {currentHeading.eyebrow}
                </p>
                <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  {currentHeading.title}
                </h1>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-900/70 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-300 sm:flex">
              <span className="size-2 rounded-full bg-emerald-400" />
              LOCAL DATA READY
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              aria-label="Mobile menu"
              className="absolute left-0 right-0 top-[4.5rem] z-30 grid gap-1 border-b border-white/10 bg-[#17191b] p-3 shadow-2xl lg:hidden"
            >
              {navigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigateTo(id)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left font-semibold ${
                    activeView === id
                      ? "bg-red-950/70 text-white"
                      : "text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {label}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-5 sm:px-7 sm:pb-28 sm:pt-7 lg:px-9 lg:pb-10 lg:pt-8">
          <SyncBanner
            isSyncing={isSyncing}
            lastSyncedAt={lastSyncedAt}
            syncError={syncError}
            syncNow={syncNow}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="min-h-[calc(100dvh-12rem)]"
            >
              {activeView === "map" && (
                <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171a1c] p-3 shadow-xl shadow-black/10 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-300">
                        Austin, Texas
                      </p>
                      <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                        Nearby emergency shelters
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo("shelters")}
                      className="min-h-11 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.05]"
                    >
                      View all shelters
                    </button>
                  </div>
                  <ShelterMap
                    shelters={shelters}
                    selectedShelterId={selectedShelter?.id}
                    onReportIssue={reportShelter}
                  />
                  <p className="px-1 pt-3 text-xs leading-5 text-slate-500">
                    Map tiles require an internet connection. Confirm shelter
                    availability before traveling.
                  </p>
                </section>
              )}

              {activeView === "shelters" && (
                <div className="mx-auto max-w-3xl">
                  <ShelterList onViewMap={viewShelterOnMap} />
                </div>
              )}

              {activeView === "report" && (
                <div className="mx-auto max-w-3xl">
                  <ReportForm
                    key={reportShelterId || "no-selected-shelter"}
                    initialShelterId={reportShelterId}
                  />
                </div>
              )}

              {activeView === "triage" && <AITriage />}
            </motion.section>
          </AnimatePresence>

          <p className="mt-8 border-t border-white/[0.07] pt-5 text-xs leading-5 text-slate-500">
            EcoPulse is a community resilience demo, not an emergency dispatch
            service. In immediate danger, contact local emergency services.
          </p>
        </main>
      </div>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#151719]/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {navigation.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navigateTo(id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-bold transition-colors ${
                  active
                    ? "text-red-200"
                    : "text-slate-500 hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-active-nav"
                    className="absolute inset-0 rounded-xl bg-red-950/40"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  aria-hidden="true"
                  className={`relative size-5 ${
                    active ? "text-red-300" : ""
                  }`}
                />
                <span className="relative">{label}</span>
                {id === "report" && pendingCount > 0 && (
                  <span className="absolute right-2 top-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setIsSosOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-24 right-4 z-50 flex size-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-full border-2 border-red-300/70 bg-red-700 text-white shadow-xl shadow-red-950/60 transition hover:scale-105 hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-300 lg:bottom-8 lg:right-8"
      >
        <AlertTriangle aria-hidden="true" className="size-6" />
        <span className="text-sm font-black tracking-wider">SOS</span>
      </button>

      <AnimatePresence>
        {isSosOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsSosOpen(false);
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="sos-dialog-title"
              aria-describedby="sos-dialog-description"
              className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#1b1d20] p-6 shadow-2xl shadow-black/50"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-950 text-red-300">
                <AlertTriangle aria-hidden="true" className="size-6" />
              </div>
              <h2
                id="sos-dialog-title"
                className="text-xl font-black text-white"
              >
                Emergency SOS
              </h2>
              <p
                id="sos-dialog-description"
                className="mt-3 text-sm leading-6 text-slate-300"
              >
                This will broadcast your location to all nearby shelters and
                emergency services. Proceed?
              </p>
              <p className="mt-3 rounded-lg border border-amber-700/50 bg-amber-950/30 p-3 text-xs font-medium leading-5 text-amber-200">
                Demo only: this does not transmit your location or contact
                emergency services. If you are in immediate danger, call your
                local emergency number directly.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSosOpen(false)}
                  className="min-h-11 rounded-xl border border-white/15 px-5 text-sm font-bold text-slate-200 transition hover:bg-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSosOpen(false);
                    setShowSosToast(true);
                  }}
                  className="min-h-11 rounded-xl bg-red-700 px-5 text-sm font-black text-white transition hover:bg-red-600"
                >
                  Broadcast SOS
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSosToast && (
          <motion.p
            role="status"
            className="fixed bottom-44 right-4 z-[70] rounded-xl border border-emerald-700/60 bg-[#13211c] px-4 py-3 text-sm font-bold text-emerald-200 shadow-xl lg:bottom-28 lg:right-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            SOS Broadcasted locally
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
