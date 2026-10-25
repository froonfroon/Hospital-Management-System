import React, { Suspense } from "react";
import { DoctorWorkspaceClient } from "./doctor-workspace-client";
import { MOCK_DOCTORS } from "@/api/fixtures";

export function generateStaticParams() {
  return MOCK_DOCTORS.map((d) => ({
    doctorId: d.id,
  }));
}

interface DoctorPageProps {
  params: Promise<{ doctorId: string }>;
}

export default async function DoctorDetailPage({ params }: DoctorPageProps) {
  const { doctorId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      }
    >
      <DoctorWorkspaceClient doctorId={doctorId} />
    </Suspense>
  );
}
