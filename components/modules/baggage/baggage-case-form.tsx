"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBaggageCaseSchema,
  type CreateBaggageCaseFormValues,
} from "@/lib/validations/baggage";
import { actionCreateBaggageCase } from "@/app/(dashboard)/baggage/actions";
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
  Luggage,
  FileText,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FORM_STEPS = [
  { number: 1, label: "Flight & Passenger", icon: Plane },
  { number: 2, label: "Bag Details", icon: Luggage },
  { number: 3, label: "Issue & Notes", icon: FileText },
];

export function BaggageCaseForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateBaggageCaseFormValues>({
    resolver: zodResolver(createBaggageCaseSchema),
    defaultValues: {
      flightNumber: "",
      passengerName: "",
      passengerPhone: "",
      passengerEmail: "",
      pnr: "",
      bagTag: "",
      bagDescription: "",
      bagColor: "",
      issueType: "delayed",
      notes: "",
    },
  });

  async function onSubmit(values: CreateBaggageCaseFormValues) {
    setIsLoading(true);
    try {
      const result = await actionCreateBaggageCase(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Case Created",
        description: "The baggage case has been filed successfully.",
      });

      router.push("/baggage");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create baggage case.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNextStep() {
    if (currentStep === 1) {
      const valid = await form.trigger([
        "flightNumber",
        "passengerName",
        "passengerPhone",
        "passengerEmail",
        "pnr",
      ]);
      if (valid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await form.trigger([
        "bagTag",
        "bagDescription",
        "bagColor",
      ]);
      if (valid) setCurrentStep(3);
    }
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <Card className="border-indigo-200/50 bg-indigo-50/30">
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
                      if (step.number < currentStep)
                        setCurrentStep(step.number);
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
                        isActive &&
                          "bg-indigo-500 border-indigo-500 text-white",
                        isCompleted &&
                          "bg-indigo-600 border-indigo-600 text-white",
                        !isActive &&
                          !isCompleted &&
                          "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden sm:inline",
                        isActive && "text-indigo-700",
                        isCompleted && "text-indigo-600",
                        !isActive &&
                          !isCompleted &&
                          "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>

                  {!isLast && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        isCompleted
                          ? "bg-indigo-400"
                          : "bg-muted-foreground/15"
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
          {/* Step 1: Flight & Passenger */}
          {currentStep === 1 && (
            <Card className="border-indigo-200/30">
              <CardHeader>
                <CardTitle className="text-indigo-700 flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight & Passenger Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="flightNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AC1234"
                            className="uppercase min-h-[44px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pnr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PNR / Booking Reference</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., XKJF7T"
                            className="uppercase min-h-[44px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passengerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passenger Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jean-Pierre Tremblay"
                          className="min-h-[44px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="passengerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1-514-555-0123"
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
                    name="passengerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="passenger@email.ca"
                            className="min-h-[44px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Next: Bag Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Bag Details */}
          {currentStep === 2 && (
            <Card className="border-indigo-200/30">
              <CardHeader>
                <CardTitle className="text-indigo-700 flex items-center gap-2">
                  <Luggage className="h-5 w-5" />
                  Bag Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="bagTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bag Tag Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., AC847291"
                          className="uppercase min-h-[44px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bagColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bag Color</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Black, Navy Blue, Red"
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
                  name="bagDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bag Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brand, size, distinguishing features (stickers, ribbons, etc.)"
                          rows={3}
                          className="min-h-[80px] text-base"
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
                    className="flex-1 min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Next: Issue Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Issue & Notes + Submit */}
          {currentStep === 3 && (
            <Card className="border-indigo-200/30">
              <CardHeader>
                <CardTitle className="text-indigo-700 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Issue Type & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="min-h-[44px]">
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lost">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              Lost -- Bag cannot be found
                            </span>
                          </SelectItem>
                          <SelectItem value="damaged">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-orange-500" />
                              Damaged -- Bag arrived damaged
                            </span>
                          </SelectItem>
                          <SelectItem value="delayed">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-yellow-500" />
                              Delayed -- Bag missed connection
                            </span>
                          </SelectItem>
                          <SelectItem value="misrouted">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500" />
                              Misrouted -- Sent to wrong destination
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details: connecting flights, special contents, passenger urgency..."
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
                    onClick={() => setCurrentStep(2)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Luggage className="mr-2 h-4 w-4" />
                    Submit Case
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
