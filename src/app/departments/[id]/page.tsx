import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { notFound } from "next/navigation";
import { DepartmentDetailClient } from "./department-detail-client";

export function generateStaticParams() {
  return HOSPITAL_DEPARTMENTS.map((dept) => ({
    id: dept.id,
  }));
}

interface DepartmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartmentDetailPage({ params }: DepartmentPageProps) {
  const { id } = await params;
  const department = HOSPITAL_DEPARTMENTS.find((d) => d.id === id);

  if (!department) {
    notFound();
  }

  return <DepartmentDetailClient department={department} />;
}
