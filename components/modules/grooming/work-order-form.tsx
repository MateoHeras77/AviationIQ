"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
} from "@/lib/validations/grooming";
import {
  actionCreateWorkOrder,
  actionGetFlightsForSelect,
} from "@/app/(dashboard)/grooming/actions";
import { actionGetAircraftTypes } from "@/app/(dashboard)/turnaround/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkOrderFormProps {
  onSuccess?: () => void;
}

export function WorkOrderForm({ onSuccess }: WorkOrderFormProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<
    Array<{
      id: string;
      flight_number: string;
      origin: string | null;
      destination: string | null;
    }>
  >([]);
  const [aircraftTypes, setAircraftTypes] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);

  const form = useForm<CreateWorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      flightId: "",
      aircraftTypeId: "",
      cleaningLevel: "transit_clean",
      standardDurationMin: 15,
      requiredAgents: 2,
      notes: "",
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      actionGetFlightsForSelect().then((res) => {
        if (res.data) setFlights(res.data);
      });
      actionGetAircraftTypes().then((res) => {
        if (res.data) setAircraftTypes(res.data);
      });
    }
  }, [dialogOpen]);

  async function onSubmit(values: CreateWorkOrderFormValues) {
    setIsLoading(true);
    try {
      const result = await actionCreateWorkOrder(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Work Order Created",
          description: "The grooming work order has been created.",
        });
        form.reset();
        setDialogOpen(false);
        onSuccess?.();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create work order.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Create a new grooming work order for a flight
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="flightId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a flight" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {flights.map((flight) => (
                        <SelectItem key={flight.id} value={flight.id}>
                          {flight.flight_number} ({flight.origin ?? "?"} →{" "}
                          {flight.destination ?? "?"})
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
              name="cleaningLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cleaning Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cleaning level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transit_clean">
                        Transit Clean
                      </SelectItem>
                      <SelectItem value="full_clean">Full Clean</SelectItem>
                      <SelectItem value="deep_clean">Deep Clean</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="standardDurationMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredAgents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Agents</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aircraftTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aircraft Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {aircraftTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.code} - {type.name}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Work Order
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
