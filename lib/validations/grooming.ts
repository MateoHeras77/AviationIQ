import { z } from "zod";

export const createWorkOrderSchema = z.object({
  flightId: z.string().min(1, "Please select a flight"),
  aircraftTypeId: z.string().optional(),
  cleaningLevel: z.enum(["transit_clean", "full_clean", "deep_clean"], {
    message: "Please select a cleaning level",
  }),
  standardDurationMin: z
    .number()
    .min(1, "Duration must be at least 1 minute"),
  requiredAgents: z
    .number()
    .min(1, "At least 1 agent is required"),
  notes: z.string().optional(),
});

export type CreateWorkOrderFormValues = z.infer<typeof createWorkOrderSchema>;

export const assignAgentSchema = z.object({
  workOrderId: z.string().uuid("Invalid work order ID"),
  agentId: z.string().uuid("Please select an agent"),
});

export type AssignAgentFormValues = z.infer<typeof assignAgentSchema>;

export const updateWorkOrderStatusSchema = z.object({
  workOrderId: z.string().uuid("Invalid work order ID"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"], {
    message: "Please select a valid status",
  }),
});

export type UpdateWorkOrderStatusFormValues = z.infer<
  typeof updateWorkOrderStatusSchema
>;
