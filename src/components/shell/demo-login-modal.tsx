"use client";

import React from "react";
import { useAuth } from "@/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS, ROLE_PERMISSIONS } from "@/auth/authorization";
import { RoleId } from "@/types/common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Pill,
  FlaskConical,
  UserCheck,
  CreditCard,
  Building2,
  Check,
  Sparkles,
} from "lucide-react";

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoPersona {
  id: string;
  nameEn: string;
  nameAr: string;
  roleId: RoleId;
  departmentId: string;
  badgeNumber: string;
  titleEn: string;
  titleAr: string;
  icon: any;
  color: string;
  badgeBg: string;
  descriptionEn: string;
  descriptionAr: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "usr-sarah",
    nameEn: "Dr. Sarah Chen, MD",
    nameAr: "د. سارة تشن",
    roleId: "physician",
    departmentId: "dep-cardio",
    badgeNumber: "MD-CARD-441",
    titleEn: "Attending Consultant Cardiologist",
    titleAr: "استشاري أمراض القلب والقسطرة",
    icon: Stethoscope,
    color: "text-cyan-600",
    badgeBg: "bg-cyan-50 border-cyan-200 text-cyan-900",
    descriptionEn: "Admit patients, prescribe CPOE orders, review hemodynamics & authorize discharges.",
    descriptionAr: "تنويم المرضى، كتابة الأوامر الطبية (CPOE)، مراجعة العلامات واعتماد قرارات الخروج.",
  },
  {
    id: "usr-director",
    nameEn: "Dr. Mohammed Al-Kurdi, MD",
    nameAr: "د. محمد فهد الكردي",
    roleId: "medical_director",
    departmentId: "dep-cardio",
    badgeNumber: "DIR-MED-001",
    titleEn: "Chief Medical Officer (CMO)",
    titleAr: "المدير الطبي للمستشفى",
    icon: ShieldCheck,
    color: "text-blue-700",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-900",
    descriptionEn: "Supervise all 15 wards, verify physician credentials & coordinate disaster response.",
    descriptionAr: "الإشراف الطبي الشامل على 15 قسماً، اعتماد تراخيص الأطباء، وإدارة خطط الطوارئ.",
  },
  {
    id: "usr-elena",
    nameEn: "Elena Rostova, RN",
    nameAr: "إيلينا روستوفا",
    roleId: "nurse_lead",
    departmentId: "dep-icu",
    badgeNumber: "RN-ICU-8841",
    titleEn: "Senior Charge Nurse (ICU)",
    titleAr: "مشرفة تمريض العناية المركزة",
    icon: HeartPulse,
    color: "text-rose-600",
    badgeBg: "bg-rose-50 border-rose-200 text-rose-900",
    descriptionEn: "Record bedside vitals, escalate clinical alerts, manage bed turnover and eMAR.",
    descriptionAr: "رصد العلامات الحيوية للأسرة، تصعيد التنبيهات السريرية، وتأكيد إعطاء الأدوية.",
  },
  {
    id: "usr-mona",
    nameEn: "Dr. Mona Al-Abdullah, PharmD",
    nameAr: "د. منى العبدالله",
    roleId: "pharmacist",
    departmentId: "dep-pharm",
    badgeNumber: "PHARM-2091",
    titleEn: "Clinical Specialist Pharmacist",
    titleAr: "صيدلي إكلينيكي أول",
    icon: Pill,
    color: "text-purple-600",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-900",
    descriptionEn: "Review inpatient prescriptions, check drug-allergy interactions & dispense medications.",
    descriptionAr: "مراجعة الروشتات، التحقق من تفاعلات الحساسية، وصرف الأدوية للمرضى المنومين.",
  },
  {
    id: "usr-sami",
    nameEn: "Dr. Sami Youssef, PhD",
    nameAr: "د. سامي يوسف",
    roleId: "radiologist",
    departmentId: "dep-lab",
    badgeNumber: "LAB-9042",
    titleEn: "Laboratory Director & Pathologist",
    titleAr: "مسؤول المختبر والباثولوجيا السريرية",
    icon: FlaskConical,
    color: "text-emerald-600",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
    descriptionEn: "Verify blood samples, input diagnostic test values & trigger STAT panic alerts.",
    descriptionAr: "فحص العينات المخبرية، إدخال نتائج التحاليل، وإطلاق تنبيهات القيم الحرجة فوراً.",
  },
  {
    id: "usr-ahmed",
    nameEn: "Ahmed El-Sayed",
    nameAr: "أحمد السعيد",
    roleId: "admissions_clerk",
    departmentId: "dep-er",
    badgeNumber: "ADM-1049",
    titleEn: "Patient Admissions & OPD Officer",
    titleAr: "مسؤول الاستقبال والتنويم والعيادات",
    icon: UserCheck,
    color: "text-amber-600",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-900",
    descriptionEn: "Register incoming patients, assign hospital beds & schedule outpatient clinic appointments.",
    descriptionAr: "استقبال المرضى الجدد، تسكين الأسرة، وحجز مواعيد العيادات الخارجية واستدعاء المرضى.",
  },
  {
    id: "usr-admin",
    nameEn: "Eng. Tariq Al-Ghamdi",
    nameAr: "م. طارق الغامدي",
    roleId: "system_admin",
    departmentId: "dep-admin",
    badgeNumber: "EXEC-001",
    titleEn: "Hospital Operations & IT Administrator",
    titleAr: "مدير العمليات ونظم المستشفى",
    icon: CreditCard,
    color: "text-slate-800",
    badgeBg: "bg-slate-100 border-slate-300 text-slate-900",
    descriptionEn: "Access revenue cycle, view billing KPIs, audit security logs & oversee supply chains.",
    descriptionAr: "إدارة دورة الإيرادات والفوترة، التدقيق الأمني، ومراقبة العمليات التشغيلية وسلاسل الإمداد.",
  },
];

