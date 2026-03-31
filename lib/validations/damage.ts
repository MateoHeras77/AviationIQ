import { z } from "zod";

export const createDamageReportSchema = z.object({
  flightId: z.string().optional(),
  aircraftRegistration: z.string().max(10).optional(),
  damageLocation: z
    .string()
    .min(2, "Damage location is required")
    .max(200, "Location description is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  severity: z.enum(["minor", "moderate", "major", "critical"], {
    message: "Please select a severity level",
  }),
});

export type CreateDamageReportFormValues = z.infer<
  typeof createDamageReportSchema
>;

export const approveDamageReportSchema = z.object({
  reportId: z.string().uuid("Invalid report ID"),
  comments: z.string().optional(),
});

export type ApproveDamageReportFormValues = z.infer<
  typeof approveDamageReportSchema
>;

export const rejectDamageReportSchema = z.object({
  reportId: z.string().uuid("Invalid report ID"),
  reason: z
    .string()
    .min(5, "Please provide a reason for rejection")
    .max(500, "Reason is too long"),
});

export type RejectDamageReportFormValues = z.infer<
  typeof rejectDamageReportSchema
>;
