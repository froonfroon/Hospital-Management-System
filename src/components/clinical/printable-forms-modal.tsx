"use client";

import React, { useState } from "react";
import { Patient } from "@/types/patient";
import { useI18n } from "@/i18n/i18n-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer,
  FileText,
  CreditCard,
  Pill,
  QrCode,
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
} from "lucide-react";

interface PrintableFormsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "wristband" | "discharge" | "prescription" | "invoice";
}

export function PrintableFormsModal({
  patient,
  isOpen,
  onClose,
  defaultTab = "wristband",
}: PrintableFormsModalProps) {
  const { locale } = useI18n();
  const [activeDoc, setActiveDoc] = useState<"wristband" | "discharge" | "prescription" | "invoice">(defaultTab);

  if (!patient) return null;

  const isAr = locale === "ar";
  const patientName = isAr ? patient.fullNameAr : patient.fullNameEn;
  const primaryDiagnosis = isAr ? patient.primaryDiagnosisAr : patient.primaryDiagnosisEn;
  const deptName = isAr ? patient.departmentNameAr : patient.departmentNameEn;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-slate-200">
        {/* Modal Header & Document Switcher (Hidden in Print) */}
        <div className="no-print p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <DialogHeader className="p-0 text-start">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-cyan-600" />
                <span>{isAr ? "مركز طباعة النماذج السريرية والمالية الرسمية" : "Official Clinical & Billing Print Center"}</span>
              </DialogTitle>
              <p className="text-xs text-slate-500">
                {patientName} • {patient.mrn} • {patient.bed.bedNumber} ({patient.bed.departmentCode})
              </p>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                className="gap-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>{isAr ? "طباعة الوثيقة الرسمية (Print)" : "Print Official Document"}</span>
              </Button>
            </div>
          </div>

          {/* Document Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveDoc("wristband")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === "wristband"
                  ? "bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <QrCode className="h-4 w-4 text-cyan-600" />
              <span>{isAr ? "إسورة المريض (Wristband)" : "Patient Wristband"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoc("discharge")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === "discharge"
                  ? "bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>{isAr ? "تقرير الخروج (Discharge)" : "Discharge Summary"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoc("prescription")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === "prescription"
                  ? "bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Pill className="h-4 w-4 text-purple-600" />
              <span>{isAr ? "الروشتة الرسمية (Rx)" : "Prescription (Rx)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoc("invoice")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeDoc === "invoice"
                  ? "bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Receipt className="h-4 w-4 text-amber-600" />
              <span>{isAr ? "فاتورة العلاج (Invoice)" : "Hospital Invoice"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 dark-scrollbar bg-slate-100/60 dark:bg-slate-950/40">
          {/* Printable Container Body */}
          <div className="max-w-2xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
            {/* 1. DOCUMENT: PATIENT IDENTIFICATION WRISTBAND */}
            {activeDoc === "wristband" && (
              <div className="space-y-6">
                <div className="text-center border-b pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                    ISO 18000-6C Standard • Hospital Inpatient RFID / Barcode Wristband
                  </span>
                </div>

                {/* Simulated Physical Hospital Wristband Strip */}
                <div className="border-4 border-slate-800 rounded-2xl p-4 bg-white relative overflow-hidden shadow-inner">
                  {/* Top Bar with Hospital Branding & Emergency Blood Type */}
                  <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-cyan-800 text-white font-black text-xs flex items-center justify-center">
                          H
                        </div>
                        <span className="font-black text-sm tracking-wide uppercase">HospitalOS Academic Medical Center</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 block mt-0.5">
                        Inpatient Identification Bracelet • {deptName}
                      </span>
                    </div>

                    <div className="text-center px-3 py-1 bg-red-600 text-white rounded-lg border-2 border-red-700 shrink-0">
                      <span className="text-[9px] block uppercase font-bold leading-tight">Blood Type</span>
                      <span className="text-lg font-black leading-none">{patient.bloodType}</span>
                    </div>
                  </div>

                  {/* Patient Demographics & Bed Location */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-b-2 border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Patient Name / الاسم:</span>
                      <strong className="text-sm font-black text-slate-950 block">{patient.fullNameEn}</strong>
                      <span className="text-xs font-bold text-slate-800 block">{patient.fullNameAr}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">MRN / الملف الطبي:</span>
                      <span className="font-mono text-sm font-black text-cyan-900 block">{patient.mrn}</span>
                      <span className="text-[11px] text-slate-600 block">Nat ID: {patient.nationalId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Bed Location / السرير:</span>
                      <span className="font-mono text-sm font-black text-slate-900 block">{patient.bed.bedNumber}</span>
                      <span className="text-[11px] text-slate-600 block">Room: {patient.bed.roomNumber} ({patient.bed.departmentCode})</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">DOB & Age / العمر:</span>
                      <span className="text-xs font-semibold block">{patient.dateOfBirth} ({patient.age} yrs, {patient.gender.toUpperCase()})</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Admission Date / الدخول:</span>
                      <span className="text-xs font-semibold block">{new Date(patient.admissionDate).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Attending Doctor / الطبيب:</span>
                      <span className="text-xs font-semibold block truncate">{patient.attendingPhysician}</span>
                    </div>
                  </div>

                  {/* Prominent High-Visibility Allergies Warning Strip */}
                  <div className="my-3 p-2 bg-red-100 border-2 border-red-500 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-black text-red-900 tracking-wider block">
                          CRITICAL PATIENT ALLERGIES / تنبيه الحساسية الدوائية:
                        </span>
                        <span className="text-xs font-black text-red-800">
                          {patient.allergies && patient.allergies.length > 0
                            ? patient.allergies.map((a) => `${a.substance.toUpperCase()} (${a.severity.toUpperCase()})`).join(", ")
                            : "NO KNOWN DRUG ALLERGIES (NKDA)"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                      ALLERGY GUARD
                    </span>
                  </div>

                  {/* Scannable High-Fidelity Linear Barcode & QR Code */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {/* CSS Simulated Barcode Pattern */}
                      <div className="h-12 w-full flex items-stretch gap-[2px] bg-white py-1">
                        {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 2, 1, 3, 1, 4].map((w, idx) => (
                          <div
                            key={idx}
                            className="bg-black shrink-0"
                            style={{ width: `${w * 2}px` }}
                          />
                        ))}
                      </div>
                      <div className="text-center font-mono text-xs font-bold tracking-widest text-slate-800">
                        *{patient.mrn}*
                      </div>
                    </div>

                    <div className="h-16 w-16 border-2 border-slate-900 rounded p-1 flex flex-col items-center justify-center shrink-0 bg-white">
                      <QrCode className="h-10 w-10 text-slate-900" />
                      <span className="text-[8px] font-mono font-bold">SCAN MRN</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 text-center">
                  Wristband is tamper-evident and waterproof. Scan barcode before any medication administration or invasive procedure.
                </div>
              </div>
            )}

            {/* 2. DOCUMENT: INPATIENT DISCHARGE SUMMARY */}
            {activeDoc === "discharge" && (
              <div className="space-y-5 text-xs text-slate-900">
                {/* Official Bilingual Hospital Header */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-cyan-800 text-white font-black text-base flex items-center justify-center">
                          H
                        </div>
                        <div>
                          <h1 className="text-base font-black tracking-tight text-slate-950 uppercase">
                            Solve Codex Academic Medical Center
                          </h1>
                          <p className="text-[11px] font-semibold text-slate-700">
                            مركز سولف كودكس الطبي الأكاديمي • وزارة الصحة
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Accredited by JCI & CBAHI • License # MOH-MED-88912 • ISO 9001:2026
                      </p>
                    </div>

                    <div className="text-end font-mono text-[10px] text-slate-600">
                      <div className="font-bold text-slate-900 text-xs">CLINICAL DISCHARGE SUMMARY</div>
                      <div>تقرير خروج طبي رسمي</div>
                      <div>Encounter: ENC-2026-901</div>
                      <div>Date: {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Patient Information Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Patient Name:</span>
                    <strong className="text-xs font-bold text-slate-900 block">{patient.fullNameEn}</strong>
                    <span className="text-[11px] text-slate-700">{patient.fullNameAr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">MRN & National ID:</span>
                    <span className="font-mono font-bold text-cyan-900 block">{patient.mrn}</span>
                    <span className="text-[11px] text-slate-600">{patient.nationalId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Age / Gender / Blood:</span>
                    <span className="font-medium text-slate-900 block">{patient.age} Yrs • {patient.gender.toUpperCase()} • {patient.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Treating Ward / Bed:</span>
                    <span className="font-medium text-slate-900 block">{deptName} ({patient.bed.bedNumber})</span>
                  </div>
                </div>

                {/* Admission & Discharge Timestamps */}
                <div className="grid grid-cols-2 gap-3 bg-cyan-50/60 p-2.5 rounded border border-cyan-200 text-slate-800">
                  <div>
                    <span className="font-bold text-[11px] text-cyan-950 block">Admission Date & Time:</span>
                    <span className="font-mono text-xs">{new Date(patient.admissionDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-cyan-950 block">Discharge Date & Time:</span>
                    <span className="font-mono text-xs">{new Date().toLocaleString()} (Authorized)</span>
                  </div>
                </div>

                {/* Clinical Diagnoses Section */}
                <div className="space-y-1.5 border-t pt-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Clinical Diagnoses (ICD-10-AM) / التشخيص الطبي:</span>
                  </h3>
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">Primary Diagnosis: </span>
                      <strong className="text-slate-950">{patient.primaryDiagnosisEn}</strong>
                      <span className="text-slate-600 block text-[11px] mt-0.5">{patient.primaryDiagnosisAr}</span>
                    </div>
                    {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                      <div className="pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                        <span className="font-semibold">Secondary / Comorbidities: </span>
                        {patient.chronicConditions.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary of Inpatient Hospital Course */}
                <div className="space-y-1.5 border-t pt-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                    Summary of Inpatient Hospital Course / ملخص فترة التنويم والعلاج:
                  </h3>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    Patient was admitted with acute symptoms under the care of {patient.attendingPhysician}. Complete hemodynamic monitoring and diagnostic workup completed. Vital signs stabilized within normal parameters. Patient is clinically stable, ambulating independently, and clear for discharge with home care plan.
                  </p>
                </div>

                {/* Discharge Medications Table */}
                <div className="space-y-1.5 border-t pt-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-purple-600" />
                    <span>Discharge Medications Protocol / الأدوية الموصوفة عند الخروج:</span>
                  </h3>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-1.5 text-start">Medication</th>
                        <th className="border border-slate-300 p-1.5 text-start">Dosage & Route</th>
                        <th className="border border-slate-300 p-1.5 text-start">Frequency</th>
                        <th className="border border-slate-300 p-1.5 text-start">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.medications && patient.medications.length > 0 ? (
                        patient.medications.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-1.5 font-bold">{m.drugName}</td>
                            <td className="border border-slate-300 p-1.5">{m.dosage} ({m.route})</td>
                            <td className="border border-slate-300 p-1.5">{m.frequency}</td>
                            <td className="border border-slate-300 p-1.5">14 Days (Until OPD review)</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-slate-300 p-1.5 font-bold">Atorvastatin (Lipitor)</td>
                          <td className="border border-slate-300 p-1.5">40 mg Oral</td>
                          <td className="border border-slate-300 p-1.5">Once daily at bedtime</td>
                          <td className="border border-slate-300 p-1.5">30 Days</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Follow-up & Emergency Warning Signs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-950 block text-[11px] mb-1">
                      ⚠️ Outpatient Follow-up Plan / المتابعة:
                    </span>
                    <p className="text-amber-900 text-[11px]">
                      Follow-up appointment scheduled at Cardiology Outpatient Clinic in 10 days. Bring this summary and current medication box.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-red-50 border border-red-200">
                    <span className="font-bold text-red-950 block text-[11px] mb-1">
                      🚨 Emergency Red Flags / إرشادات الطوارئ:
                    </span>
                    <p className="text-red-900 text-[11px]">
                      Return immediately to Emergency Department in case of chest discomfort, sudden shortness of breath, dizziness, or syncope.
                    </p>
                  </div>
                </div>

                {/* Electronic Signature Stamp Box */}
                <div className="border-t-2 border-slate-800 pt-4 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <div>Document Control: SEC-DIS-2026-X9</div>
                    <div>Digital Verification Hash: SHA256: 7f89b41a9902cf120</div>
                    <div>Hospital Electronic Health Record Validated</div>
                  </div>

                  <div className="border-2 border-cyan-800 rounded-lg p-2.5 bg-cyan-50/50 text-center min-w-[200px]">
                    <span className="text-[9px] uppercase font-bold text-cyan-900 block leading-tight">
                      Digitally Signed & Certified
                    </span>
                    <strong className="text-xs text-slate-950 block my-0.5">{patient.attendingPhysician}</strong>
                    <span className="text-[10px] text-slate-600 block">Consultant Cardiologist • Lic # 88210-MD</span>
                    <span className="font-mono text-[9px] text-cyan-800 block mt-1">
                      TIMESTAMP: {new Date().toISOString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DOCUMENT: OFFICIAL PRESCRIPTION (Rx) */}
            {activeDoc === "prescription" && (
              <div className="space-y-5 text-xs text-slate-900">
                {/* Rx Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-black uppercase text-slate-950">
                      Solve Codex Academic Medical Center
                    </h2>
                    <p className="text-[11px] text-slate-600">Department of Inpatient & Outpatient Pharmacy</p>
                  </div>
                  <div className="text-end font-mono text-[10px] text-slate-600">
                    <div className="font-bold text-slate-900 text-xs">OFFICIAL MEDICAL PRESCRIPTION</div>
                    <div>Rx Serial: RX-2026-{Math.floor(10000 + Math.random() * 90000)}</div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient:</span>
                    <strong>{patient.fullNameEn}</strong>
                    <span className="text-[11px] text-slate-600 block">{patient.fullNameAr}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">MRN:</span>
                    <span className="font-mono font-bold text-cyan-900">{patient.mrn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Age / Gender:</span>
                    <span>{patient.age} yrs • {patient.gender.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Allergies Check:</span>
                    <span className="font-bold text-red-600">
                      {patient.allergies?.length ? patient.allergies.map((a) => a.substance).join(", ") : "NKDA (None)"}
                    </span>
                  </div>
                </div>

                {/* Big Rx Symbol & Prescribed Drugs */}
                <div className="space-y-4 pt-2">
                  <div className="text-3xl font-serif font-black text-slate-900 italic">
                    ℞
                  </div>

                  <div className="space-y-3">
                    {patient.medications && patient.medications.length > 0 ? (
                      patient.medications.map((m, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <strong className="text-sm text-slate-950 font-bold">
                              {idx + 1}. {m.drugName} ({m.dosage})
                            </strong>
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              Route: {m.route}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700">
                            Sig / Instructions: Take {m.frequency} with water. Complete full course as instructed.
                          </p>
                          <div className="text-[10px] text-slate-500">
                            Prescribed for: {primaryDiagnosis}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                        <strong className="text-sm text-slate-950 font-bold">1. Atorvastatin (Lipitor) 40mg</strong>
                        <p className="text-xs text-slate-700">Sig: Take 1 tablet orally once daily at bedtime for 30 days.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dispensing Warning & Doctor Signature */}
                <div className="border-t-2 border-slate-800 pt-4 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 max-w-xs space-y-1">
                    <p className="font-bold text-slate-700">Pharmacy Dispensing Notice:</p>
                    <p>Substitutions not permitted without prescriber approval. Refills: 0 (Requires clinical review).</p>
                  </div>

                  <div className="border-2 border-slate-900 rounded p-2 text-center min-w-[180px] bg-slate-50">
                    <span className="text-[9px] uppercase font-bold text-slate-600 block">Prescribing Physician</span>
                    <strong className="text-xs text-slate-950 block">{patient.attendingPhysician}</strong>
                    <span className="text-[9px] text-slate-500 block font-mono">Verified via e-Prescribe Portal</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DOCUMENT: HOSPITAL INVOICE & TAX BILL */}
            {activeDoc === "invoice" && (
              <div className="space-y-5 text-xs text-slate-900">
                {/* Tax Invoice Header */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-black uppercase text-slate-950">
                      Solve Codex Healthcare Corporation
                    </h2>
                    <p className="text-[11px] text-slate-600">VAT / Tax Registration # 310988231000003</p>
                  </div>
                  <div className="text-end font-mono text-[10px] text-slate-600">
                    <div className="font-bold text-slate-900 text-xs">OFFICIAL INPATIENT TAX INVOICE</div>
                    <div>فاتورة ضريبية للعلاج والتنويم</div>
                    <div>Inv #: INV-2026-{Math.floor(10000 + Math.random() * 90000)}</div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Bill To & Insurance Provider */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Patient / المريض:</span>
                    <strong className="text-xs text-slate-950 block">{patient.fullNameEn}</strong>
                    <span className="text-[11px] text-slate-700 block">{patient.fullNameAr}</span>
                    <span className="text-[11px] font-mono text-cyan-900 block mt-0.5">MRN: {patient.mrn}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Insurance Provider / شركة التأمين:</span>
                    <strong className="text-xs text-emerald-900 block">{patient.insurance.provider}</strong>
                    <span className="text-[11px] text-slate-700 block">Policy: {patient.insurance.policyNumber}</span>
                    <span className="text-[11px] font-bold text-slate-800 block mt-0.5">
                      Coverage: {patient.insurance.coveragePercent}% (Co-Pay: {100 - patient.insurance.coveragePercent}%)
                    </span>
                  </div>
                </div>

                {/* Itemized Services Table */}
                <div className="space-y-1">
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 p-2 text-start">Service / Code</th>
                        <th className="border border-slate-300 p-2 text-center">Qty / Days</th>
                        <th className="border border-slate-300 p-2 text-end">Unit Price (SAR)</th>
                        <th className="border border-slate-300 p-2 text-end">Total (SAR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">
                          <span className="font-bold block">Inpatient Ward Accommodation ({patient.bed.departmentCode})</span>
                          <span className="text-[10px] text-slate-500">Room {patient.bed.roomNumber}, Bed {patient.bed.bedNumber} with 24/7 nursing</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">3 Days</td>
                        <td className="border border-slate-300 p-2 text-end">850.00</td>
                        <td className="border border-slate-300 p-2 text-end font-bold">2,550.00</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">
                          <span className="font-bold block">Attending Consultant Clinical Care & Rounds</span>
                          <span className="text-[10px] text-slate-500">{patient.attendingPhysician}</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">3 Sessions</td>
                        <td className="border border-slate-300 p-2 text-end">400.00</td>
                        <td className="border border-slate-300 p-2 text-end font-bold">1,200.00</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">
                          <span className="font-bold block">Clinical Laboratory & Diagnostic Blood Panel</span>
                          <span className="text-[10px] text-slate-500">Cardiac Troponin, Lipid Profile, CBC, Coagulation Screen</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">1 Panel</td>
                        <td className="border border-slate-300 p-2 text-end">650.00</td>
                        <td className="border border-slate-300 p-2 text-end font-bold">650.00</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">
                          <span className="font-bold block">Inpatient Pharmaceutical & Administration Protocol</span>
                          <span className="text-[10px] text-slate-500">IV anticoagulation, statins, supportive medications</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">Regimen</td>
                        <td className="border border-slate-300 p-2 text-end">420.00</td>
                        <td className="border border-slate-300 p-2 text-end font-bold">420.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary & Co-Pay Calculation */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-72 space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal Gross:</span>
                      <span className="font-mono font-bold">4,820.00 SAR</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (15%):</span>
                      <span className="font-mono">723.00 SAR</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                      <span>Total Invoice Amount:</span>
                      <span className="font-mono">5,543.00 SAR</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Insurance Share ({patient.insurance.coveragePercent}%):</span>
                      <span className="font-mono">- {(5543 * (patient.insurance.coveragePercent / 100)).toFixed(2)} SAR</span>
                    </div>
                    <div className="flex justify-between text-cyan-950 font-black text-sm border-t-2 border-slate-900 pt-1.5 bg-cyan-100/50 p-1.5 rounded">
                      <span>Patient Co-Pay Due:</span>
                      <span className="font-mono text-cyan-900">
                        {(5543 * ((100 - patient.insurance.coveragePercent) / 100)).toFixed(2)} SAR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="border-t-2 border-slate-800 pt-4 flex items-center justify-between text-[10px] text-slate-500">
                  <div>
                    <div>Electronic Payment Gateway: APPROVED</div>
                    <div>Pre-authorization Code: TAW-AUTH-99412</div>
                  </div>

                  <div className="border border-slate-400 px-3 py-1.5 rounded text-center font-mono font-bold text-slate-800">
                    PAID & CERTIFIED
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
