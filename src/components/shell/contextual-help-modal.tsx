"use client";

import React from "react";
import { useShell } from "./shell-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpCircle, Keyboard, LifeBuoy, ShieldAlert, PhoneCall } from "lucide-react";

export function ContextualHelpModal() {
  const { isHelpOpen, setIsHelpOpen } = useShell();

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-cyan-700" />
            <DialogTitle>HospitalOS Clinical Operations Help & Shortcuts</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-slate-800 mb-2">
              <Keyboard className="h-4 w-4 text-slate-500" />
              <span>Keyboard Navigation Shortcuts</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Global Patient Search</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] border shadow-2xs">
                  Ctrl + K
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Open Help Dialog</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] border shadow-2xs">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Dismiss / Close Modals</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] border shadow-2xs">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Print Active Chart</span>
                <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] border shadow-2xs">
                  Ctrl + P
                </kbd>
              </div>
            </div>
          </div>

          {/* Triage Protocol Guidelines */}
          <div>
            <h4 className="flex items-center gap-1.5 font-semibold text-slate-800 mb-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Emergency Triage Scale Reference</span>
            </h4>
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <span className="font-semibold text-slate-800">Level 1 (Resuscitation):</span>
                <span className="text-slate-600">Immediate bedside intervention required.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-semibold text-slate-800">Level 2 (Emergent):</span>
                <span className="text-slate-600">Bedside evaluation within 15 minutes.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-slate-800">Level 3 (Urgent):</span>
                <span className="text-slate-600">Vital signs stabilization within 30 minutes.</span>
              </div>
            </div>
          </div>

          {/* Clinical Support Hotline */}
          <div className="rounded border border-cyan-200 bg-cyan-50/50 p-3">
            <div className="flex items-center gap-2 text-cyan-900 font-semibold mb-1">
              <PhoneCall className="h-4 w-4 text-cyan-700" />
              <span>Hospital Technical Support & Code Line</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Internal Extension: <strong>Ext. 4400 (IT Support)</strong> | Rapid Response Code: <strong>Ext. 3333</strong>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
