"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS, ROLE_PERMISSIONS, DEFAULT_USER } from "@/auth/authorization";
import { RoleId } from "@/types/common";
import { useToast } from "@/components/ui/toast";
import {
  Activity,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { locale, toggleLocale, direction } = useI18n();
  const { toast } = useToast();

  const isAr = locale === "ar";
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  // Form State: Username and Password ONLY
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedUser = username.trim().toLowerCase();

    if (!trimmedUser) {
      setErrorMessage(
        isAr ? "يرجى كتابة اسم المستخدم أولاً" : "Please enter your username"
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        isAr ? "يرجى كتابة كلمة المرور" : "Please enter your password"
      );
      return;
    }

    setIsLoading(true);

    // Realistic clinical authentication delay
    setTimeout(() => {
      // Role & persona mapping based on username
      let role: RoleId = "physician";
      let fullNameEn = "Dr. Sarah Chen, MD";
      let fullNameAr = "د. سارة تشن";
      let badgeNumber = "MD-77041";
      let dept = HOSPITAL_DEPARTMENTS[2]; // Cardiology

      if (trimmedUser.includes("admin") || trimmedUser.includes("it") || trimmedUser.includes("طارق")) {
        role = "system_admin";
        fullNameEn = "Eng. Tariq Al-Ghamdi";
        fullNameAr = "م. طارق الغامدي";
        badgeNumber = "EXEC-001";
        dept = HOSPITAL_DEPARTMENTS[0];
      } else if (trimmedUser.includes("director") || trimmedUser.includes("cmo") || trimmedUser.includes("محمد")) {
        role = "medical_director";
        fullNameEn = "Dr. Mohammed Al-Kurdi, MD";
        fullNameAr = "د. محمد الكردي";
        badgeNumber = "DIR-001";
        dept = HOSPITAL_DEPARTMENTS[1]; // ICU
      } else if (trimmedUser.includes("nurse") || trimmedUser.includes("تمريض") || trimmedUser.includes("elena")) {
        role = "nurse_lead";
        fullNameEn = "Elena Rostova, RN";
        fullNameAr = "إيلينا روستوفا";
        badgeNumber = "RN-8841";
        dept = HOSPITAL_DEPARTMENTS[1]; // ICU
      } else if (trimmedUser.includes("pharm") || trimmedUser.includes("صيدل") || trimmedUser.includes("mona")) {
        role = "pharmacist";
        fullNameEn = "Dr. Mona Al-Abdullah, PharmD";
        fullNameAr = "د. منى العبدالله";
        badgeNumber = "PHARM-2091";
        dept = HOSPITAL_DEPARTMENTS.find((d) => d.id === "dep-pharm") || HOSPITAL_DEPARTMENTS[0];
      } else if (trimmedUser.includes("lab") || trimmedUser.includes("مختبر") || trimmedUser.includes("sami")) {
        role = "radiologist";
        fullNameEn = "Dr. Sami Youssef, PhD";
        fullNameAr = "د. سامي يوسف";
        badgeNumber = "LAB-9042";
        dept = HOSPITAL_DEPARTMENTS.find((d) => d.id === "dep-lab") || HOSPITAL_DEPARTMENTS[0];
      } else if (trimmedUser.includes("reception") || trimmedUser.includes("استقبال") || trimmedUser.includes("ahmed")) {
        role = "admissions_clerk";
        fullNameEn = "Ahmed El-Sayed";
        fullNameAr = "أحمد السعيد";
        badgeNumber = "ADM-1049";
        dept = HOSPITAL_DEPARTMENTS[0]; // ER
      } else {
        // Any other username
        fullNameEn = username;
        fullNameAr = username;
        badgeNumber = "EMP-9920";
      }

      login(role, {
        userId: `usr-${trimmedUser}`,
        badgeNumber,
        fullNameEn,
        fullNameAr,
        email: `${trimmedUser}@hospitalos.internal`,
        role,
        assignedDepartment: dept,
        permissions: ROLE_PERMISSIONS[role] || [],
        sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
      });

      toast({
        title: isAr ? "تم تسجيل الدخول بنجاح" : "Login Successful",
        description: isAr
          ? `أهلاً بك، ${fullNameAr} في نظام HospitalOS`
          : `Welcome back, ${fullNameEn} to HospitalOS`,
        variant: "success",
      });

      router.push("/");
    }, 600);
  };

  const setQuickUser = (user: string) => {
    setUsername(user);
    setPassword("••••••••");
    setErrorMessage("");
  };

  return (
    <div
      className="min-h-screen w-full bg-[#030a16] text-slate-100 flex flex-col justify-between relative overflow-x-hidden font-sans select-none"
      dir={direction}
    >
      {/* ── BACKGROUND AMBIENT MEDICAL GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/12 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-teal-500/8 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── TOP HEADER WITH LANGUAGE TOGGLE & SYSTEM STATUS ── */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-cyan-900/20 bg-[#040f1f]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300/30">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-wide text-white">
                Hospital<span className="text-cyan-400">OS</span>
              </span>
              <span className="text-[10px] uppercase font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.2 rounded-full">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Solve Codex Academic Health System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-emerald-400 font-bold">SYSTEM ACTIVE</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">SHA-256</span>
          </div>

          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            <span>{isAr ? "English" : "العربية"}</span>
            <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/80 px-1 rounded border border-cyan-800/60">
              {locale}
            </span>
          </button>
        </div>
      </header>

      {/* ── MAIN CENTER LOGIN CARD ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Outer Glass Card */}
          <div className="relative rounded-3xl bg-slate-900/85 border border-cyan-800/35 p-6 sm:p-9 shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl ring-1 ring-cyan-500/10">
            
            {/* Header / Brand in Card */}
            <div className="text-center mb-8">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 items-center justify-center text-white shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-300/30 mb-3">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight">
                {isAr ? "تسجيل الدخول للنظام" : "Hospital Sign In"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? "أدخل اسم المستخدم وكلمة المرور للوصول إلى محطة العمل"
                  : "Enter your username and password to access the portal"}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form: Username & Password ONLY */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Field 1: Username */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? "اسم المستخدم / الكود الوظيفي" : "Username / Staff ID"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isAr ? "مثال: admin أو doctor" : "e.g. admin or doctor"}
                    disabled={isLoading}
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl py-3 ps-10 pe-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-sans shadow-inner disabled:opacity-50"
                  />
                </div>

                {/* Quick Autofill Buttons for Testing */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {isAr ? "تجربة سريعة:" : "Quick test:"}
                  </span>
                  {[
                    { label: isAr ? "مدير النظام" : "admin", val: "admin" },
                    { label: isAr ? "طبيب" : "doctor", val: "doctor" },
                    { label: isAr ? "تمريض" : "nurse", val: "nurse" },
                    { label: isAr ? "صيدلي" : "pharmacy", val: "pharmacy" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setQuickUser(item.val)}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700/80 font-mono text-[10px] cursor-pointer transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {isAr ? "كلمة المرور" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: isAr ? "المساعدة في كلمة المرور" : "Password Hint",
                        description: isAr
                          ? "يمكنك كتابة أي كلمة مرور للتجربة أو النقر على الأزرار السريعة بالأعلى."
                          : "You can enter any password for demo testing.",
                        variant: "info",
                      });
                    }}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    {isAr ? "نسيت كلمة المرور؟" : "Forgot?"}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl py-3 ps-10 pe-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-sans shadow-inner disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400 h-4 w-4 cursor-pointer"
                  />
                  <span>
                    {isAr ? "تذكر بيانات تسجيل الدخول" : "Remember my workstation"}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer ring-1 ring-cyan-300/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isAr ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Assurance Tag */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                {isAr
                  ? "اتصال آمن ومشفر وفق معايير CBAHI و HIPAA الصحية"
                  : "Encrypted & HIPAA / CBAHI Medical Compliant"}
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full px-6 py-3.5 border-t border-cyan-900/20 bg-[#040f1f]/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div>
          HospitalOS by Solve Codex Academic Health System © 2026. All Rights Reserved.
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
          <span>HL7/FHIR v4.0.1</span>
          <span>•</span>
          <span className="text-cyan-400">TERMINAL-CLIN-01</span>
        </div>
      </footer>
    </div>
  );
}
