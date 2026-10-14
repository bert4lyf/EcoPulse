import type { Metadata } from "next";
import type { Viewport } from "next";
import { OnlineStatus } from "@/src/components/OnlineStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoPulse | Emergency Shelters",
  description:
    "Offline-ready emergency shelter information for your community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "EcoPulse",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#111315] text-slate-100">
        <OnlineStatus />
        {children}
      </body>
    </html>
  );
}
