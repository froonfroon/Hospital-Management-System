"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient } from "@/types/patient";
import { ClinicalOrder } from "@/types/clinical";
import { useI18n } from "@/i18n/i18n-context";
import { useAuth } from "@/auth/auth-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Pill,
  FlaskConical,
  Scan,
  ArrowRightLeft,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from "lucide-react";

const clinicalOrderSchema = z.object({
  orderType: z.enum(["medication", "laboratory", "radiology", "transfer"]),
  priority: z.enum(["routine", "urgent", "stat"]),
  title: z.string().min(2, "Order name is required"),
  dosage: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  targetDepartmentId: z.string().optional(),
  clinicalIndication: z.string().min(3, "Clinical indication is required"),
  notes: z.string().optional(),
});

type ClinicalOrderFormValues = z.infer<typeof clinicalOrderSchema>;

interface ClinicalOrderDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOrder: (order: Omit<ClinicalOrder, "id" | "orderNumber" | "orderedAt">) => Promise<void>;
}

export function ClinicalOrderDialog({
  patient,
  isOpen,
  onClose,
  onSubmitOrder,
}: ClinicalOrderDialogProps) {
  const { locale } = useI18n();
  const { user, hasPermission } = useAuth();
  const isAr = locale === "ar";

  const [orderCategory, setOrderCategory] = useState<"medication" | "laboratory" | "radiology" | "transfer">("medication");
  const [allergyAlert, setAllergyAlert] = useState<string | null>(null);

  const canCreateOrder = hasPermission("orders:create");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClinicalOrderFormValues>({
    resolver: zodResolver(clinicalOrderSchema),
    defaultValues: {
      orderType: "medication",
      priority: "routine",
      title: "",
      dosage: "1 tablet",
      route: "Oral",
      frequency: "QD",
      clinicalIndication: "",
      notes: "",
    },
  });

  const watchedTitle = watch("title");

  // Allergy safety interceptor: inspect typed drug name against patient's allergies
  React.useEffect(() => {
    if (orderCategory === "medication" && watchedTitle) {
      const q = watchedTitle.toLowerCase().trim();
      const conflict = patient.allergies.find((a) =>
        q.includes(a.substance.toLowerCase()) || a.substance.toLowerCase().includes(q)
      );
      if (conflict) {
        setAllergyAlert(
          `Severe Allergy Conflict: Patient has documented ${conflict.severity} allergy to ${conflict.substance} (${conflict.reaction})`
        );
      } else {
        setAllergyAlert(null);
      }
    } else {
      setAllergyAlert(null);
    }
  }, [watchedTitle, orderCategory, patient.allergies]);

  const handleCategoryChange = (category: "medication" | "laboratory" | "radiology" | "transfer") => {
    setOrderCategory(category);
    setValue("orderType", category);
    setValue("title", "");
    setAllergyAlert(null);
  };

  const onFormSubmit = async (data: ClinicalOrderFormValues) => {
    if (allergyAlert) {
      const confirmed = window.confirm(
        `WARNING: ${allergyAlert}\n\nDo you want to override this safety alert with clinical justification?`
      );
      if (!confirmed) return;
    }

    try {
      await onSubmitOrder({
        patientId: patient.id,
        patientName: patient.fullNameEn,
        patientMrn: patient.mrn,
        orderType: data.orderType,
        priority: data.priority,
        status: "submitted",
        title: data.title,
        details: `${data.dosage ? data.dosage + " " : ""}${data.route ? data.route + " " : ""}${data.frequency ? data.frequency + " " : ""}(${data.clinicalIndication})`,
        departmentId: data.targetDepartmentId || patient.departmentId,
        orderedBy: {
          id: user?.userId || "usr-active",
          name: user?.fullNameEn || "Attending Physician",
          role: user?.role || "physician",
        },
        notes: data.notes,
      });
      reset();
      onClose();
    } catch (e) {
      console.error("Clinical order failed", e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded p-1.5 bg-cyan-700 text-white">
                <Pill className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>
                  {isAr ? "إصدار أمر سريري محوسب (CPOE)" : "Computerized Clinical Order Entry (CPOE)"}
                </DialogTitle>
                <DialogDescription>
                  {patient.fullNameEn} • <strong className="font-mono text-slate-800">{patient.mrn}</strong> • {patient.bed.bedNumber}
                </DialogDescription>
              </div>
            </div>
            <StatusBadge variant="routine" size="sm">
              {patient.bed.departmentCode || "INPATIENT"}
            </StatusBadge>
          </div>

          {/* Prominent Allergy Bar */}
          {patient.allergies.length > 0 && (
            <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-[11px] text-red-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-700 shrink-0" />
              <span>
                <strong>{isAr ? "الحساسية المسجلة للمريض:" : "Documented Patient Allergies:"}</strong>{" "}
                {patient.allergies.map((a) => `${a.substance} (${a.reaction})`).join(", ")}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Order Type Tabs */}
        <div className="px-4 pt-3 border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoryChange("medication")}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              orderCategory === "medication"
                ? "border-cyan-600 text-cyan-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            <span>{isAr ? "أمر دواء" : "Medication"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("laboratory")}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              orderCategory === "laboratory"
                ? "border-cyan-600 text-cyan-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>{isAr ? "تحليل مخبري" : "Laboratory"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("radiology")}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              orderCategory === "radiology"
                ? "border-cyan-600 text-cyan-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Scan className="h-3.5 w-3.5" />
            <span>{isAr ? "طلب أشعة" : "Radiology"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleCategoryChange("transfer")}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              orderCategory === "transfer"
                ? "border-cyan-600 text-cyan-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>{isAr ? "تحويل قسم / سرير" : "Ward Transfer"}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-3.5">
          {/* Priority Selection */}
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-slate-700">{isAr ? "أولوية التنفيذ:" : "Order Priority:"}</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" value="routine" {...register("priority")} defaultChecked />
              <span>Routine</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 font-medium">
              <input type="radio" value="urgent" {...register("priority")} />
              <span>Urgent (&lt; 2h)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-red-600 font-bold">
              <input type="radio" value="stat" {...register("priority")} />
              <span>STAT Immediate (&lt; 15m)</span>
            </label>
          </div>

          {/* Form Fields: Medication */}
          {orderCategory === "medication" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Drug Name & Strength *
                </label>
                <Input
                  {...register("title")}
                  placeholder="e.g. Enoxaparin (Lovenox) 40mg or Metoprolol 25mg"
                  error={!!errors.title}
                />
                {errors.title && <p className="text-[10px] text-red-600 mt-0.5">{errors.title.message}</p>}
              </div>

              {/* Allergy Interceptor Warning */}
              {allergyAlert && (
                <div className="rounded border border-red-300 bg-red-100/90 p-2.5 text-xs text-red-950 flex items-start gap-2 animate-clinical-pulse">
                  <AlertTriangle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{isAr ? "تحذير أمان دوائي حرج!" : "CRITICAL SAFETY ALERT"}</div>
                    <div className="text-[11px]">{allergyAlert}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Dosage</label>
                  <Input {...register("dosage")} placeholder="40 mg / 0.4 mL" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Route</label>
                  <Select {...register("route")}>
                    <option value="Oral">Oral (PO)</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="Inhalation">Inhalation (NEB)</option>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">Frequency</label>
                  <Select {...register("frequency")}>
                    <option value="QD">Once daily (QD)</option>
                    <option value="BID">Twice daily (BID)</option>
                    <option value="TID">Three times daily (TID)</option>
                    <option value="Q4H">Every 4 hours (Q4H)</option>
                    <option value="Stat">STAT once</option>
                    <option value="PRN">As needed (PRN)</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields: Laboratory */}
          {orderCategory === "laboratory" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Laboratory Test or Panel *
                </label>
                <Select {...register("title")}>
                  <option value="">Select test panel...</option>
                  <option value="Complete Blood Count (CBC) with Differential">Complete Blood Count (CBC) with Differential</option>
                  <option value="High-Sensitivity Cardiac Troponin T (Serial)">High-Sensitivity Cardiac Troponin T (Serial)</option>
                  <option value="Comprehensive Metabolic Panel (CMP)">Comprehensive Metabolic Panel (CMP)</option>
                  <option value="Coagulation Profile (PT/INR, aPTT, Fibrinogen)">Coagulation Profile (PT/INR, aPTT)</option>
                  <option value="Arterial Blood Gas (ABG) with Lactate">Arterial Blood Gas (ABG) with Lactate</option>
                  <option value="Blood Cultures x 2 Sets (Aerobic & Anaerobic)">Blood Cultures x 2 Sets</option>
                  <option value="Urinalysis with Microscopic & Culture">Urinalysis with Culture</option>
                </Select>
              </div>
            </div>
          )}

          {/* Form Fields: Radiology */}
          {orderCategory === "radiology" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Imaging Procedure & Modality *
                </label>
                <Select {...register("title")}>
                  <option value="">Select imaging study...</option>
                  <option value="CT Head without Contrast (Rule out Stroke / Bleed)">CT Head without Contrast (Stroke Protocol)</option>
                  <option value="CT Angiography Chest (Rule out Pulmonary Embolism)">CT Angiography Chest (PE Protocol)</option>
                  <option value="Chest X-Ray Portable Bedside AP">Chest X-Ray Portable Bedside AP</option>
                  <option value="MRI Brain 3T with and without Contrast">MRI Brain 3T</option>
                  <option value="Transthoracic Echocardiogram (TTE)">Transthoracic Echocardiogram (TTE)</option>
                  <option value="Ultrasound Abdomen Complete">Ultrasound Abdomen Complete</option>
                  <option value="X-Ray Pelvis & Bilateral Hips">X-Ray Pelvis & Hips</option>
                </Select>
              </div>
            </div>
          )}

          {/* Form Fields: Ward Transfer */}
          {orderCategory === "transfer" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Target Destination Department *
                </label>
                <Select {...register("targetDepartmentId")}>
                  {HOSPITAL_DEPARTMENTS.filter((d) => d.totalBeds > 0 && d.id !== patient.departmentId).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code}: {d.nameEn} ({d.availableBeds} beds available)
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Clinical Indication */}
          <div>
            <label className="text-[11px] font-medium text-slate-700 block mb-1">
              Clinical Indication / Reason for Order *
            </label>
            <Input
              {...register("clinicalIndication")}
              placeholder="e.g. Acute chest pain with ischemic ECG changes"
              error={!!errors.clinicalIndication}
            />
            {errors.clinicalIndication && (
              <p className="text-[10px] text-red-600 mt-0.5">{errors.clinicalIndication.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Authenticated order will be dispatched to Department Console
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !canCreateOrder}
                className="gap-1.5"
              >
                {!canCreateOrder ? <Lock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>{isAr ? "إرسال الأمر السريري" : "Submit Clinical Order"}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
