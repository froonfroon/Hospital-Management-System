"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShell } from "./shell-context";
import { useI18n } from "@/i18n/i18n-context";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Activity, Pill, CheckCheck, Clock, ExternalLink } from "lucide-react";

interface ClinicalNotification {
  id: string;
  type: "critical_vital" | "stat_order" | "lab_abnormal" | "transfer";
  titleEn: string;
  titleAr: string;
  patientEn: string;
  patientAr: string;
  mrn: string;
  timestamp: string;
  severity: "critical" | "urgent" | "warning" | "routine";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: ClinicalNotification[] = [
  {
    id: "notif-1",
    type: "critical_vital",
    titleEn: "Stat Alert: SpO2 dropped below 92% in ICU Pod A",
    titleAr: "تنبيه حرج: انخفاض تشبع الأكسجين أقل من 92% بالعناية المركزة",
    patientEn: "Zaid Abdullah Al-Ghamdi",
    patientAr: "زيد عبدالله الغامدي",
    mrn: "MRN-2026-5120",
    timestamp: "2 mins ago",
    severity: "critical",
    read: false,
  },
  {
    id: "notif-2",
    type: "lab_abnormal",
    titleEn: "Critical Lab Value: Troponin-I 420 ng/L Reported",
    titleAr: "قيمة مخبرية حرجة: تقرير تروبونين 420 نانوغرام/لتر",
    patientEn: "Tariq Mansoor Al-Harbi",
    patientAr: "طارق منصور الحربي",
    mrn: "MRN-2026-4412",
    timestamp: "14 mins ago",
    severity: "urgent",
    read: false,
  },
  {
    id: "notif-3",
    type: "stat_order",
    titleEn: "Unsigned Stat Order: Norepinephrine Infusion",
    titleAr: "أمر دوائي طارئ معلق للتوقيع: ضخ النورإبينفرين",
    patientEn: "Zaid Abdullah Al-Ghamdi",
    patientAr: "زيد عبدالله الغامدي",
    mrn: "MRN-2026-5120",
    timestamp: "45 mins ago",
    severity: "warning",
    read: true,
  },
  {
    id: "notif-4",
    type: "transfer",
    titleEn: "Discharge clearance completed for Bed 309-B",
    titleAr: "اكتمال إجراءات الخروج للسرير 309-B",
    patientEn: "Fahad Saud Al-Dosari",
    patientAr: "فهد سعود الدوسري",
    mrn: "MRN-2026-6194",
    timestamp: "1 hour ago",
    severity: "routine",
    read: true,
  },
];

export function NotificationCenter() {
  const { isNotificationOpen, setIsNotificationOpen } = useShell();
  const { locale, direction } = useI18n();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: ClinicalNotification["type"]) => {
    switch (type) {
      case "critical_vital":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "stat_order":
        return <Pill className="h-4 w-4 text-orange-600" />;
      case "lab_abnormal":
        return <Activity className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Drawer open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
      <DrawerContent side={direction === "rtl" ? "left" : "right"} className="p-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-bold text-slate-900">
              Clinical Notification Center
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] text-cyan-700 hover:text-cyan-900"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 p-2 overflow-y-auto max-h-[calc(100vh-100px)]">
          {notifications.map((n) => {
            const isAr = locale === "ar";
            const title = isAr ? n.titleAr : n.titleEn;
            const patientName = isAr ? n.patientAr : n.patientEn;

            return (
              <div
                key={n.id}
                className={`p-3 rounded-md transition-colors ${
                  !n.read ? "bg-cyan-50/40 border-s-2 border-cyan-600" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded p-1 bg-white border border-slate-200 shadow-2xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <StatusBadge variant={n.severity} size="sm">
                        {n.severity.toUpperCase()}
                      </StatusBadge>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        {n.timestamp}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                      {title}
                    </h4>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                      <span>{patientName}</span>
                      <span>•</span>
                      <span className="font-mono text-cyan-800">{n.mrn}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <Link
            href="/clinical-alerts"
            onClick={() => setIsNotificationOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full rounded-md bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold py-2 px-3 shadow-xs transition-colors"
          >
            <span>{locale === "ar" ? "فتح لوحة التنبيهات السريرية الشاملة" : "Open Clinical Risk & Alerts Center"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
