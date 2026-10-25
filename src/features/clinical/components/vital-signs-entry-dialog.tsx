"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient } from "@/types/patient";
import { VitalSign } from "@/types/clinical";
import { useI18n } from "@/i18n/i18n-context";
import { useAuth } from "@/auth/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HeartPulse, CheckCircle2, AlertTriangle } from "lucide-react";

const vitalSignsSchema = z.object({
  heartRate: z.coerce.number().min(30, "Min 30 bpm").max(250, "Max 250 bpm"),
  systolicBP: z.coerce.number().min(50, "Min 50 mmHg").max(280, "Max 280 mmHg"),
  diastolicBP: z.coerce.number().min(30, "Min 30 mmHg").max(180, "Max 180 mmHg"),
  respiratoryRate: z.coerce.number().min(6, "Min 6").max(60, "Max 60"),
  temperature: z.coerce.number().min(32, "Min 32°C").max(43, "Max 43°C"),
  oxygenSaturation: z.coerce.number().min(50, "Min 50%").max(100, "Max 100%"),
  painScore: z.coerce.number().min(0).max(10),
  consciousnessLevel: z.enum(["Alert", "Verbal", "Pain", "Unresponsive"]),
});

type VitalSignsFormValues = z.infer<typeof vitalSignsSchema>;

interface VitalSignsEntryDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSubmitVitals: (vitals: Omit<VitalSign, "id" | "recordedAt">) => Promise<void>;
}

export function VitalSignsEntryDialog({
  patient,
  isOpen,
  onClose,
  onSubmitVitals,
}: VitalSignsEntryDialogProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const isAr = locale === "ar";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalSignsFormValues>({
    resolver: zodResolver(vitalSignsSchema),
    defaultValues: {
      heartRate: 80,
      systolicBP: 120,
      diastolicBP: 80,
      respiratoryRate: 16,
      temperature: 36.8,
      oxygenSaturation: 98,
      painScore: 0,
      consciousnessLevel: "Alert",
    },
  });

  const hr = watch("heartRate");
  const sbp = watch("systolicBP");
  const spo2 = watch("oxygenSaturation");

  // Calculate quick MEWS Early Warning Score
  let mews = 0;
  if (hr >= 130 || hr <= 40) mews += 3;
  else if (hr >= 111 || hr <= 50) mews += 2;
  else if (hr >= 101) mews += 1;

  if (sbp <= 70) mews += 3;
  else if (sbp <= 80) mews += 2;
  else if (sbp <= 100) mews += 1;
  else if (sbp >= 200) mews += 2;

  if (spo2 < 90) mews += 3;
  else if (spo2 < 94) mews += 1;

  const onFormSubmit = async (data: VitalSignsFormValues) => {
    try {
      await onSubmitVitals({
        heartRate: data.heartRate,
        systolicBP: data.systolicBP,
        diastolicBP: data.diastolicBP,
        respiratoryRate: data.respiratoryRate,
        temperature: data.temperature,
        oxygenSaturation: data.oxygenSaturation,
        painScore: data.painScore,
        consciousnessLevel: data.consciousnessLevel,
        recordedBy: user ? `${user.fullNameEn} (${user.role})` : "Bedside Clinician",
      });
      reset();
      onClose();
    } catch (e) {
      console.error("Vitals recording failed", e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="rounded p-1.5 bg-emerald-600 text-white">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>
                {isAr ? "تسجيل العلامات الحيوية السريرية" : "Bedside Vital Signs Documentation"}
              </DialogTitle>
              <DialogDescription>
                {patient.fullNameEn} • {patient.mrn} • {patient.bed.bedNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-3 text-xs">
          {/* MEWS Score Indicator */}
          <div
            className={`rounded border p-2.5 flex items-center justify-between ${
              mews >= 4
                ? "border-red-300 bg-red-50 text-red-950 font-bold"
                : mews >= 2
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {mews >= 4 && <AlertTriangle className="h-4 w-4 text-red-600" />}
              <span>Early Warning Score (MEWS):</span>
            </div>
            <span className="font-mono text-sm font-black">{mews} / 10</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Heart Rate (bpm) *
              </label>
              <Input type="number" {...register("heartRate")} error={!!errors.heartRate} />
              {errors.heartRate && <p className="text-[10px] text-red-600 mt-0.5">{errors.heartRate.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                SpO2 Saturation (%) *
              </label>
              <Input type="number" {...register("oxygenSaturation")} error={!!errors.oxygenSaturation} />
              {errors.oxygenSaturation && <p className="text-[10px] text-red-600 mt-0.5">{errors.oxygenSaturation.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Systolic BP (mmHg) *
              </label>
              <Input type="number" {...register("systolicBP")} error={!!errors.systolicBP} />
              {errors.systolicBP && <p className="text-[10px] text-red-600 mt-0.5">{errors.systolicBP.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Diastolic BP (mmHg) *
              </label>
              <Input type="number" {...register("diastolicBP")} error={!!errors.diastolicBP} />
              {errors.diastolicBP && <p className="text-[10px] text-red-600 mt-0.5">{errors.diastolicBP.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Respiratory Rate (/min) *
              </label>
              <Input type="number" {...register("respiratoryRate")} error={!!errors.respiratoryRate} />
              {errors.respiratoryRate && <p className="text-[10px] text-red-600 mt-0.5">{errors.respiratoryRate.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Body Temperature (°C) *
              </label>
              <Input type="number" step="0.1" {...register("temperature")} error={!!errors.temperature} />
              {errors.temperature && <p className="text-[10px] text-red-600 mt-0.5">{errors.temperature.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Pain Score (0 - 10)
              </label>
              <Input type="number" min="0" max="10" {...register("painScore")} />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-700 block mb-1">
                Consciousness (AVPU)
              </label>
              <Select {...register("consciousnessLevel")}>
                <option value="Alert">Alert (A)</option>
                <option value="Verbal">Verbal (V)</option>
                <option value="Pain">Pain response (P)</option>
                <option value="Unresponsive">Unresponsive (U)</option>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isAr ? "حفظ القياسات" : "Record Vitals"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
