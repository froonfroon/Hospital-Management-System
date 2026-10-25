"use client";

import React from "react";
import { AlertCircle, ShieldAlert, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n-context";

export function LoadingStateView({ message }: { message?: string }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-700 border-t-transparent mb-3" />
      <p className="text-xs font-medium text-slate-600">
        {message || t.common.loading}
      </p>
    </div>
  );
}

export function ErrorStateView({
  title = "Clinical Data Retrieval Failed",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50/50 p-8 text-center my-4">
      <div className="rounded-full bg-red-100 p-2.5 text-red-700 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-red-900">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-red-700 leading-normal">
        {message || "Unable to reach the hospital clinical data gateway."}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-800 hover:bg-red-100"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 rtl:ml-1.5 rtl:mr-0" />
            {t.common.retry}
          </Button>
        </div>
      )}
    </div>
  );
}

export function UnauthorizedStateView({
  requiredRole,
  onSwitchRole,
}: {
  requiredRole?: string;
  onSwitchRole?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-amber-200 bg-amber-50/50 p-10 text-center my-4">
      <div className="rounded-full bg-amber-100 p-3 text-amber-800 mb-3">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-amber-950">
        {t.common.unauthorized}
      </h3>
      <p className="mt-1 max-w-md text-xs text-amber-800 leading-relaxed">
        {t.common.unauthorizedDesc}
        {requiredRole && (
          <span className="block mt-1 font-semibold">
            Required Credential: {requiredRole}
          </span>
        )}
      </p>
      {onSwitchRole && (
        <div className="mt-4">
          <Button variant="default" size="sm" onClick={onSwitchRole}>
            Switch Active Role in Shell
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmptyResultsView({
  title,
  description,
  onReset,
}: {
  title?: string;
  description?: string;
  onReset?: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 p-10 text-center">
      <div className="rounded-full bg-slate-100 p-2.5 text-slate-400 mb-3">
        <Inbox className="h-6 w-6" />
      </div>
      <h4 className="text-xs font-semibold text-slate-700">
        {title || t.common.noResults}
      </h4>
      <p className="mt-1 text-[11px] text-slate-500 max-w-sm">
        {description || "No records match your active department, status, or search query."}
      </p>
      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-3">
          {t.common.clearFilters}
        </Button>
      )}
    </div>
  );
}
