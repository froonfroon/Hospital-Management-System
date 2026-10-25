"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import { GlobalPatientSearch } from "./global-patient-search";
import { NotificationCenter } from "./notification-center";
import { ContextualHelpModal } from "./contextual-help-modal";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useI18n } from "@/i18n/i18n-context";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { direction } = useI18n();
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#030a16] text-white" dir={direction}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900" dir={direction}>
      {/* Desktop Navy Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 focus:outline-none"
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <MobileNav />
      <GlobalPatientSearch />
      <NotificationCenter />
      <ContextualHelpModal />
    </div>
  );
}
