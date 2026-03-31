import { z } from "zod";

export const createFlightSchema = z.object({
  flightNumber: z
    .string()
    .min(2, "Flight number is required")
    .max(10, "Flight number must be 10 characters or less"),
  airlineClientId: z.string().min(1, "Please select an airline"),
  aircraftTypeId: z.string().optional(),
  aircraftRegistration: z.string().max(10).optional(),
  origin: z
    .string()
    .min(3, "Origin airport code is required")
    .max(4, "Airport code must be 3-4 characters"),
  destination: z
    .string()
    .min(3, "Destination airport code is required")
    .max(4, "Airport code must be 3-4 characters"),
  scheduledArrival: z.string().min(1, "Scheduled arrival is required"),
  scheduledDeparture: z.string().min(1, "Scheduled departure is required"),
  gate: z.string().max(10).optional(),
  notes: z.string().optional(),
});

export type CreateFlightFormValues = z.infer<typeof createFlightSchema>;

export const logTurnaroundEventSchema = z.object({
  flightId: z.string().uuid("Invalid flight ID"),
  eventType: z.enum([
    "aircraft_arrival",
    "door_open",
    "deplaning_start",
    "deplaning_end",
    "cleaning_start",
    "cleaning_end",
    "catering_confirmed",
    "fueling_confirmed",
    "boarding_start",
    "boarding_end",
    "door_close",
    "pushback",
  ]),
  notes: z.string().optional(),
});

export type LogTurnaroundEventFormValues = z.infer<
  typeof logTurnaroundEventSchema
>;

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().uuid("Invalid alert ID"),
});

export type AcknowledgeAlertFormValues = z.infer<
  typeof acknowledgeAlertSchema
>;
