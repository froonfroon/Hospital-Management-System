"use client";

import * as React from "react";
import { PaginationMeta } from "@/types/common";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const { currentPage, totalPages, totalItems, pageSize } = meta;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
          <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-900">{totalItems}</span> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ms-4">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="iconSm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        <Button
          variant="outline"
          size="iconSm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>

        <span className="px-2 text-xs font-medium">
          Page {currentPage} of {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="iconSm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
        <Button
          variant="outline"
          size="iconSm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
