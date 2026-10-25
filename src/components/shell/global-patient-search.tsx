"use client";

import React, { useState, useEffect } from "react";
import { useShell } from "./shell-context";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter } from "@/api/adapter";
import { Patient } from "@/types/patient";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Bed, User, ArrowRight, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GlobalPatientSearch() {
  const { isSearchOpen, setIsSearchOpen } = useShell();
  const { locale, t } = useI18n();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    if (!query.trim()) {
      // Default to quick preview of top admissions
      hospitalDataAdapter.getPatients({ page: 1, pageSize: 5 }).then((res) => {
        setResults(res.data);
      });
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      hospitalDataAdapter
        .getPatients({ page: 1, pageSize: 8 }, { searchQuery: query })
        .then((res) => {
          setResults(res.data);
          setSelectedIndex(0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 120);

    return () => clearTimeout(timeout);
  }, [query, isSearchOpen]);

  const handleSelectPatient = (patient: Patient) => {
    setIsSearchOpen(false);
    router.push(`/patients?selectedMrn=${patient.mrn}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelectPatient(results[selectedIndex]);
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-slate-300">
        <div className="flex items-center border-b border-slate-200 px-3.5 py-3 bg-slate-50/50">
          <Search className="h-4 w-4 text-slate-400 me-2.5 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.patient.searchPlaceholder}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2" role="listbox">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <span className="inline-block animate-spin mr-2">◌</span>
              {t.common.loading}
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {t.common.noResults}
            </div>
          ) : (
            results.map((patient, index) => {
              const isSelected = index === selectedIndex;
              const isAr = locale === "ar";
              const name = isAr ? patient.fullNameAr : patient.fullNameEn;

              return (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-md p-2.5 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-cyan-50 border border-cyan-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                      {patient.gender === "female" ? "♀" : "♂"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{name}</span>
                        <span className="font-mono text-[10px] text-cyan-900 bg-cyan-100/60 px-1 rounded">
                          {patient.mrn}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          {patient.age}y • {patient.gender}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3 text-slate-400" />
                          {patient.bed.bedNumber}
                        </span>
                        <span>•</span>
                        <span>{isAr ? patient.departmentNameAr : patient.departmentNameEn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge
                      variant={
                        patient.triageLevel === "1_resuscitation"
                          ? "critical"
                          : patient.triageLevel === "2_emergent"
                          ? "urgent"
                          : patient.triageLevel === "3_urgent"
                          ? "warning"
                          : "stable"
                      }
                      size="sm"
                    >
                      {patient.triageLevel.replace("_", " ").toUpperCase()}
                    </StatusBadge>
                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-cyan-700 rtl:rotate-180" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3.5 py-2 text-[11px] text-slate-500">
          <span>Navigate with ↑ and ↓</span>
          <span>Press Enter to view clinical chart</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
