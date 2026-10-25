import { z } from "zod";

export const doctorRegistrationSchema = z.object({
  legalNameEn: z
    .string()
    .min(3, "English name must be at least 3 characters")
    .max(100, "English name is too long"),
  legalNameAr: z
    .string()
    .min(3, "Arabic name must be at least 3 characters")
    .max(100, "Arabic name is too long"),
  title: z.enum(["Dr.", "Prof. Dr.", "Consultant", "Specialist"], {
    message: "Professional title is required",
  }),
  licenseNumber: z
    .string()
    .min(5, "Professional medical license identifier must be at least 5 characters")
    .regex(/^[A-Za-z0-9-]+$/, "License number must be alphanumeric"),
  licenseAuthority: z
    .string()
    .min(3, "Issuing medical board authority is required"),
  licenseExpiryDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Valid expiration date is required")
    .refine((date) => new Date(date) > new Date(), "License expiration date must be in the future"),
  primarySpecialty: z
    .string()
    .min(2, "Primary specialty is required"),
  subspecialty: z.string().optional(),
  primaryDepartmentId: z
    .string()
    .min(1, "Primary department assignment is required"),
  authorizedSecondaryDepartmentIds: z.array(z.string()).default([]),
  employmentStatus: z.enum(
    ["full_time", "part_time", "locum", "visiting_consultant", "resident"],
    { message: "Employment status is required" }
  ),
  professionalEmail: z
    .string()
    .email("Valid hospital email is required"),
  officePhone: z
    .string()
    .min(7, "Office contact phone number is required"),
  roomNumber: z.string().optional(),
  languages: z.string().min(2, "At least one language must be specified"),
  bioEn: z.string().optional(),
  bioAr: z.string().optional(),
  initialStatus: z.enum(["draft", "pending_verification"]).default("pending_verification"),
});

export type DoctorRegistrationFormValues = z.infer<typeof doctorRegistrationSchema>;
