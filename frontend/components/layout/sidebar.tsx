"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bell,
  Boxes,
  LayoutDashboard,
  Menu,
  Server,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/containers", label: "Containers", icon: Boxes },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-border-strong bg-surface text-accent">
        <Activity className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span>
        <span className="block text-[13px] font-semibold leading-none tracking-tight text-foreground">
          InfraPulse
        </span>
        <span className="mt-1 block font-mono text-[9px] uppercase leading-none tracking-[0.18em] text-muted">
          Monitoring
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col" aria-label="Main navigation">
      <p className="px-4 pb-2 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-muted/70">
        Monitoring
      </p>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href) ? "page" : undefined}
          className={`relative flex items-center gap-2.5 border-l-2 py-[7px] pr-4 pl-[14px] text-[13px] transition-colors ${
            isActive(href)
              ? "border-accent text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Icon
            className={`h-3.5 w-3.5 ${isActive(href) ? "text-accent" : ""}`}
            aria-hidden
          />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="flex items-center gap-2 border-t border-border px-4 py-3">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Live · 15s refresh
      </span>
    </div>
  );
}

/**
 * Application sidebar.
 * Fixed column on desktop; slide-over panel behind a top bar on mobile.
 * Wrapped in <Suspense> by the root layout because it reads the URL
 * (usePathname) — required by Next.js 16 Cache Components.
 */
export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop column */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-background md:flex">
        <div className="px-4 py-4">
          <Logo />
        </div>
        <div className="flex-1 pt-3">
          <NavLinks />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-2.5 md:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-[3px] p-2 text-muted hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden />
        </button>
      </header>

      {/* Mobile slide-over */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-60 flex-col border-r border-border bg-background">
            <div className="flex items-center justify-between px-4 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-[3px] p-2 text-muted hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-4.5 w-4.5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 pt-3">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter />
          </div>
        </div>
      ) : null}
    </>
  );
}