export function DemoLoginModal({ isOpen, onClose }: DemoLoginModalProps) {
  const { user, setActiveRole, setActiveDepartment, login } = useAuth();
  const { locale } = useI18n();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const handleSelectPersona = (persona: DemoPersona) => {
    const dept = HOSPITAL_DEPARTMENTS.find((d) => d.id === persona.departmentId) || HOSPITAL_DEPARTMENTS[0];
    
    // Switch role and department
    setActiveRole(persona.roleId);
    setActiveDepartment(dept);
    
    // Update active user context
    login(persona.roleId);

    toast({
      title: isAr ? "تم تسجيل الدخول بالدور التجريبي" : "Demo Persona Activated",
      description: isAr
        ? `أنت الآن متصل كـ: ${persona.nameAr} (${persona.titleAr}) - قسم ${dept.nameAr}`
        : `Signed in as ${persona.nameEn} (${persona.titleEn}) - ${dept.nameEn}`,
      variant: "success",
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <DialogHeader className="text-start pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? "بوابة تجربة الأدوار السريرية والتشغيلية (Demo Personas)" : "HospitalOS Role-Based Demo Switcher"}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr
                  ? "اختر أي تخصص لاختبار النظام فوراً من منظور كل موظف في المستشفى مع كامل الصلاحيات المخصصة له"
                  : "Select any hospital role to instantly experience the system from that staff member's perspective with tailored permissions."}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 max-h-[65vh] overflow-y-auto dark-scrollbar pe-1">
          {DEMO_PERSONAS.map((p) => {
            const Icon = p.icon;
            const isCurrent = user?.badgeNumber === p.badgeNumber || user?.role === p.roleId;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p)}
                className={`flex flex-col text-start p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                  isCurrent
                    ? "border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 shadow-xs ring-1 ring-cyan-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2.5 end-2.5 flex items-center gap-1 bg-cyan-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    <Check className="h-3 w-3" />
                    <span>{isAr ? "النشط حالياً" : "Current Active"}</span>
                  </span>
                )}

                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700 group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${p.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {isAr ? p.nameAr : p.nameEn}
                      </strong>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${p.badgeBg}`}>
                        {p.badgeNumber}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 block truncate mt-0.5">
                      {isAr ? p.titleAr : p.titleEn}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                  {isAr ? p.descriptionAr : p.descriptionEn}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Building2 className="h-3.5 w-3.5 text-cyan-600" />
            <span>Solve Codex Academic Medical Center • HOS-MED-01</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
