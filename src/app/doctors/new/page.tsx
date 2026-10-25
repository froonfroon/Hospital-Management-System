"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { hospitalDataAdapter } from "@/api/adapter";
import {
  doctorRegistrationSchema,
  DoctorRegistrationFormValues,
} from "@/features/staff/components/doctor-registration-schema";
import {
  UserPlus,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  Building2,
  Stethoscope,
  Info,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorRegistrationPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [isSubmitting, startTransition] = useTransition();
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DoctorRegistrationFormValues>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      title: "Consultant",
      employmentStatus: "full_time",
      initialStatus: "pending_verification",
      authorizedSecondaryDepartmentIds: [],
      languages: "Arabic, English",
    },
  });

  const selectedPrimaryDept = watch("primaryDepartmentId");
  const selectedSecondaryDepts = watch("authorizedSecondaryDepartmentIds") || [];

  const handleToggleSecondaryDept = (deptId: string) => {
    if (deptId === selectedPrimaryDept) return;
    if (selectedSecondaryDepts.includes(deptId)) {
      setValue(
        "authorizedSecondaryDepartmentIds",
        selectedSecondaryDepts.filter((id) => id !== deptId)
      );
    } else {
      setValue("authorizedSecondaryDepartmentIds", [...selectedSecondaryDepts, deptId]);
    }
  };

  const onSubmit = (data: DoctorRegistrationFormValues) => {
    startTransition(async () => {
      try {
        const primaryDeptObj = HOSPITAL_DEPARTMENTS.find((d) => d.id === data.primaryDepartmentId);
        const res = await hospitalDataAdapter.createDoctor({
          legalNameEn: data.legalNameEn,
          legalNameAr: data.legalNameAr,
          title: data.title,
          licenseNumber: data.licenseNumber,
          licenseAuthority: data.licenseAuthority,
          licenseExpiryDate: data.licenseExpiryDate,
          primarySpecialty: data.primarySpecialty,
          subspecialty: data.subspecialty,
          primaryDepartmentId: data.primaryDepartmentId,
          primaryDepartmentNameEn: primaryDeptObj ? primaryDeptObj.nameEn : "General Medicine",
          primaryDepartmentNameAr: primaryDeptObj ? primaryDeptObj.nameAr : "الطب العام",
          authorizedSecondaryDepartmentIds: data.authorizedSecondaryDepartmentIds,
          employmentStatus: data.employmentStatus,
          verificationStatus: data.initialStatus,
          professionalEmail: data.professionalEmail,
          officePhone: data.officePhone,
          roomNumber: data.roomNumber,
          onCallStatus: "off_duty",
          credentials: [
            {
              id: `crd-${Date.now()}`,
              title: `${data.licenseAuthority} License Documentation`,
              documentType: "medical_license",
              issuingAuthority: data.licenseAuthority,
              documentNumber: data.licenseNumber,
              issueDate: new Date().toISOString().split("T")[0],
              expiryDate: data.licenseExpiryDate,
              fileUrl: `/credentials/pending-${data.licenseNumber}.pdf`,
              status: "pending_review",
            },
          ],
          languages: data.languages.split(",").map((s) => s.trim()),
          bioEn: data.bioEn,
          bioAr: data.bioAr,
        });

        setSubmissionSuccess(res.data.id);
        setTimeout(() => {
          router.push(`/doctors/${res.data.id}`);
        }, 1500);
      } catch (err) {
        console.error("Failed to register doctor", err);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-cyan-600" />
              <span>{isAr ? "تسجيل طبيب جديد والاعتماد المهني" : "Doctor Registration & Credentialing"}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? "تسجيل بيانات الكادر الطبي، تدقيق التراخيص المهنية، وتحديد الصلاحيات السريرية للأقسام"
                : "Register clinical practitioner, attach medical licenses, and define authorized departmental privileges"}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span>{isAr ? "تنبيه الأمان والامتثال السريري" : "Clinical Governance & Compliance Notice"}</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          {isAr
            ? "تسجيل الطبيب لا يمنحه تلقائياً صفة الاعتماد أو مباشرة الحالات الحساسة. يتم تسجيل الملف في حالة 'قيد التدقيق' حتى اعتماده رسمياً من قبل الإدارة الطبية ولجنة التدقيق المهني."
            : "Submission does not automatically grant verified credential status or unrestricted clinical privileges. All registrations enter 'Pending Verification' until explicitly audited by the Medical Director."}
        </p>
      </div>

      {submissionSuccess ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isAr ? "تم تسجيل بيانات الطبيب بنجاح" : "Doctor Registered Successfully"}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isAr
              ? "تم إرسال الملف إلى لجنة التدقيق للاعتماد. جاري التحويل إلى مساحة عمل الطبيب..."
              : "Credentials logged in Pending Audit state. Redirecting to Doctor Workspace..."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Identity & Legal Names */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-cyan-600" />
              <span>{isAr ? "1. الهوية والاسم الرسمي" : "1. Legal Identity & Professional Title"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "اللقب المهني" : "Professional Title"} *
                </label>
                <select
                  {...register("title")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Consultant">Consultant / استشاري</option>
                  <option value="Specialist">Specialist / أخصائي</option>
                  <option value="Dr.">Dr. / طبيب</option>
                  <option value="Prof. Dr.">Prof. Dr. / أستاذ دكتور</option>
                </select>
                {errors.title && <p className="mt-1 text-[10px] text-rose-500">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "الاسم القانوني (باللغة الإنجليزية)" : "Legal Name (English)"} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Chen, MD"
                  {...register("legalNameEn")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.legalNameEn && <p className="mt-1 text-[10px] text-rose-500">{errors.legalNameEn.message}</p>}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "الاسم القانوني (باللغة العربية)" : "Legal Name (Arabic)"} *
                </label>
                <input
                  type="text"
                  placeholder="مثال: د. سارة تشن"
                  {...register("legalNameAr")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.legalNameAr && <p className="mt-1 text-[10px] text-rose-500">{errors.legalNameAr.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Medical Licensing & Credentials */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>{isAr ? "2. الترخيص المهني والاعتماد" : "2. Medical License & Verification Authority"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "رقم الترخيص الطبي" : "Medical License Number"} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SCFHS-MD-89210"
                  {...register("licenseNumber")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.licenseNumber.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "الجهة المصدرة للترخيص" : "Issuing Medical Board / Authority"} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saudi Commission for Health Specialties (SCFHS)"
                  {...register("licenseAuthority")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.licenseAuthority && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.licenseAuthority.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "تاريخ انتهاء الترخيص" : "License Expiry Date"} *
                </label>
                <input
                  type="date"
                  {...register("licenseExpiryDate")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.licenseExpiryDate && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.licenseExpiryDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "التخصص الرئيسي" : "Primary Specialty"} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardiovascular Diseases"
                  {...register("primarySpecialty")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.primarySpecialty && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.primarySpecialty.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "التخصص الدقيق (اختياري)" : "Subspecialty (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Interventional Cardiology & Structural Heart"
                  {...register("subspecialty")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Department Assignments & Multi-department Privileges */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>{isAr ? "3. تعيين الأقسام والصلاحيات السريرية" : "3. Department Assignment & Cross-Cover Privileges"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "القسم الأساسي المسؤول" : "Primary Department"} *
                </label>
                <select
                  {...register("primaryDepartmentId")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">{isAr ? "-- اختر القسم الرئيسي --" : "-- Select Primary Department --"}</option>
                  {HOSPITAL_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isAr ? d.nameAr : d.nameEn} ({d.code})
                    </option>
                  ))}
                </select>
                {errors.primaryDepartmentId && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.primaryDepartmentId.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "طبيعة التوظيف" : "Employment Status"} *
                </label>
                <select
                  {...register("employmentStatus")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="full_time">Full Time / دوام كامل</option>
                  <option value="part_time">Part Time / دوام جزئي</option>
                  <option value="visiting_consultant">Visiting Consultant / استشاري زائر</option>
                  <option value="locum">Locum / متعاقد مؤقت</option>
                  <option value="resident">Resident / طبيب مقيم</option>
                </select>
              </div>
            </div>

            {/* Secondary authorized departments */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? "الأقسام الثانوية المصرح بالعمل بها (تغطية سريرية)" : "Authorized Secondary Departments (Cross-Cover)"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-lg">
                {HOSPITAL_DEPARTMENTS.map((dept) => {
                  const isPrimary = dept.id === selectedPrimaryDept;
                  const isChecked = selectedSecondaryDepts.includes(dept.id);

                  return (
                    <label
                      key={dept.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md p-1.5 text-xs border transition-colors cursor-pointer",
                        isPrimary
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
                          : isChecked
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                          : "border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={isPrimary}
                        checked={isChecked}
                        onChange={() => handleToggleSecondaryDept(dept.id)}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5"
                      />
                      <span className="truncate">{isAr ? dept.nameAr : dept.nameEn}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Bio */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-600" />
              <span>{isAr ? "4. بيانات التواصل والملف التعريفي" : "4. Professional Contact Details & Bio"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "البريد الإلكتروني المهني" : "Professional Email"} *
                </label>
                <input
                  type="email"
                  placeholder="doctor@hospitalos.demo"
                  {...register("professionalEmail")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.professionalEmail && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.professionalEmail.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "هاتف المكتب / العيادة" : "Office Phone"} *
                </label>
                <input
                  type="text"
                  placeholder="+966 11 400 0000"
                  {...register("officePhone")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                {errors.officePhone && (
                  <p className="mt-1 text-[10px] text-rose-500">{errors.officePhone.message}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "رقم العيادة / المكتب" : "Room / Office Number"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. C-204"
                  {...register("roomNumber")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? "اللغات المتقنة" : "Languages Spoken"} *
              </label>
              <input
                type="text"
                placeholder="Arabic, English, French"
                {...register("languages")}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "نبذة مهنية (بالإنجليزية)" : "Professional Bio (English)"}
                </label>
                <textarea
                  rows={3}
                  placeholder="Senior Consultant with expertise in..."
                  {...register("bioEn")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? "نبذة مهنية (بالعربية)" : "Professional Bio (Arabic)"}
                </label>
                <textarea
                  rows={3}
                  placeholder="استشاري متمرس في..."
                  {...register("bioAr")}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            <Link
              href="/doctors"
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isAr ? "إلغاء والعودة" : "Cancel"}
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isAr ? "جاري الحفظ والتدقيق..." : "Submitting Credential..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isAr ? "تسجيل الطبيب وإرسال للاعتماد" : "Submit for Verification"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
