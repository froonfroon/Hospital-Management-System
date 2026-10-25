"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter, ClinicalAlertFilters } from "@/api/adapter";
import { ClinicalAlert, AlertCategory, AlertSeverity, AlertWorkflowStatus } from "@/types/clinical";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
  Eye,
  FileCheck,
  Building2,
  Stethoscope,
  Info,
  XCircle,
  Activity,
  History,
  Send,
  User,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ClinicalAlertsContent() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const isCodeOrange = searchParams?.get("filter") === "code-orange";

  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<AlertWorkflowStatus | "all">("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [isLoading, startTransition] = useTransition();

  // Active Alert for Modal Action
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<ClinicalAlert | null>(null);
  const [modalMode, setModalMode] = useState<"acknowledge" | "escalate" | "resolve" | "dismiss" | "history" | null>(null);

  // Form states for modals
  const [actionNote, setActionNote] = useState("");
  const [actionDisposition, setActionDisposition] = useState("stable_monitored");
  const [isSubmitting, startSubmitTransition] = useTransition();

  const loadAlerts = () => {
    startTransition(async () => {
      try {
        const filters: ClinicalAlertFilters = {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          severity: selectedSeverity !== "all" ? selectedSeverity : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          departmentId: selectedDept !== "all" ? selectedDept : undefined,
        };
        const res = await hospitalDataAdapter.getClinicalAlerts(filters);
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to load alerts", err);
      }
    });
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedCategory, selectedSeverity, selectedStatus, selectedDept]);

  const handleAcknowledge = () => {
    if (!selectedAlertForAction) return;
    startSubmitTransition(async () => {
      try {
        await hospitalDataAdapter.acknowledgeClinicalAlert(
          selectedAlertForAction.id,
          { userId: "usr-active", name: isAr ? "د. سارة تميمي، استشاري" : "Dr. Sarah Chen, MD" },
          actionNote || (isAr ? "تم الاطلاع والاستلام في المحطة السريرية." : "Acknowledged at clinical station.")
        );
        closeModal();
        loadAlerts();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleEscalate = () => {
    if (!selectedAlertForAction || !actionNote.trim()) return;
    startSubmitTransition(async () => {
      try {
        await hospitalDataAdapter.escalateClinicalAlert(
          selectedAlertForAction.id,
          {
            userId: "doc-medical-director",
            name: isAr ? "د. خالد المنصور، المدير الطبي" : "Dr. Khalid Mansoor, MD",
            role: isAr ? "المدير الطبي العام" : "Chief Medical Officer",
          },
          actionNote
        );
        closeModal();
        loadAlerts();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleResolve = () => {
    if (!selectedAlertForAction || !actionNote.trim()) return;
    startSubmitTransition(async () => {
      try {
        await hospitalDataAdapter.resolveClinicalAlert(
          selectedAlertForAction.id,
          { userId: "usr-active", name: isAr ? "د. سارة تميمي، استشاري" : "Dr. Sarah Chen, MD" },
          actionNote,
          actionDisposition
        );
        closeModal();
        loadAlerts();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDismiss = () => {
    if (!selectedAlertForAction || !actionNote.trim()) return;
    startSubmitTransition(async () => {
      try {
        await hospitalDataAdapter.dismissClinicalAlert(
          selectedAlertForAction.id,
          { userId: "usr-active", name: isAr ? "د. سارة تميمي، استشاري" : "Dr. Sarah Chen, MD" },
          actionNote
        );
        closeModal();
        loadAlerts();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const closeModal = () => {
    setSelectedAlertForAction(null);
    setModalMode(null);
    setActionNote("");
    setActionDisposition("stable_monitored");
  };

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const newCount = alerts.filter((a) => a.status === "new").length;
  const acknowledgedCount = alerts.filter((a) => a.status === "acknowledged" || a.status === "under_review").length;
  const escalatedCount = alerts.filter((a) => a.status === "escalated").length;

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 text-white font-extrabold px-3 py-1 text-xs shadow-xs tracking-wider animate-pulse">
            <Flame className="h-3.5 w-3.5" />
            <span>{isAr ? "حرج للغاية (STAT)" : "CRITICAL STAT"}</span>
          </span>
        );
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-white font-bold px-3 py-1 text-xs shadow-xs tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{isAr ? "عاجل وطارئ" : "URGENT"}</span>
          </span>
        );
      case "moderate":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white font-bold px-3 py-1 text-xs shadow-xs tracking-wider">
            <Activity className="h-3.5 w-3.5" />
            <span>{isAr ? "متوسط الأهمية" : "MODERATE"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600 text-white font-bold px-3 py-1 text-xs shadow-xs tracking-wider">
            <span>{isAr ? "اعتيادي" : "LOW"}</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: AlertWorkflowStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 text-xs font-bold">
            <Clock className="h-3.5 w-3.5 text-red-600" />
            <span>{isAr ? "جديد وغير مستلم" : "New / Unread"}</span>
          </span>
        );
      case "acknowledged":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-700" />
            <span>{isAr ? "مستلم ومقروء" : "Acknowledged"}</span>
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-100 text-cyan-900 border border-cyan-300 px-2.5 py-1 text-xs font-bold">
            <Activity className="h-3.5 w-3.5 text-cyan-700" />
            <span>{isAr ? "قيد التدخل السريري" : "Under Review"}</span>
          </span>
        );
      case "escalated":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 text-xs font-bold">
            <ArrowUpRight className="h-3.5 w-3.5 text-purple-700" />
            <span>{isAr ? "مصعّد للإدارة الطبية" : "Escalated"}</span>
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 text-xs font-bold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>{isAr ? "معالج ومغلق" : "Resolved"}</span>
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 text-xs font-bold">
            <XCircle className="h-3.5 w-3.5 text-slate-500" />
            <span>{isAr ? "مستبعد بمبرر معتمد" : "Dismissed"}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Page Title & Governance Header */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold">
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                <span>{isAr ? "إدارة المخاطر والسلامة السريرية" : "Clinical Risk & Patient Safety"}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "المراقبة الذكية نشطة 24/7" : "Active Continuous Surveillance"}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-600" />
              <span>{isAr ? "لوحة التنبيهات السريرية والمخاطر الحرجة" : "Clinical Risk & Alert Command Center"}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
              {isAr
                ? "مراقبة فورية ومستمرة لقيم التحاليل الحرجة (Panic Values)، تدهور المؤشرات الحيوية (MEWS)، تعارض الحساسيات الدوائية، وتأخر المهام السريرية."
                : "Continuous surveillance of panic lab values, vital signs deterioration (MEWS), drug allergy conflicts, and overdue orders."}
            </p>
          </div>
        </div>

        {/* Safety Medical Disclaimer */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-blue-700 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="block font-bold text-blue-950 mb-0.5">
              {isAr ? "إشعار الأمان ودعم القرار السريري:" : "Clinician Decision Support Boundary:"}
            </strong>
            <span>
              {isAr
                ? "هذه التنبيهات تهدف لدعم القرار الطبي السريع ولا تلغي التقدير السريري المستقل. لا يتم إغلاق أي تنبيه حرج تلقائياً وتتطلب جميع القرارات توثيقاً صريحاً في ملف المريض."
                : "Clinical alerts are assistive decision support tools and do NOT substitute for direct clinical examination. Critical alerts are never silently auto-dismissed."}
            </span>
          </div>
        </div>
      </div>

      {/* Code Orange Emergency Protocol Banner */}
      {isCodeOrange && (
        <div className="rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-600 text-white px-2.5 py-0.5 text-xs font-black shadow-xs animate-pulse">
                CODE ORANGE
              </span>
              <h2 className="text-base font-extrabold text-white">
                {isAr ? "قيادة الكوارث والحوادث الطارئة (Code Orange Incident Command)" : "Code Orange Disaster & Mass Casualty Incident Command"}
              </h2>
            </div>
            <p className="text-xs text-rose-200">
              {isAr
                ? "بروتوكول الطوارئ القصوى مفعل: استدعاء فِرق الإنعاش والحوادث المتعددة، وتخصيص أسرة العناية المركزة، ورفع جاهزية بنك الدم."
                : "Mass casualty protocol activated: Trauma resuscitation teams on standby, ICU surge capacity cleared, blood bank reserves prepped."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="rounded-lg bg-rose-600 text-white px-3 py-1.5 font-bold shadow-xs">
              {isAr ? "جاهزية طوارئ 100%" : "100% Surge Ready"}
            </span>
            <Link
              href="/clinical-alerts"
              className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 font-semibold text-white transition-colors"
            >
              {isAr ? "كافة التنبيهات" : "Standard Alerts"}
            </Link>
          </div>
        </div>
      )}

      {/* 2. BOLD HIGH-CONTRAST KPI STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Critical STAT Alerts */}
        <div className="rounded-xl border-t-4 border-t-red-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "تنبيهات حرجة (STAT)" : "Critical Alerts"}</span>
            <div className="rounded-lg bg-red-100 p-2 text-red-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-red-600 leading-none">{criticalCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-red-700">
            {isAr ? "تتطلب تدخلاً سريرياً فورياً" : "Requires STAT intervention"}
          </span>
        </div>

        {/* Card 2: New Unread Alerts */}
        <div className="rounded-xl border-t-4 border-t-amber-500 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "جديدة وغير مقروءة" : "New Unread"}</span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 leading-none">{newCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-amber-700">
            {isAr ? "بانتظار استلام الطبيب" : "Awaiting MD acknowledgment"}
          </span>
        </div>

        {/* Card 3: Escalated Cases */}
        <div className="rounded-xl border-t-4 border-t-purple-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "حالات مصعّدة للإدارة" : "Escalated Cases"}</span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-purple-600 leading-none">{escalatedCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-purple-700">
            {isAr ? "تحت إشراف المدير الطبي" : "Under CMO / Director review"}
          </span>
        </div>

        {/* Card 4: Under Review & Resolved */}
        <div className="rounded-xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "قيد التدخل والمتابعة" : "In Progress / Acked"}</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 leading-none">{acknowledgedCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-emerald-700">
            {isAr ? "تم إبلاغ الفريق السريري" : "Care team mobilized"}
          </span>
        </div>
      </div>

      {/* 3. ROBUST FILTER BAR */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Filter className="h-4 w-4 text-cyan-700" />
          <span>{isAr ? "تصفية وفرز التنبيهات السريرية" : "Filter Clinical Alerts"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "حالة الإجراء السريري" : "Workflow Status"}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع الحالات (الكل)" : "All Workflow States"}</option>
              <option value="new">{isAr ? "جديد وغير مستلم" : "New / Unread"}</option>
              <option value="acknowledged">{isAr ? "مستلم ومقروء" : "Acknowledged"}</option>
              <option value="under_review">{isAr ? "قيد التدخل السريري" : "Under Review"}</option>
              <option value="escalated">{isAr ? "مصعّد للإدارة" : "Escalated"}</option>
              <option value="resolved">{isAr ? "معالج ومغلق" : "Resolved"}</option>
              <option value="dismissed">{isAr ? "مستبعد بمبرر" : "Dismissed"}</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "مستوى الخطورة" : "Severity Tier"}
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع المستويات" : "All Severities"}</option>
              <option value="critical">{isAr ? "حرج للغاية (Critical STAT)" : "Critical STAT"}</option>
              <option value="urgent">{isAr ? "عاجل وطارئ (Urgent)" : "Urgent"}</option>
              <option value="moderate">{isAr ? "متوسط (Moderate)" : "Moderate"}</option>
              <option value="low">{isAr ? "اعتيادي (Low)" : "Low"}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "تصنيف التنبيه الطبي" : "Alert Category"}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
              <option value="critical_lab">{isAr ? "تحليل مخبري حرج (Panic Lab Value)" : "Critical Lab Panic Value"}</option>
              <option value="concerning_vitals">{isAr ? "تدهور علامات حيوية (MEWS)" : "Concerning Vitals / MEWS"}</option>
              <option value="allergy_conflict">{isAr ? "تعارض حساسية دوائية" : "Allergy Conflict"}</option>
              <option value="delayed_clinical_task">{isAr ? "تأخر مهام وفحوصات" : "Delayed Clinical Task"}</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "القسم المسؤول" : "Responsible Ward / Dept"}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع الأقسام الطبية" : "All Departments"}</option>
              {HOSPITAL_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {isAr ? d.nameAr : d.nameEn} [{d.code}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. CLINICAL ALERTS FEED */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
          <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            {isAr ? "لا توجد تنبيهات سريرية مطابقة للبحث" : "No active clinical alerts match your filter"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {isAr
              ? "جميع المؤشرات الحيوية والتحاليل المخبرية للمرضى ضمن الحدود الفسيولوجية المستقرة."
              : "All monitored physiological and laboratory values are clear."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isCritical = alert.severity === "critical";
            const isUrgent = alert.severity === "urgent";

            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl border p-4 sm:p-5 shadow-xs transition-all space-y-3.5 bg-white",
                  isCritical
                    ? "border-s-4 border-s-red-600 border-slate-200 hover:border-red-400 hover:shadow-md"
                    : isUrgent
                    ? "border-s-4 border-s-amber-500 border-slate-200 hover:border-amber-400 hover:shadow-md"
                    : "border-s-4 border-s-blue-500 border-slate-200 hover:border-blue-400 hover:shadow-md"
                )}
              >
                {/* Alert Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    {getStatusBadge(alert.status)}
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {alert.alertNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <User className="h-3.5 w-3.5 text-cyan-700" />
                      <span>{alert.patientName}</span>
                      <span className="font-mono text-[11px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded font-semibold">
                        {alert.patientMrn}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <Building2 className="h-3.5 w-3.5 text-cyan-700" />
                      <span>{isAr ? alert.responsibleDepartmentNameAr : alert.responsibleDepartmentNameEn}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {new Date(alert.detectedAt).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Alert Core Findings */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {alert.title}
                  </h3>

                  {/* High-Contrast Source Data Highlight Box */}
                  <div
                    className={cn(
                      "rounded-lg p-3 border font-mono text-xs",
                      isCritical
                        ? "bg-red-50/80 border-red-200 text-red-950"
                        : isUrgent
                        ? "bg-amber-50/80 border-amber-200 text-amber-950"
                        : "bg-blue-50/80 border-blue-200 text-blue-950"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider mb-1 text-slate-600">
                      <AlertCircle className={cn("h-3.5 w-3.5", isCritical ? "text-red-600" : "text-amber-600")} />
                      <span>{isAr ? "البيانات السريرية المسببة للتنبيه:" : "Trigger Source Data & Finding:"}</span>
                    </div>
                    <div className="text-sm font-bold tracking-wide">
                      {alert.sourceDataValue}
                    </div>
                  </div>

                  {/* Rule Reference */}
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700">{isAr ? "القاعدة السريرية المطبقة:" : "Approved Clinical Rule:"}</strong>{" "}
                    <span className="font-mono text-slate-600">{alert.ruleTriggered}</span>
                  </p>
                </div>

                {/* Status details & Notes (Fully localized) */}
                {alert.acknowledgedBy && (
                  <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
                    <strong>{isAr ? "تم الاستلام بواسطة:" : "Acknowledged by:"}</strong>{" "}
                    <span className="font-bold">{alert.acknowledgedBy.name}</span>{" "}
                    {isAr ? "بتوقيت" : "on"}{" "}
                    <span className="font-mono">
                      {new Date(alert.acknowledgedBy.timestamp).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    : <em className="ms-1 font-sans">"{alert.acknowledgedBy.clinicalNote}"</em>
                  </div>
                )}

                {alert.escalatedTo && (
                  <div className="rounded-lg bg-purple-50 p-2.5 text-xs text-purple-900 border border-purple-200">
                    <strong>{isAr ? "تم التصعيد إلى:" : "Escalated to:"}</strong>{" "}
                    <span className="font-bold">{alert.escalatedTo.name}</span> ({alert.escalatedTo.role}){" "}
                    {isAr ? "بتوقيت" : "on"}{" "}
                    <span className="font-mono">
                      {new Date(alert.escalatedTo.timestamp).toLocaleTimeString(isAr ? "ar-EG" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    : <em className="ms-1 font-sans">"{alert.escalatedTo.reason}"</em>
                  </div>
                )}

                {alert.resolvedBy && (
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200">
                    <strong>{isAr ? "تم الحل والإغلاق بواسطة:" : "Resolved by:"}</strong>{" "}
                    <span className="font-bold">{alert.resolvedBy.name}</span> |{" "}
                    <strong>{isAr ? "الإجراء:" : "Action:"}</strong> {alert.resolvedBy.documentedAction} |{" "}
                    <strong>{isAr ? "الحالة:" : "Disposition:"}</strong> {alert.resolvedBy.disposition}
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAlertForAction(alert);
                      setModalMode("history");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 cursor-pointer transition-colors"
                  >
                    <History className="h-4 w-4 text-cyan-600" />
                    <span>{isAr ? "سجل الأحداث والتدقيق" : "Event History"} ({alert.eventHistory.length})</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Acknowledge Button */}
                    {alert.status === "new" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAlertForAction(alert);
                          setModalMode("acknowledge");
                        }}
                        className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isAr ? "استلام ومطالعة التنبيه" : "Acknowledge Alert"}</span>
                      </button>
                    )}

                    {/* Escalate Button */}
                    {alert.status !== "resolved" && alert.status !== "dismissed" && alert.status !== "escalated" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAlertForAction(alert);
                          setModalMode("escalate");
                        }}
                        className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>{isAr ? "تصعيد للإدارة الطبية" : "Escalate to Senior"}</span>
                      </button>
                    )}

                    {/* Resolve Button */}
                    {alert.status !== "resolved" && alert.status !== "dismissed" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAlertForAction(alert);
                          setModalMode("resolve");
                        }}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAr ? "توثيق الحل والإغلاق" : "Document Resolution"}</span>
                      </button>
                    )}

                    {/* Dismiss Button */}
                    {alert.status !== "resolved" && alert.status !== "dismissed" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAlertForAction(alert);
                          setModalMode("dismiss");
                        }}
                        className="rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {isAr ? "استبعاد بمبرر معتمد" : "Dismiss"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modals */}
      {modalMode && selectedAlertForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-700" />
                <span>
                  {modalMode === "acknowledge" && (isAr ? "استلام ومطالعة التنبيه السريري" : "Acknowledge Clinical Alert")}
                  {modalMode === "escalate" && (isAr ? "تصعيد التنبيه إلى الإدارة الطبية" : "Escalate to Medical Leadership")}
                  {modalMode === "resolve" && (isAr ? "توثيق التدخل السريري وحل التنبيه" : "Document Clinical Action & Resolve")}
                  {modalMode === "dismiss" && (isAr ? "استبعاد التنبيه بمبرر سريري معتمد" : "Authorized Alert Dismissal")}
                  {modalMode === "history" && (isAr ? "سجل التدقيق للأحداث والتنبيه" : "Audit Trail & Event History")}
                </span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs text-slate-800">
              <p className="font-bold text-slate-900">{selectedAlertForAction.title}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isAr ? "المريض:" : "Patient:"} <span className="font-semibold">{selectedAlertForAction.patientName}</span> ({selectedAlertForAction.patientMrn})
              </p>
            </div>

            {/* History Modal View */}
            {modalMode === "history" && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedAlertForAction.eventHistory.map((evt, idx) => (
                  <div key={idx} className="border-s-2 border-cyan-600 ps-3 py-1 space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">{evt.action}</p>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? "بواسطة:" : "By:"} {evt.performedBy} • {new Date(evt.timestamp).toLocaleString(isAr ? "ar-EG" : "en-US")}
                    </p>
                    {evt.notes && <p className="text-[11px] text-slate-600 italic">"{evt.notes}"</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Acknowledge Form */}
            {modalMode === "acknowledge" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
                    ? "تأكيد استلامك لهذا التنبيه يعني إحاطتك الكاملة بالحالة وإشرافك المباشر على التدخل السريري. يرجى تدوين ملاحظتك الأولية."
                    : "Acknowledging confirms that you have received this alert and are supervising the clinical situation. Please enter initial notes."}
                </p>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? "الملاحظة السريرية الأولية (اختياري)" : "Initial Assessment Note (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={isAr ? "مثال: تم إبلاغ الفريق السريري عند السرير والبدء بالمحاليل..." : "e.g. Bedside team notified, rapid response evaluated..."}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Escalate Form */}
            {modalMode === "escalate" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
                    ? "سيتم إرسال إشعار فوري إلى المدير الطبي واستشاري العناية المركزة لاتخاذ قرار عاجل."
                    : "Will escalate to Chief Medical Officer / ICU Attending for immediate high-level intervention."}
                </p>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? "مبرر التصعيد السريري *" : "Clinical Escalation Rationale *"}
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={isAr ? "مثال: عدم استجابة المريض للعلاج الأولي وظهور علامات تدهور حاد..." : "e.g. Unresponsive to initial 1000mL fluid bolus, requiring critical care bed evaluation..."}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Resolve Form */}
            {modalMode === "resolve" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
                    ? "تتطلب معايير السلامة السريرية توثيق الإجراء المتخذ وتحديد الحالة الناتجة لإغلاق التنبيه رسمياً."
                    : "Clinical governance requires documenting the actual intervention taken and patient disposition to officially resolve this alert."}
                </p>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? "الإجراء الطبي المتخذ *" : "Documented Clinical Action *"}
                  </label>
                  <input
                    type="text"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={isAr ? "مثال: تم إعطاء جلوكونات الكالسيوم وإعادة تحليل البوتاسيوم..." : "e.g. Calcium Gluconate IV administered, repeating K+ level in 2 hours..."}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? "الحالة السريرية الناتجة *" : "Patient Disposition *"}
                  </label>
                  <select
                    value={actionDisposition}
                    onChange={(e) => setActionDisposition(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="stable_monitored">{isAr ? "مستقر وتحت المراقبة المستمرة" : "Stable under active monitoring"}</option>
                    <option value="transferred_icu">{isAr ? "تم التحويل إلى العناية المركزة" : "Transferred to Intensive Care"}</option>
                    <option value="medication_adjusted">{isAr ? "تم تعديل الخطة العلاجية والجرعات" : "Medication regimen adjusted"}</option>
                    <option value="test_repeated">{isAr ? "طلب إعادة الفحص المخبري للتأكد" : "Repeat laboratory draw ordered"}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dismiss Form */}
            {modalMode === "dismiss" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr
                    ? "استبعاد التنبيه يتطلب توثيق مبرر سريري معتمد (مثال: عينة دم متحللة أو خطأ إدخال تم تصحيحه)."
                    : "Dismissal requires an authorized clinical explanation (e.g. hemolyzed blood sample artifact, duplicate entry)."}
                </p>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isAr ? "المبرر السريري المعتمد للاستبعاد *" : "Authorized Clinical Justification *"}
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={isAr ? "مثال: أكد المختبر وجود تحلل في العينة (Hemolysis) وتم سحب عينة جديدة..." : "e.g. Laboratory confirmed artifactual hemolysis; repeat specimen ordered..."}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Close"}
              </button>

              {modalMode === "acknowledge" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAcknowledge}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "تأكيد الاستلام" : "Confirm Acknowledgment"}
                </button>
              )}

              {modalMode === "escalate" && (
                <button
                  type="button"
                  disabled={isSubmitting || !actionNote.trim()}
                  onClick={handleEscalate}
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (isAr ? "جارٍ إرسال التصعيد..." : "Escalating...") : isAr ? "إرسال التصعيد للإدارة" : "Submit Escalation"}
                </button>
              )}

              {modalMode === "resolve" && (
                <button
                  type="button"
                  disabled={isSubmitting || !actionNote.trim()}
                  onClick={handleResolve}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (isAr ? "جارٍ تأكيد الحل..." : "Resolving...") : isAr ? "تأكيد الحل والإغلاق" : "Confirm Resolution"}
                </button>
              )}

              {modalMode === "dismiss" && (
                <button
                  type="button"
                  disabled={isSubmitting || !actionNote.trim()}
                  onClick={handleDismiss}
                  className="rounded-lg bg-slate-700 hover:bg-slate-800 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (isAr ? "جارٍ الاستبعاد..." : "Dismissing...") : isAr ? "استبعاد التنبيه" : "Confirm Dismissal"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClinicalAlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <ClinicalAlertsContent />
    </Suspense>
  );
}
