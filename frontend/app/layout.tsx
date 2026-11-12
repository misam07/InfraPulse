import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InfraPulse — Infrastructure Monitoring",
    template: "%s — InfraPulse",
  },
  description:
    "Self-hosted monitoring dashboard for Linux servers and Docker containers.",
};

/**
 * Skeleton matching the sidebar shape, shown only for the instant before
 * hydration on routes the sidebar cannot prerender.
 */
function SidebarFallback() {
  return (
    <>
      <div className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-2 border-r border-border bg-surface p-4 md:flex">
        <Skeleton className="h-9 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Skeleton className="h-9 w-40" />
      </div>
    </>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        {/* Sidebar reads the URL, so it renders behind a Suspense boundary
            as required by Cache Components. */}
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>
        <div className="flex min-h-dvh flex-col md:pl-64">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-20 pb-10 md:px-8 md:pt-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
