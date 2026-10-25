"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientAdmissionSchema, PatientAdmissionFormValues } from "../schemas";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { hospitalDataAdapter } from "@/api/adapter";
import { Patient } from "@/types/patient";
import { useI18n } from "@/i18n/i18n-context";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertTriangle } from "lucide-react";

interface PatientRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPatient: (values: PatientAdmissionFormValues) => Promise<void>;
}

export function PatientRegistrationDialog({
  isOpen,
  onClose,
  onSubmitPatient,
}: PatientRegistrationDialogProps) {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";
  const [duplicatePatient, setDuplicatePatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientAdmissionFormValues>({
    resolver: zodResolver(patientAdmissionSchema),
    defaultValues: {
      fullNameEn: "",
      fullNameAr: "",
      nationalId: "",
      dateOfBirth: "1990-01-01",
      gender: "male",
      bloodType: "O+",
      phoneNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "Spouse",
      departmentId: "dep-cardio",
      bedNumber: "BED-310-A",
      roomNumber: "310",
      triageLevel: "3_urgent",
      primaryDiagnosisEn: "",
      primaryDiagnosisAr: "",
      allergiesText: "NKDA",
    },
  });

  const watchedNationalId = watch("nationalId");

  useEffect(() => {
    if (watchedNationalId && watchedNationalId.trim().length >= 8) {
      hospitalDataAdapter
        .getPatients({ page: 1, pageSize: 10 }, { searchQuery: watchedNationalId.trim() })
        .then((res) => {
          const match = res.data.find((p) => p.nationalId.trim() === watchedNationalId.trim());
          setDuplicatePatient(match || null);
        })
        .catch(() => setDuplicatePatient(null));
    } else {
      setDuplicatePatient(null);
    }
  }, [watchedNationalId]);

  const onFormSubmit = async (data: PatientAdmissionFormValues) => {
    try {
      await onSubmitPatient(data);
      reset();
      onClose();
    } catch (e) {
      console.error("Admission submission failed", e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="rounded p-1.5 bg-cyan-700 text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{t.patient.admitPatient}</DialogTitle>
              <DialogDescription>
                Electronic Hospital Inpatient Admission & Master Registry Entry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 overflow-y-auto max-h-[calc(85vh-130px)] space-y-4">
          {/* Section 1: Demographic & Identification */}
          <FormSection title={t.patient.personalInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Full Legal Name (English) *
                </label>
                <Input
                  {...register("fullNameEn")}
                  placeholder="e.g. Tariq Mansoor Al-Harbi"
                  error={!!errors.fullNameEn}
                />
                {errors.fullNameEn && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.fullNameEn.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  الاسم الكامل (بالعربية) *
                </label>
                <Input
                  {...register("fullNameAr")}
                  placeholder="مثال: طارق منصور الحربي"
                  error={!!errors.fullNameAr}
                  dir="rtl"
                />
                {errors.fullNameAr && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.fullNameAr.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  National ID / Iqama (10 digits) *
                </label>
                <Input
                  {...register("nationalId")}
                  placeholder="1098234812"
                  error={!!errors.nationalId}
                />
                {errors.nationalId && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.nationalId.message}</p>
                )}
                {duplicatePatient && (
                  <div className="mt-1.5 rounded border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">
                        {isAr ? "تنبيه الفهرس العام (MPI): مريض مسجل مسبقاً" : "MPI Alert: Potential Duplicate Patient Record"}
                      </div>
                      <div className="text-[10px] text-amber-800">
                        {isAr
                          ? `رقم الهوية مطابق لملف: ${duplicatePatient.fullNameAr} (${duplicatePatient.mrn}) - التنويم الحالي: ${duplicatePatient.status}`
                          : `National ID matches registered patient: ${duplicatePatient.fullNameEn} (${duplicatePatient.mrn}) - Status: ${duplicatePatient.status}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Date of Birth *
                </label>
                <DatePicker
                  {...register("dateOfBirth")}
                  error={!!errors.dateOfBirth}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Gender *
                </label>
                <Select {...register("gender")}>
                  <option value="male">Male (ذكر)</option>
                  <option value="female">Female (أنثى)</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Blood Group *
                </label>
                <Select {...register("bloodType")}>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Contact Phone Number *
                </label>
                <Input
                  {...register("phoneNumber")}
                  placeholder="+966 50 000 0000"
                  error={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Section 2: Clinical Triage & Ward Assignment */}
          <FormSection title={t.patient.clinicalInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Admitting Department *
                </label>
                <Select {...register("departmentId")}>
                  {HOSPITAL_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {locale === "ar" ? dept.nameAr : dept.nameEn} ({dept.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Triage Acuity Priority *
                </label>
                <Select {...register("triageLevel")}>
                  <option value="1_resuscitation">Level 1: Resuscitation (Stat Immediate)</option>
                  <option value="2_emergent">Level 2: Emergent (&lt; 15 min)</option>
                  <option value="3_urgent">Level 3: Urgent (&lt; 30 min)</option>
                  <option value="4_less_urgent">Level 4: Less Urgent (&lt; 60 min)</option>
                  <option value="5_non_urgent">Level 5: Non-Urgent</option>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Assigned Bed *
                </label>
                <Input
                  {...register("bedNumber")}
                  placeholder="e.g. BED-310-A"
                  error={!!errors.bedNumber}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Room Number *
                </label>
                <Input
                  {...register("roomNumber")}
                  placeholder="e.g. 310"
                  error={!!errors.roomNumber}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Primary Admission Diagnosis (English) *
                </label>
                <Input
                  {...register("primaryDiagnosisEn")}
                  placeholder="e.g. Acute Coronary Syndrome"
                  error={!!errors.primaryDiagnosisEn}
                />
                {errors.primaryDiagnosisEn && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.primaryDiagnosisEn.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  تشخيص الدخول السريري (بالعربية) *
                </label>
                <Input
                  {...register("primaryDiagnosisAr")}
                  placeholder="مثال: متلازمة الشريان التاجي الحادة"
                  error={!!errors.primaryDiagnosisAr}
                  dir="rtl"
                />
                {errors.primaryDiagnosisAr && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.primaryDiagnosisAr.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Known Drug & Food Allergies
                </label>
                <Input
                  {...register("allergiesText")}
                  placeholder="e.g. Penicillin, Aspirin (or NKDA)"
                />
              </div>
            </div>
          </FormSection>

          {/* Section 3: Emergency Contact */}
          <FormSection title={t.patient.emergencyContact}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Contact Name *
                </label>
                <Input
                  {...register("emergencyContactName")}
                  placeholder="Contact Name"
                  error={!!errors.emergencyContactName}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Relationship *
                </label>
                <Input
                  {...register("emergencyContactRelation")}
                  placeholder="e.g. Spouse / Parent"
                  error={!!errors.emergencyContactRelation}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">
                  Emergency Phone *
                </label>
                <Input
                  {...register("emergencyContactPhone")}
                  placeholder="+966 50 000 0000"
                  error={!!errors.emergencyContactPhone}
                />
              </div>
            </div>
          </FormSection>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              {t.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {t.patient.admitPatient}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
