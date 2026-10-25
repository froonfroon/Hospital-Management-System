"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/i18n-context";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingStateView } from "@/components/common/state-views";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { hospitalDataAdapter } from "@/api/adapter";
import { AppointmentRecord, ClinicalOrder } from "@/types/clinical";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  CalendarDays,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  Activity,
  FileText,
  DollarSign,
  Users,
  Package,
  Truck,
  Sparkles,
  Utensils,
  Ambulance,
  FileCheck,
  Search,
  MessageSquare,
  BarChart3,
  Flame,
  BadgeAlert,
  Pill,
  FlaskConical,
  Plus,
  PhoneCall,
  UserCheck,
  Volume2,
  Check,
  Receipt,
  Printer,
} from "lucide-react";

function OperationsContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const tabParam = searchParams.get("tab") || "billing";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchFilter, setSearchFilter] = useState("");

  // Appointments state
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [newAptPatient, setNewAptPatient] = useState("");
  const [newAptMrn, setNewAptMrn] = useState("");
  const [newAptDept, setNewAptDept] = useState("dep-cardio");
  const [newAptDoctor, setNewAptDoctor] = useState("Dr. Sarah Chen, MD");
  const [newAptDate, setNewAptDate] = useState(new Date().toISOString().split("T")[0]);
  const [newAptTime, setNewAptTime] = useState("10:00 AM");
  const [newAptReason, setNewAptReason] = useState("");

  // Pharmacy & Orders state
  const [medOrders, setMedOrders] = useState<ClinicalOrder[]>([]);
  const [labOrders, setLabOrders] = useState<ClinicalOrder[]>([]);
  
  // Lab result entry dialog state
  const [selectedLabOrder, setSelectedLabOrder] = useState<ClinicalOrder | null>(null);
  const [labObservedValue, setLabObservedValue] = useState("");
  const [labUnit, setLabUnit] = useState("mg/dL");
  const [labRefRange, setLabRefRange] = useState("70 - 110 mg/dL");
  const [isCriticalResult, setIsCriticalResult] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadData = () => {
    hospitalDataAdapter.getAppointments().then((res) => {
      setAppointments(res.data);
    });

    hospitalDataAdapter.getClinicalOrders().then((res) => {
      setMedOrders(res.data.filter((o) => o.orderType === "medication"));
      setLabOrders(res.data.filter((o) => o.orderType === "laboratory"));
    });
  };

  useEffect(() => {
    loadData();

    // Listen to demo reset events
    const handleReset = () => {
      loadData();
    };
    window.addEventListener("hospitalos:demo-reset", handleReset);
    return () => window.removeEventListener("hospitalos:demo-reset", handleReset);
  }, []);

  const isAr = locale === "ar";

  // Appointment actions
  const handleCallPatient = (apt: AppointmentRecord) => {
    toast({
      title: isAr ? "تم استدعاء المريض إلى شاشة الانتظار" : "Patient Called to Clinic Chime",
      description: isAr
        ? `يرجى من المريض ${apt.patientName} التوجه فوراً لعيادة ${apt.clinicianName} (${apt.departmentNameAr})`
        : `Calling ${apt.patientName} to Room / Consultation Office of ${apt.clinicianName}`,
      variant: "info",
    });
  };

  const handleUpdateAptStatus = async (id: string, status: AppointmentRecord["status"]) => {
    await hospitalDataAdapter.updateAppointmentStatus(id, status);
    toast({
      title: isAr ? "تم تحديث حالة الموعد" : "Appointment Status Updated",
      description: `Status changed to ${status.toUpperCase()}`,
      variant: "success",
    });
    loadData();
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptPatient.trim()) return;

    const dept = HOSPITAL_DEPARTMENTS.find((d) => d.id === newAptDept) || HOSPITAL_DEPARTMENTS[0];
    await hospitalDataAdapter.createAppointment({
      patientId: `pat-${Date.now()}`,
      patientName: newAptPatient,
      patientMrn: newAptMrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: dept.id,
      departmentNameEn: dept.nameEn,
      departmentNameAr: dept.nameAr,
      clinicianName: newAptDoctor,
      appointmentDate: newAptDate,
      timeSlot: newAptTime,
      type: "new_consultation",
      status: "scheduled",
      reasonForVisit: newAptReason || "Outpatient Clinical Follow-up",
    });

    toast({
      title: isAr ? "تم حجز الموعد بنجاح" : "Appointment Booked Successfully",
      description: `${newAptPatient} • ${newAptDate} at ${newAptTime}`,
      variant: "success",
    });

    setIsBookModalOpen(false);
    setNewAptPatient("");
    setNewAptReason("");
    loadData();
  };

  // Pharmacy actions
  const handleDispenseMedication = async (orderId: string, drugName: string) => {
    await hospitalDataAdapter.dispenseMedication(orderId);
    toast({
      title: isAr ? "تم صرف الدواء واعتماد الجرعة" : "Medication Dispensed & eMAR Verified",
      description: isAr
        ? `تم صرف ${drugName} من الصيدلية وتأكيد سلامة الجرعة والحساسية للمريض.`
        : `${drugName} verified and logged in patient administration record.`,
      variant: "success",
    });
    loadData();
  };

  // Lab actions
  const handleSaveLabResult = async () => {
    if (!selectedLabOrder) return;
    await hospitalDataAdapter.recordLabResult(
      selectedLabOrder.id,
      selectedLabOrder.title,
      labObservedValue || "Normal",
      labUnit,
      labRefRange,
      isCriticalResult
    );

    toast({
      title: isCriticalResult
        ? isAr ? "🚨 تنبيه حرجة: تم إطلاق إنذار سريري STAT" : "🚨 STAT CRITICAL LAB ALERT BROADCASTED"
        : isAr ? "تم اعتماد نتيجة التحليل المخبري" : "Diagnostic Result Verified",
      description: `${selectedLabOrder.title}: ${labObservedValue} ${labUnit}`,
      variant: isCriticalResult ? "error" : "success",
    });

    setSelectedLabOrder(null);
    setLabObservedValue("");
    setIsCriticalResult(false);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t.nav.clinicalWorkspace, href: "/" },
              { label: isAr ? "الإدارة والعمليات التشغيلية" : "Hospital Operations & Administration", current: true },
            ]}
          />
        }
        title={isAr ? "مركز إدارة العمليات والعيادات والموارد" : "Hospital Administration & Operations Center"}
        subtitle={
          isAr
            ? "المنظومة الإدارية والسريرية الموحدة: العيادات الخارجية (OPD)، الصيدلية، المختبر، الفوترة، وسلاسل الإمداد"
            : "Enterprise operational console covering Outpatient Clinics (OPD), Pharmacy Dispensing, Laboratory Diagnostics, Revenue Cycle, and Supply Chain."
        }
      />

      {/* Main Operations Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full mb-4 h-auto p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="opd" className="gap-2 py-2 text-xs font-semibold">
            <CalendarDays className="h-3.5 w-3.5 text-cyan-600" />
            <span>{isAr ? "العيادات الخارجية (OPD)" : "Outpatient (OPD)"}</span>
          </TabsTrigger>

          <TabsTrigger value="pharmacy" className="gap-2 py-2 text-xs font-semibold">
            <Pill className="h-3.5 w-3.5 text-purple-600" />
            <span>{isAr ? "الصيدلية والأدوية" : "Pharmacy Dispense"}</span>
          </TabsTrigger>

          <TabsTrigger value="lab" className="gap-2 py-2 text-xs font-semibold">
            <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isAr ? "المختبر والتحاليل" : "Diagnostic Lab"}</span>
          </TabsTrigger>

          <TabsTrigger value="billing" className="gap-2 py-2 text-xs font-semibold">
            <CreditCard className="h-3.5 w-3.5 text-cyan-700" />
            <span>{isAr ? "المالية والفوترة" : "Financials & RCM"}</span>
          </TabsTrigger>

          <TabsTrigger value="supply_chain" className="gap-2 py-2 text-xs font-semibold">
            <Package className="h-3.5 w-3.5 text-amber-600" />
            <span>{isAr ? "الإمداد والتعقيم" : "Supply Chain & CSSD"}</span>
          </TabsTrigger>

          <TabsTrigger value="governance" className="gap-2 py-2 text-xs font-semibold">
            <Ambulance className="h-3.5 w-3.5 text-red-600" />
            <span>{isAr ? "الأسطول والطوارئ" : "Ambulance & Fleet"}</span>
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------------------------------------
            TAB 1: OUTPATIENT CLINICS & APPOINTMENT SCHEDULING (OPD)
            ------------------------------------------------------------- */}
        <TabsContent value="opd" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={isAr ? "إجمالي مواعيد اليوم" : "Today's Appointments"}
              value={appointments.length}
              subtitle="Scheduled across all clinics"
              icon={<CalendarDays className="h-4 w-4 text-cyan-600" />}
            />
            <StatCard
              title={isAr ? "المرضى في صالة الانتظار" : "Checked-In (Waiting)"}
              value={appointments.filter((a) => a.status === "checked_in").length}
              subtitle="Average wait time: 11 mins"
              icon={<Clock className="h-4 w-4 text-amber-600" />}
            />
            <StatCard
              title={isAr ? "في غرفة الكشف حالياً" : "In Consultation"}
              value={appointments.filter((a) => a.status === "in_consultation").length}
              subtitle="Active physician encounters"
              icon={<Activity className="h-4 w-4 text-blue-600" />}
            />
            <StatCard
              title={isAr ? "المواعيد المكتملة" : "Completed Encounters"}
              value={appointments.filter((a) => a.status === "completed").length}
              subtitle="Discharged or referred"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-700" />
                  <span>{isAr ? "جدول مواعيد العيادات الخارجية واستدعاء المرضى" : "Outpatient Clinic Schedule & Calling Queue"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? "إدارة غرف الانتظار، استدعاء المريض بالصوت والشاشة، وبدء الكشف الطبي" : "Manage clinic queue, call waiting patients, and track consultation progress"}
                </p>
              </div>

              <Button
                onClick={() => setIsBookModalOpen(true)}
                className="gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isAr ? "حجز موعد عيادة جديد" : "Book New Appointment"}</span>
              </Button>
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-2.5 text-start">Appt #</th>
                    <th className="p-2.5 text-start">Patient Name</th>
                    <th className="p-2.5 text-start">Clinic / Department</th>
                    <th className="p-2.5 text-start">Physician</th>
                    <th className="p-2.5 text-center">Time Slot</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-mono font-bold text-cyan-800">{apt.appointmentNumber}</td>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">{apt.patientName}</strong>
                        <span className="font-mono text-[11px] text-slate-500">{apt.patientMrn}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="text-slate-900 font-medium block">
                          {isAr ? apt.departmentNameAr : apt.departmentNameEn}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs block">{apt.reasonForVisit}</span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800">{apt.clinicianName}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-700">{apt.timeSlot}</td>
                      <td className="p-2.5 text-center">
                        <StatusBadge
                          variant={
                            apt.status === "in_consultation"
                              ? "urgent"
                              : apt.status === "checked_in"
                              ? "warning"
                              : apt.status === "completed"
                              ? "stable"
                              : "routine"
                          }
                          size="sm"
                        >
                          {apt.status.replace("_", " ").toUpperCase()}
                        </StatusBadge>
                      </td>
                      <td className="p-2.5 text-end space-x-1 rtl:space-x-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallPatient(apt)}
                          className="h-7 text-[11px] gap-1 text-cyan-700 hover:bg-cyan-50"
                          title="Call patient to screen"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>{isAr ? "استدعاء" : "Call"}</span>
                        </Button>

                        {apt.status === "checked_in" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateAptStatus(apt.id, "in_consultation")}
                            className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <span>{isAr ? "بدء الكشف" : "Start"}</span>
                          </Button>
                        )}

                        {apt.status === "in_consultation" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateAptStatus(apt.id, "completed")}
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <span>{isAr ? "إنهاء الكشف" : "Complete"}</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 2: PHARMACY DISPENSING & eMAR SAFETY CONSOLE
            ------------------------------------------------------------- */}
        <TabsContent value="pharmacy" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={isAr ? "طلبات الأدوية المعلقة" : "Pending Medication Orders"}
              value={medOrders.filter((o) => o.status !== "completed").length}
              subtitle="Requiring pharmacy verification"
              icon={<Pill className="h-4 w-4 text-purple-600" />}
            />
            <StatCard
              title={isAr ? "تم صرفها اليوم" : "Dispensed Today"}
              value={medOrders.filter((o) => o.status === "completed").length}
              subtitle="Barcode verified at bedside"
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              title={isAr ? "سلامة تعارض الحساسية" : "Allergy Screen Checks"}
              value="100% Guard"
              subtitle="Automated cross-check active"
              icon={<ShieldCheck className="h-4 w-4 text-cyan-600" />}
            />
            <StatCard
              title={isAr ? "أدوية الطوارئ العاجلة (STAT)" : "STAT Urgent Orders"}
              value={medOrders.filter((o) => o.priority === "stat").length}
              subtitle="Immediate delivery protocol"
              icon={<Flame className="h-4 w-4 text-red-600" />}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple-600" />
                  <span>{isAr ? "أوامر الأدوية السريرية للمرضى المنومين (eMAR Dispensing Queue)" : "Inpatient eMAR Medication Dispensing Queue"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? "مراجعة الجرعات الطبية، فحص تعارضات الحساسية، وتأكيد الصرف مع الباركود" : "Verify clinical dosages, review allergy contraindications, and authorize pharmacy dispense"}
                </p>
              </div>

              <span className="font-mono text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded">
                Central Inpatient Pharmacy
              </span>
            </div>

            <div className="space-y-3">
              {medOrders.map((order) => {
                const isDispensed = order.status === "completed";

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isDispensed
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-white border-purple-200 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{order.orderNumber}</span>
                          <strong className="text-sm font-bold text-slate-900">{order.title}</strong>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            order.priority === "stat"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {order.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{order.details}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Patient: <strong className="text-slate-800">{order.patientName}</strong> ({order.patientMrn})</span>
                          <span>•</span>
                          <span>Ordered by: {order.orderedBy.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDispensed ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>{isAr ? "تم الصرف والتوثيق" : "Dispensed & Verified"}</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleDispenseMedication(order.id, order.title)}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{isAr ? "صرف الجرعة الدوائية" : "Dispense Dose"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 3: DIAGNOSTIC LABORATORY & AUTO-ANALYZER RESULTS
            ------------------------------------------------------------- */}
        <TabsContent value="lab" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={isAr ? "عينات قيد التحليل المخبري" : "Samples in Processing"}
              value={labOrders.filter((o) => o.status !== "completed").length}
              subtitle="Automated analyzer queue"
              icon={<FlaskConical className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              title={isAr ? "النتائج المعتمدة اليوم" : "Verified Results"}
              value={labOrders.filter((o) => o.status === "completed").length}
              subtitle="Electronic sign-off completed"
              icon={<CheckCircle2 className="h-4 w-4 text-cyan-600" />}
            />
            <StatCard
              title={isAr ? "القيم الحرجة المبلغ عنها" : "Critical Panic Alerts"}
              value={1}
              subtitle="Direct physician STAT notification"
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
            />
            <StatCard
              title={isAr ? "معدل الإنجاز السريع" : "Turnaround Time (TAT)"}
              value="28 Mins"
              subtitle="Target < 45 mins"
              icon={<Clock className="h-4 w-4 text-emerald-600" />}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "سجل عينات التحاليل وإدخال النتائج (Diagnostic Laboratory LIS)" : "Diagnostic Laboratory Sample Log & Result Entry"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? "إدخال ومطابقة نتائج التحاليل المخبرية، واعتماد القيم الحرجة وتصعيدها تلقائياً" : "Enter observed laboratory values, verify reference ranges, and auto-trigger STAT panic alerts"}
                </p>
              </div>

              <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">
                LIS Auto-Interface Active
              </span>
            </div>

            <div className="space-y-3">
              {labOrders.map((order) => {
                const isCompleted = order.status === "completed";

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isCompleted
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-white border-emerald-200 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">{order.orderNumber}</span>
                          <strong className="text-sm font-bold text-slate-900">{order.title}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-100 text-emerald-800">
                            {order.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{order.details}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>Patient: <strong className="text-slate-800">{order.patientName}</strong> ({order.patientMrn})</span>
                          <span>•</span>
                          <span>Specimen: Venous Blood Serum</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>{isAr ? "النتيجة معتمدة بالسجل" : "Result Verified"}</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedLabOrder(order);
                              setLabObservedValue("");
                              setIsCriticalResult(false);
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FlaskConical className="h-3.5 w-3.5" />
                            <span>{isAr ? "إدخال النتيجة والاعتماد" : "Enter Result"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 4: FINANCIALS & BILLING (RCM)
            ------------------------------------------------------------- */}
        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={isAr ? "مطالبات الشهر الحالي (MTD)" : "Month-to-Date Billings"}
              value="$1,428,500"
              subtitle="Clean claims submitted"
              icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              title={isAr ? "نسبة قبول المطالبات الأولية" : "First-Pass Clean Claim Rate"}
              value="94.2%"
              subtitle="Above 92% benchmark"
              trend={{ value: "+1.8%", isPositive: true }}
              icon={<ShieldCheck className="h-4 w-4 text-cyan-600" />}
            />
            <StatCard
              title={isAr ? "الموافقات التأمينية المعلقة" : "Pending Pre-Authorizations"}
              value={14}
              subtitle="Tawuniya & Bupa under review"
              icon={<Clock className="h-4 w-4 text-amber-600" />}
            />
            <StatCard
              title={isAr ? "المطالبات المرفوضة قيد الطعن" : "Appealed Denials"}
              value={3}
              subtitle="Appeals queued for submission"
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
            />
          </div>

          {/* Module A: Cashier & Inpatient Invoices */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? "فواتير التنويم والخدمات الطبية الأخيرة" : "Inpatient Invoices & Cashier Settlement Log"}
                </h3>
                <span className="text-[11px] text-slate-500">Live cashier reconciliation and co-pay settlement</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-2 text-start">Invoice #</th>
                    <th className="p-2 text-start">Patient / MRN</th>
                    <th className="p-2 text-start">Department</th>
                    <th className="p-2 text-end">Gross Amount</th>
                    <th className="p-2 text-end">Insurance Coverage</th>
                    <th className="p-2 text-end">Patient Co-Pay</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-mono font-bold text-cyan-800">INV-2026-9901</td>
                    <td className="p-2">
                      <strong className="text-slate-900 block">Tariq Mansoor Al-Harbi</strong>
                      <span className="font-mono text-[10px] text-slate-500">MRN-2026-4412</span>
                    </td>
                    <td className="p-2">Cardiovascular (Bed 304-A)</td>
                    <td className="p-2 text-end font-mono">5,543.00 SAR</td>
                    <td className="p-2 text-end font-mono text-emerald-700 font-bold">4,988.70 SAR (90%)</td>
                    <td className="p-2 text-end font-mono font-bold text-slate-950">554.30 SAR</td>
                    <td className="p-2 text-center">
                      <StatusBadge variant="stable" size="sm">SETTLED</StatusBadge>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-cyan-800">INV-2026-9902</td>
                    <td className="p-2">
                      <strong className="text-slate-900 block">Maryam Salem Al-Dawsari</strong>
                      <span className="font-mono text-[10px] text-slate-500">MRN-2026-8819</span>
                    </td>
                    <td className="p-2">Orthopedics (Bed 210-B)</td>
                    <td className="p-2 text-end font-mono">8,920.00 SAR</td>
                    <td className="p-2 text-end font-mono text-emerald-700 font-bold">7,136.00 SAR (80%)</td>
                    <td className="p-2 text-end font-mono font-bold text-slate-950">1,784.00 SAR</td>
                    <td className="p-2 text-center">
                      <StatusBadge variant="warning" size="sm">PENDING APPROVAL</StatusBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 5: SUPPLY CHAIN & CSSD
            ------------------------------------------------------------- */}
        <TabsContent value="supply_chain" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title={isAr ? "جاهزية مجموعات التعقيم الجراحي" : "Sterilized Surgical Trays Ready"}
              value="42 Trays"
              subtitle="Autoclave cycles validated"
              icon={<Package className="h-4 w-4 text-emerald-600" />}
            />
            <StatCard
              title={isAr ? "مستوى مخزون أدوية الطوارئ" : "Critical Emergency Med Stock"}
              value="98.5%"
              subtitle="Zero stock-out items"
              icon={<ShieldCheck className="h-4 w-4 text-cyan-600" />}
            />
            <StatCard
              title={isAr ? "أجهزة طبية تخضع للصيانة" : "Biomedical Maintenance Queue"}
              value={2}
              subtitle="Ventilator preventive checks"
              icon={<Wrench className="h-4 w-4 text-amber-600" />}
            />
          </div>
        </TabsContent>

        {/* -------------------------------------------------------------
            TAB 6: AMBULANCE & FLEET DISPATCH
            ------------------------------------------------------------- */}
        <TabsContent value="governance" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Ambulance className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? "لوحة تتبع وإرسال أسطول الإسعاف والإنعاش الميداني" : "Emergency Ambulance Fleet & Mobile ICU Dispatch"}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">GPS Telemetry Connected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">CALL-SIGN: MED-ICU-01</span>
                  <StatusBadge variant="critical" size="sm">Transporting</StatusBadge>
                </div>
                <div className="text-[11px] text-slate-600">Type: Advanced Life Support (ALS)</div>
                <div className="text-[10px] text-red-600 font-bold">ETA to Emergency Trauma Bay: 6 Mins</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">CALL-SIGN: AMB-BLS-02</span>
                  <StatusBadge variant="warning" size="sm">En Route</StatusBadge>
                </div>
                <div className="text-[11px] text-slate-600">Type: Basic Life Support (BLS)</div>
                <div className="text-[10px] text-amber-700 font-medium">Location: North Ring Rd, Exit 7</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">CALL-SIGN: NEO-TRANSPORT-01</span>
                  <StatusBadge variant="stable" size="sm">Station Ready</StatusBadge>
                </div>
                <div className="text-[11px] text-slate-600">Type: Mobile Neonatal ICU (Incubator Equipped)</div>
                <div className="text-[10px] text-emerald-700 font-semibold">Prepped & Sanitized at Ambulance Bay</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Book Appointment Modal */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-950 border-slate-200">
          <DialogHeader className="text-start pb-2 border-b">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-700" />
              <span>{isAr ? "حجز موعد عيادة خارجية جديد" : "Book Outpatient Clinic Appointment"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAppointment} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "اسم المريض الثلاثي:" : "Patient Full Name:"}
              </label>
              <Input
                required
                value={newAptPatient}
                onChange={(e) => setNewAptPatient(e.target.value)}
                placeholder="e.g. Faisal Nasser Al-Subaie"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "رقم الملف (MRN):" : "MRN (Optional):"}
                </label>
                <Input
                  value={newAptMrn}
                  onChange={(e) => setNewAptMrn(e.target.value)}
                  placeholder="MRN-2026-..."
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "القسم الطبي:" : "Department:"}
                </label>
                <select
                  value={newAptDept}
                  onChange={(e) => setNewAptDept(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs bg-white text-slate-900"
                >
                  {HOSPITAL_DEPARTMENTS.slice(0, 8).map((d) => (
                    <option key={d.id} value={d.id}>
                      {isAr ? d.nameAr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "تاريخ الموعد:" : "Appointment Date:"}
                </label>
                <Input
                  type="date"
                  value={newAptDate}
                  onChange={(e) => setNewAptDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "التوقيت:" : "Time Slot:"}
                </label>
                <select
                  value={newAptTime}
                  onChange={(e) => setNewAptTime(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-xs bg-white text-slate-900"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isAr ? "سبب الزيارة / الشكوى الرئيسية:" : "Reason for Visit / Complaint:"}
              </label>
              <Input
                value={newAptReason}
                onChange={(e) => setNewAptReason(e.target.value)}
                placeholder="e.g. Follow-up consultation, medication check..."
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBookModalOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold">
                {isAr ? "تأكيد الحجز" : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enter Lab Result Modal */}
      {selectedLabOrder && (
        <Dialog open={!!selectedLabOrder} onOpenChange={() => setSelectedLabOrder(null)}>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-950 border-slate-200">
            <DialogHeader className="text-start pb-2 border-b">
              <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-700" />
                <span>{isAr ? "إدخال نتيجة الفحص المخبري" : "Enter Diagnostic Test Result"}</span>
              </DialogTitle>
              <p className="text-xs text-slate-500">
                {selectedLabOrder.title} • {selectedLabOrder.patientName} ({selectedLabOrder.patientMrn})
              </p>
            </DialogHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "القيمة المرصودة (Observed Value):" : "Observed Result Value:"}
                </label>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    required
                    value={labObservedValue}
                    onChange={(e) => setLabObservedValue(e.target.value)}
                    placeholder="e.g. 142 or 0.08"
                    className="text-xs font-mono font-bold text-slate-900"
                  />
                  <Input
                    value={labUnit}
                    onChange={(e) => setLabUnit(e.target.value)}
                    placeholder="Unit (mg/dL)"
                    className="w-24 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? "المعدل المرجعي الطبيعي (Reference Range):" : "Reference Range:"}
                </label>
                <Input
                  value={labRefRange}
                  onChange={(e) => setLabRefRange(e.target.value)}
                  className="text-xs font-mono text-slate-600"
                />
              </div>

              <div className="p-3 rounded-lg border border-red-200 bg-red-50/70 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="criticalCheck"
                  checked={isCriticalResult}
                  onChange={(e) => setIsCriticalResult(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-red-400 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="criticalCheck" className="text-xs cursor-pointer">
                  <strong className="text-red-900 block font-bold">
                    {isAr ? "تصنيف كقيمة حرجة (STAT Panic Value)" : "Flag as Critical Panic Value"}
                  </strong>
                  <span className="text-[11px] text-red-700 block mt-0.5 leading-snug">
                    {isAr
                      ? "سيقوم النظام فوراً بإطلاق إنذار سريري STAT وتنبيه الطبيب المعالج على شاشته."
                      : "Triggers immediate STAT emergency telemetry alert to attending physician."}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLabOrder(null)}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  onClick={handleSaveLabResult}
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {isAr ? "اعتماد النتيجة ونشرها" : "Verify & Publish Result"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<LoadingStateView message="Loading hospital operations console..." />}>
      <OperationsContent />
    </Suspense>
  );
}
