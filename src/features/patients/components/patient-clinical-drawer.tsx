"use client";

import React, { useState } from "react";
import { Patient } from "@/types/patient";
import { useI18n } from "@/i18n/i18n-context";
import { useAuth } from "@/auth/auth-context";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { PatientIdentityHeader } from "@/components/ui/patient-identity-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { VitalsChart } from "./vitals-chart";
import { AuditStamp } from "@/components/ui/audit-stamp";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";
import { hospitalDataAdapter } from "@/api/adapter";
import { ClinicalOrderDialog } from "@/features/clinical/components/clinical-order-dialog";
import { VitalSignsEntryDialog } from "@/features/clinical/components/vital-signs-entry-dialog";
import { PatientClinicalTimeline } from "./patient-clinical-timeline";
import { DepartmentAssignmentDialog } from "@/features/departments/components/department-assignment-dialog";
import { PrintableFormsModal } from "@/components/clinical/printable-forms-modal";
import {
  HeartPulse,
  Activity,
  Pill,
  FileText,
  Printer,
  UserMinus,
  FlaskConical,
  Scan,
  History,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
  Building2,
} from "lucide-react";

interface PatientClinicalDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: Patient["status"]) => void;
}

export function PatientClinicalDrawer({
  patient,
  isOpen,
  onClose,
  onStatusChange,
}: PatientClinicalDrawerProps) {
  const { locale, direction, t } = useI18n();
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [isDischargeConfirmOpen, setIsDischargeConfirmOpen] = useState(false);
  const [isDischarging, setIsDischarging] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!patient) return null;

  const isAr = locale === "ar";
  const diagnosis = isAr ? patient.primaryDiagnosisAr : patient.primaryDiagnosisEn;
  const canDischarge = hasPermission("patients:discharge");

  const handleOrderSubmitted = async (order: any) => {
    await hospitalDataAdapter.createClinicalOrder(order);
    toast({
      title: isAr ? "تم إرسال الأمر السريري بنجاح" : "Clinical Order Dispatched",
      description: `${order.title} (${order.priority.toUpperCase()})`,
      variant: "success",
    });
  };

  const handleVitalsSubmitted = async (vitals: any) => {
    await hospitalDataAdapter.recordVitalSign(patient.id, vitals);
    toast({
      title: isAr ? "تم حفظ العلامات الحيوية" : "Vitals Recorded",
      description: `HR ${vitals.heartRate} bpm • BP ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`,
      variant: "success",
    });
  };

  const handleConfirmDischarge = async () => {
    setIsDischarging(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (onStatusChange) {
      onStatusChange(patient.id, "discharged");
    }
    toast({
      title: isAr ? "تم تسجيل خروج المريض" : "Patient Discharged Successfully",
      description: isAr
        ? `تم إنهاء إجراءات خروج ${patient.fullNameAr} وإحالة السرير ${patient.bed.bedNumber} للتعقيم والتجهيز.`
        : `Discharge orders confirmed for ${patient.fullNameEn}. Bed ${patient.bed.bedNumber} queued for terminal sanitization.`,
      variant: "warning",
    });
    setIsDischarging(false);
    setIsDischargeConfirmOpen(false);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent
          side={direction === "rtl" ? "left" : "right"}
          className="sm:max-w-3xl p-4 overflow-y-auto dark-scrollbar"
        >
          {/* Patient Identity Header */}
          <PatientIdentityHeader
            patient={patient}
            actions={
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVitalsDialogOpen(true)}
                  className="gap-1 text-xs"
                >
                  <HeartPulse className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="hidden sm:inline">{isAr ? "رصد العلامات" : "Record Vitals"}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOrderDialogOpen(true)}
                  className="gap-1 text-xs bg-cyan-700 hover:bg-cyan-800 text-white"
                >
                  <Pill className="h-3.5 w-3.5" />
                  <span>{isAr ? "أمر CPOE" : "New Order"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignmentDialogOpen(true)}
                  className="gap-1 text-xs text-slate-700 dark:text-slate-300"
                >
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden sm:inline">{isAr ? "إحالة / تحويل" : "Transfer / Consult"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="no-print gap-1 text-xs text-slate-700 dark:text-slate-200 border-slate-300 hover:bg-slate-100"
                  title={isAr ? "طباعة النماذج الرسمية (إسورة، تقرير خروج، روشتة، فاتورة)" : "Print Official Hospital Documents"}
                >
                  <Printer className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="hidden sm:inline">{isAr ? "طباعة الوثائق" : "Print Docs"}</span>
                </Button>
                {patient.status !== "discharged" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!canDischarge}
                    title={!canDischarge ? "Requires Attending Physician or Medical Director authorization" : undefined}
                    onClick={() => setIsDischargeConfirmOpen(true)}
                  >
                    {!canDischarge ? (
                      <Lock className="mr-1 h-3.5 w-3.5 rtl:ml-1 rtl:mr-0 opacity-70" />
                    ) : (
                      <UserMinus className="mr-1 h-3.5 w-3.5 rtl:ml-1 rtl:mr-0" />
                    )}
                    <span>{isAr ? "تسجيل الخروج" : "Discharge"}</span>
                  </Button>
                )}
              </div>
            }
          />

          {/* Admission & Diagnosis Banner */}
          <div className="mt-3 rounded border border-slate-200 bg-slate-50/90 p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                {t.patient.primaryDiagnosis}:
              </span>
              <StatusBadge
                variant={
                  patient.triageLevel === "1_resuscitation"
                    ? "critical"
                    : patient.triageLevel === "2_emergent"
                    ? "urgent"
                    : "routine"
                }
              >
                {patient.triageLevel.replace("_", " ").toUpperCase()}
              </StatusBadge>
            </div>
            <p className="font-medium text-slate-900">{diagnosis}</p>
          </div>

          {/* Clinical Workstation Tabs */}
          <div className="mt-4">
            <Tabs defaultValue="vitals">
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 w-full gap-1 h-auto p-1 bg-slate-100">
                <TabsTrigger value="vitals" className="gap-1 py-1 text-xs">
                  <HeartPulse className="h-3 w-3" />
                  <span>{isAr ? "العلامات" : "Vitals"}</span>
                </TabsTrigger>
                <TabsTrigger value="meds" className="gap-1 py-1 text-xs">
                  <Pill className="h-3 w-3" />
                  <span>{isAr ? "الأدوية" : "Meds"} ({patient.medications?.length || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="labs" className="gap-1 py-1 text-xs">
                  <FlaskConical className="h-3 w-3" />
                  <span>{isAr ? "المختبر" : "Labs"} ({patient.labReports?.length || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="rad" className="gap-1 py-1 text-xs">
                  <Scan className="h-3 w-3" />
                  <span>{isAr ? "الأشعة" : "Imaging"} ({patient.radiologyStudies?.length || 0})</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1 py-1 text-xs">
                  <FileText className="h-3 w-3" />
                  <span>{isAr ? "الملاحظات" : "Notes"}</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-1 py-1 text-xs font-semibold">
                  <Calendar className="h-3 w-3 text-cyan-600" />
                  <span>{isAr ? "الجدول الزمني" : "Timeline"}</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1 py-1 text-xs">
                  <History className="h-3 w-3" />
                  <span>{isAr ? "السجل" : "History"}</span>
                </TabsTrigger>
                <TabsTrigger value="discharge" className="gap-1 py-1 text-xs">
                  <FileCheck className="h-3 w-3" />
                  <span>{isAr ? "الخروج" : "Discharge"}</span>
                </TabsTrigger>
              </TabsList>

              {/* 1. Vitals Tab */}
              <TabsContent value="vitals" className="space-y-3 pt-2">
                {patient.latestVitals && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded border border-slate-200 bg-white p-2 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">{isAr ? "نبض القلب" : "Heart Rate"}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {patient.latestVitals.heartRate}{" "}
                        <span className="text-[10px] font-normal text-slate-500">bpm</span>
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-white p-2 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">{isAr ? "ضغط الدم" : "Blood Pressure"}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {patient.latestVitals.systolicBP}/{patient.latestVitals.diastolicBP}{" "}
                        <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-white p-2 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">{isAr ? "أكسجين الدم" : "SpO2"}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {patient.latestVitals.oxygenSaturation}%
                      </div>
                    </div>
                    <div className="rounded border border-slate-200 bg-white p-2 text-center">
                      <div className="text-[10px] text-slate-500 uppercase">{isAr ? "حرارة الجسم" : "Body Temp"}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">
                        {patient.latestVitals.temperature}°C
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold text-slate-800 mb-1">
                    {isAr ? "مخطط التغير الفسيولوجي المباشر" : "Physiological Vital Trend Stream"}
                  </div>
                  <VitalsChart vitals={patient.vitalsHistory || []} />
                </div>
              </TabsContent>

              {/* 2. Medications Tab */}
              <TabsContent value="meds" className="space-y-2 pt-2">
                {patient.medications && patient.medications.length > 0 ? (
                  patient.medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between rounded border border-slate-200 bg-white p-2.5 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{med.drugName}</div>
                        <div className="text-[11px] text-slate-500">
                          Route: {med.route} • Frequency: {med.frequency} • Dosage: {med.dosage}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ordered by {med.prescribedBy} at {new Date(med.prescribedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <StatusBadge
                        variant={med.status === "active" ? "stable" : "neutral"}
                        size="sm"
                      >
                        {med.status.toUpperCase()}
                      </StatusBadge>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active medication orders recorded.
                  </div>
                )}
              </TabsContent>

              {/* 3. Labs Tab */}
              <TabsContent value="labs" className="space-y-2 pt-2">
                {patient.labReports && patient.labReports.length > 0 ? (
                  patient.labReports.map((lab) => (
                    <div
                      key={lab.id}
                      className={`rounded border p-3 text-xs space-y-1.5 ${
                        lab.status === "critical"
                          ? "border-red-300 bg-red-50/50"
                          : lab.status === "abnormal"
                          ? "border-amber-300 bg-amber-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            {lab.status === "critical" && <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
                            {lab.status === "abnormal" && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                            <span>{lab.testName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Category: {lab.category} • Specimen: {lab.specimenType}
                          </div>
                        </div>
                        <StatusBadge
                          variant={lab.status === "critical" ? "critical" : lab.status === "abnormal" ? "warning" : "stable"}
                          size="sm"
                        >
                          {lab.status.toUpperCase()}
                        </StatusBadge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Observed Value:</span>
                          <strong className="text-slate-900 text-sm">{lab.resultValue} {lab.unit}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Reference Range:</span>
                          <span className="text-slate-700 font-mono">{lab.referenceRange}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-500 block">Verified By:</span>
                          <span className="text-slate-700 truncate block">{lab.verifiedBy}</span>
                        </div>
                      </div>

                      {lab.flagReason && (
                        <div className="text-[11px] text-red-800 font-medium">
                          Clinical Note: {lab.flagReason}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No verified laboratory results for this inpatient encounter.
                  </div>
                )}
              </TabsContent>

              {/* 4. Radiology Studies Tab */}
              <TabsContent value="rad" className="space-y-2 pt-2">
                {patient.radiologyStudies && patient.radiologyStudies.length > 0 ? (
                  patient.radiologyStudies.map((study) => (
                    <div
                      key={study.id}
                      className="rounded border border-slate-200 bg-white p-3 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span className="rounded bg-cyan-900 text-cyan-200 px-1.5 py-0.2 font-mono text-[10px]">
                              {study.modality}
                            </span>
                            <span>{study.procedureName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Accession: {study.accessionNumber} • Indication: {study.indication}
                          </div>
                        </div>
                        <StatusBadge variant="stable" size="sm">
                          {study.status.toUpperCase()}
                        </StatusBadge>
                      </div>

                      <div className="rounded bg-slate-50 p-2 border border-slate-100 space-y-1">
                        <div>
                          <strong className="text-slate-800">Impression:</strong>{" "}
                          <span className="text-slate-700">{study.impression}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Findings:</strong>{" "}
                          <span className="text-slate-600 text-[11px]">{study.findings}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1">
                        <span>Reported by: {study.radiologist}</span>
                        <span>Completed: {new Date(study.completedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No diagnostic imaging studies requested for current admission.
                  </div>
                )}
              </TabsContent>

              {/* 5. Progress Notes Tab (SOAP) */}
              <TabsContent value="notes" className="space-y-3 pt-2">
                {patient.clinicalNotes && patient.clinicalNotes.length > 0 ? (
                  patient.clinicalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded border border-slate-200 bg-white p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-900">{note.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 text-slate-700">
                        <p>
                          <strong className="text-slate-900">S (Subjective):</strong>{" "}
                          {note.soap.subjective}
                        </p>
                        <p>
                          <strong className="text-slate-900">O (Objective):</strong>{" "}
                          {note.soap.objective}
                        </p>
                        <p>
                          <strong className="text-slate-900">A (Assessment):</strong>{" "}
                          {note.soap.assessment}
                        </p>
                        <p>
                          <strong className="text-slate-900">P (Plan):</strong>{" "}
                          {note.soap.plan}
                        </p>
                      </div>
                      <div className="pt-1">
                        <AuditStamp
                          timestamp={note.timestamp}
                          actorName={note.authorName}
                          actorRole={note.authorRole}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No SOAP progress notes on record for current encounter.
                  </div>
                )}
              </TabsContent>

              {/* 6. Encounters & History Tab */}
              <TabsContent value="history" className="space-y-3 pt-2">
                {/* Past Medical & Surgical History */}
                {patient.pastMedicalHistory && (
                  <div className="rounded border border-slate-200 bg-white p-3 text-xs space-y-2">
                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                      {isAr ? "التاريخ الطبي والجراحي السابق" : "Past Medical, Surgical & Family History"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Chronic Conditions:</span>
                        <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                          {patient.pastMedicalHistory.conditions.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Past Surgeries:</span>
                        <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                          {patient.pastMedicalHistory.pastSurgeries.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Encounter Timeline */}
                <div className="rounded border border-slate-200 bg-white p-3 text-xs space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                    {isAr ? "سجل الزيارات والتنويم بالمستشفى" : "Hospital Encounters & Episodes of Care"}
                  </div>
                  {patient.encounters && patient.encounters.length > 0 ? (
                    patient.encounters.map((enc) => (
                      <div key={enc.id} className="rounded bg-slate-50 p-2 border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {enc.type.toUpperCase()}: {enc.departmentNameEn}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(enc.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{enc.chiefComplaint}</p>
                        {enc.disposition && (
                          <div className="text-[10px] text-cyan-800 font-medium">
                            Disposition: {enc.disposition}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs">Single active admission episode.</div>
                  )}
                </div>
              </TabsContent>

              {/* 7. Discharge Summary Tab */}
              <TabsContent value="discharge" className="space-y-3 pt-2">
                {patient.dischargeSummary ? (
                  <div className="rounded border border-emerald-200 bg-emerald-50/30 p-3.5 text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Formal Clinical Discharge Summary</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Authorized: {new Date(patient.dischargeSummary.dischargeDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 block">Final Diagnosis:</strong>
                      <div className="text-slate-800 font-medium">{patient.dischargeSummary.finalDiagnosisEn}</div>
                      <div className="text-slate-600 text-[11px]">{patient.dischargeSummary.finalDiagnosisAr}</div>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 block">Condition at Discharge:</strong>
                      <p className="text-slate-700 bg-white p-2 rounded border border-slate-200">
                        {patient.dischargeSummary.conditionAtDischarge}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 block">Outpatient Follow-Up Plan:</strong>
                      <p className="text-slate-700 bg-white p-2 rounded border border-slate-200">
                        {patient.dischargeSummary.followUpPlan}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-900 block">Discharge Prescriptions:</strong>
                      <ul className="list-disc list-inside bg-white p-2 rounded border border-slate-200 text-slate-700 space-y-0.5">
                        {patient.dischargeSummary.prescriptionsOnDischarge.map((rx, idx) => (
                          <li key={idx} className="font-mono text-[11px]">{rx}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Authorized & Electronically Signed by: <strong>{patient.dischargeSummary.dischargedBy}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="rounded border border-slate-200 bg-white p-4 text-center text-xs space-y-2">
                    <FileCheck className="h-6 w-6 text-slate-400 mx-auto" />
                    <div className="font-medium text-slate-800">
                      Discharge Summary Not Yet Generated
                    </div>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Patient is currently under active inpatient treatment. Discharge orders and prescriptions will be compiled when the patient is marked as discharge ready.
                    </p>
                    {patient.status !== "discharged" && canDischarge && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={() => setIsDischargeConfirmOpen(true)}
                      >
                        Initiate Discharge Order Protocol
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-3 pt-2">
                <PatientClinicalTimeline patientId={patient.id} />
              </TabsContent>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirmation Dialog for Discharge */}
      <ConfirmationDialog
        isOpen={isDischargeConfirmOpen}
        onClose={() => setIsDischargeConfirmOpen(false)}
        onConfirm={handleConfirmDischarge}
        title={isAr ? "تأكيد تسجيل خروج المريض" : "Discharge Patient Confirmation"}
        description={
          isAr
            ? `هل أنت متأكد من رغبتك في اعتماد خروج المريض ${patient.fullNameAr} (${patient.mrn})؟ سيتم تحويل السرير ${patient.bed.bedNumber} لحالة التعقيم فوراً.`
            : `Are you sure you want to finalize the discharge order for ${patient.fullNameEn} (${patient.mrn})? Bed ${patient.bed.bedNumber} will be queued for terminal sanitization.`
        }
        confirmLabel={isAr ? "اعتماد الخروج" : "Finalize Discharge"}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        variant="destructive"
        isLoading={isDischarging}
      />

      {/* CPOE Order Entry Dialog */}
      <ClinicalOrderDialog
        patient={patient}
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        onSubmitOrder={handleOrderSubmitted}
      />

      {/* Bedside Vital Signs Entry Dialog */}
      <VitalSignsEntryDialog
        patient={patient}
        isOpen={isVitalsDialogOpen}
        onClose={() => setIsVitalsDialogOpen(false)}
        onSubmitVitals={handleVitalsSubmitted}
      />

      {/* Department Referral & Transfer Dialog */}
      <DepartmentAssignmentDialog
        patient={patient}
        isOpen={isAssignmentDialogOpen}
        onClose={() => setIsAssignmentDialogOpen(false)}
      />

      {/* Official Clinical & Financial Printable Forms Modal */}
      <PrintableFormsModal
        patient={patient}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </>
  );
}
