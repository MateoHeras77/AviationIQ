import { z } from "zod";

export const createBaggageCaseSchema = z.object({
  flightNumber: z
    .string()
    .min(2, "Flight number is required")
    .max(10, "Flight number is too long"),
  passengerName: z
    .string()
    .min(2, "Passenger name is required")
    .max(100, "Name is too long"),
  passengerPhone: z
    .string()
    .min(7, "Phone number is required")
    .max(20, "Phone number is too long"),
  passengerEmail: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email is too long"),
  pnr: z
    .string()
    .min(5, "PNR/Reference is required")
    .max(10, "PNR is too long")
    .transform((val) => val.toUpperCase()),
  bagTag: z
    .string()
    .min(4, "Bag tag number is required")
    .max(20, "Bag tag is too long"),
  bagDescription: z
    .string()
    .min(3, "Bag description is required")
    .max(300, "Description is too long"),
  bagColor: z
    .string()
    .min(2, "Bag color is required")
    .max(50, "Color description is too long"),
  issueType: z.enum(["lost", "damaged", "delayed", "misrouted"], {
    message: "Please select an issue type",
  }),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type CreateBaggageCaseFormValues = z.infer<
  typeof createBaggageCaseSchema
>;

export const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  status: z.enum([
    "reported",
    "located",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "closed",
  ]),
  note: z.string().max(500, "Note is too long").optional(),
  deliveryAddress: z.string().max(300).optional(),
  deliveryAgent: z.string().max(100).optional(),
});

export type UpdateCaseStatusFormValues = z.infer<
  typeof updateCaseStatusSchema
>;
