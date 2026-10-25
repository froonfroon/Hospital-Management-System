import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/i18n-context";
import { AuthProvider } from "@/auth/auth-context";
import { ShellProvider } from "@/components/shell/shell-context";
import { AppShell } from "@/components/shell/app-shell";

import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "HospitalOS by Solve Codex | Enterprise Healthcare Operating System",
  description:
    "Next-generation enterprise hospital management system supporting clinical workflows, inpatient census, real-time triage, and multidisciplinary healthcare operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans antialiased text-slate-900 overflow-hidden" style={{ backgroundColor: "var(--surface-canvas)" }}>
        <I18nProvider>
          <AuthProvider>
            <ShellProvider>
              <ToastProvider>
                <AppShell>{children}</AppShell>
              </ToastProvider>
            </ShellProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
