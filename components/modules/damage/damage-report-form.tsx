"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDamageReportSchema,
  type CreateDamageReportFormValues,
} from "@/lib/validations/damage";
import {
  actionCreateDamageReport,
  actionSubmitDamageReport,
  actionGetFlightsForDamageReport,
} from "@/app/(dashboard)/damage/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Plane,
  AlertTriangle,
  Camera,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FORM_STEPS = [
  { number: 1, label: "Flight Info", icon: Plane },
  { number: 2, label: "Damage Details", icon: AlertTriangle },
  { number: 3, label: "Photos", icon: Camera },
];

export function DamageReportForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [flights, setFlights] = useState<
    Array<{
      id: string;
      flight_number: string;
      aircraft_registration: string | null;
    }>
  >([]);

  const form = useForm<CreateDamageReportFormValues>({
    resolver: zodResolver(createDamageReportSchema),
    defaultValues: {
      flightId: "",
      aircraftRegistration: "",
      damageLocation: "",
      description: "",
      severity: "minor",
    },
  });

  useEffect(() => {
    actionGetFlightsForDamageReport().then((res) => {
      if (res.data) setFlights(res.data);
    });
  }, []);

  // Auto-fill aircraft registration when flight is selected
  const selectedFlightId = form.watch("flightId");
  useEffect(() => {
    if (selectedFlightId) {
      const flight = flights.find((f) => f.id === selectedFlightId);
      if (flight?.aircraft_registration) {
        form.setValue(
          "aircraftRegistration",
          flight.aircraft_registration
        );
      }
    }
  }, [selectedFlightId, flights, form]);

  async function onSubmit(values: CreateDamageReportFormValues) {
    setIsLoading(true);
    try {
      const result = await actionCreateDamageReport(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Auto-submit the report (transition from draft to submitted)
      if (result.data?.id) {
        await actionSubmitDamageReport(result.data.id);
      }

      toast({
        title: "Report Submitted",
        description: "The damage report has been submitted for review.",
      });

      router.push("/damage");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create damage report.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /** Validate step-relevant fields before advancing */
  async function handleNextStep() {
    if (currentStep === 1) {
      // Flight info fields are optional, always advance
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate damage detail fields
      const valid = await form.trigger(["damageLocation", "description", "severity"]);
      if (valid) {
        setCurrentStep(3);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <Card className="border-amber-200/50 bg-amber-50/30">
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between">
            {FORM_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isLast = index === FORM_STEPS.length - 1;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.number < currentStep) setCurrentStep(step.number);
                    }}
                    className={cn(
                      "flex items-center gap-2 transition-all",
                      step.number < currentStep && "cursor-pointer",
                      step.number > currentStep && "cursor-default"
                    )}
                    aria-label={`Step ${step.number}: ${step.label}`}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full border-2 flex-shrink-0 transition-all text-xs font-bold",
                        isActive && "bg-amber-500 border-amber-500 text-white",
                        isCompleted && "bg-amber-600 border-amber-600 text-white",
                        !isActive && !isCompleted && "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden sm:inline",
                        isActive && "text-amber-700",
                        isCompleted && "text-amber-600",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>

                  {!isLast && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        isCompleted ? "bg-amber-400" : "bg-muted-foreground/15"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Flight Info */}
          {currentStep === 1 && (
            <Card className="border-amber-200/30">
              <CardHeader>
                <CardTitle className="text-amber-700 flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="flightId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight (optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-[44px]">
                            <SelectValue placeholder="Select a flight" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flights.map((flight) => (
                            <SelectItem key={flight.id} value={flight.id}>
                              {flight.flight_number}
                              {flight.aircraft_registration
                                ? ` (${flight.aircraft_registration})`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aircraftRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aircraft Registration</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="C-FABC"
                          className="uppercase min-h-[44px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Next: Damage Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Damage Details */}
          {currentStep === 2 && (
            <Card className="border-amber-200/30">
              <CardHeader>
                <CardTitle className="text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Damage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="damageLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Location / Zone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Left wing leading edge, Section 41..."
                          className="min-h-[44px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="min-h-[44px]">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minor">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-slate-400" />
                              Minor
                            </span>
                          </SelectItem>
                          <SelectItem value="moderate">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              Moderate
                            </span>
                          </SelectItem>
                          <SelectItem value="major">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-orange-500" />
                              Major
                            </span>
                          </SelectItem>
                          <SelectItem value="critical">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-600" />
                              Critical
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the damage in detail: what happened, size of damage, any visible markings or paint transfer..."
                          rows={4}
                          className="min-h-[100px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 min-h-[48px] bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Next: Photos
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Photos + Submit */}
          {currentStep === 3 && (
            <Card className="border-amber-200/30">
              <CardHeader>
                <CardTitle className="text-amber-700 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Evidence Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Prominent photo capture area */}
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center bg-amber-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      id="photo-upload"
                      onChange={() => {
                        toast({
                          title: "Photo Captured",
                          description:
                            "Photo upload will be connected to Supabase Storage in the integration phase.",
                        });
                      }}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer block space-y-3"
                    >
                      <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300">
                        <Camera className="h-8 w-8 text-amber-600" />
                      </div>
                      <p className="text-sm font-medium text-amber-700">
                        Tap to take a photo or select from gallery
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Capture close-up and wide-angle shots of the damage
                      </p>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 min-h-[48px] bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Submit Incident Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
