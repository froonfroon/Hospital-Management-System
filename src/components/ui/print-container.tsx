"use client";

import * as React from "react";
import { Button } from "./button";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintContainerProps {
  children: React.ReactNode;
  documentTitle?: string;
  triggerLabel?: string;
  className?: string;
}

export function PrintContainer({
  children,
  documentTitle = "HospitalOS Clinical Record",
  triggerLabel = "Print Document",
  className,
}: PrintContainerProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="no-print mb-3 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>{triggerLabel}</span>
        </Button>
      </div>

      <div className="print-container">
        {/* Printable Hospital Letterhead */}
        <div className="hidden print:block border-b border-black pb-3 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold">SOLVE CODEX GENERAL HOSPITAL</h1>
              <p className="text-xs">Clinical Operations & Inpatient Services</p>
            </div>
            <div className="text-end text-xs">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p className="font-mono">{documentTitle}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
