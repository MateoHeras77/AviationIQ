import { z } from "zod";

export const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  logoUrl: z.string().optional(),
  stations: z.array(z.string().min(2, "Station code must be at least 2 characters")),
  airlineClients: z.array(z.string().min(2, "Airline client name is required")),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

export const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "station_manager", "supervisor", "agent", "airline_client"], {
    message: "Please select a valid role",
  }),
  stationId: z.string().min(1, "Please select a station"),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export const aircraftTypeSchema = z.object({
  code: z.string().min(2, "Aircraft code must be at least 2 characters").max(10),
  name: z.string().min(2, "Aircraft name must be at least 2 characters"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  transitCleanMinutes: z.number().min(1, "Must be at least 1 minute"),
  fullCleanMinutes: z.number().min(1, "Must be at least 1 minute"),
  deepCleanMinutes: z.number().min(1, "Must be at least 1 minute"),
  defaultTurnaroundMinutes: z.number().min(1, "Must be at least 1 minute"),
});

export type AircraftTypeFormValues = z.infer<typeof aircraftTypeSchema>;

export const slaConfigSchema = z.object({
  airlineClientId: z.string().min(1, "Please select an airline client"),
  events: z.array(
    z.object({
      eventType: z.string(),
      maxDurationMinutes: z.number().min(0, "Duration must be non-negative"),
    })
  ),
});

export type SLAConfigFormValues = z.infer<typeof slaConfigSchema>;

export const notificationSettingsSchema = z.object({
  settings: z.array(
    z.object({
      eventType: z.string(),
      inAppEnabled: z.boolean(),
      emailEnabled: z.boolean(),
      thresholdMinutes: z.number().min(0),
      recipientRole: z.enum(["admin", "station_manager", "supervisor", "agent", "airline_client"]),
    })
  ),
});

export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
