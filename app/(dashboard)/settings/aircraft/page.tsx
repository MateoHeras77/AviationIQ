"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  aircraftTypeSchema,
  type AircraftTypeFormValues,
} from "@/lib/validations/settings";
import type { AircraftType } from "../settings.types";
import {
  actionCreateAircraftType,
  actionUpdateAircraftType,
  actionDeleteAircraftType,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/modules/shared/page-header";
import { EmptyState } from "@/components/modules/shared/empty-state";
import { Loader2, MoreHorizontal, Plane, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AircraftRegistryPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<AircraftType | null>(
    null
  );
  const [aircraftTypes] = useState<AircraftType[]>([]);

  const form = useForm<AircraftTypeFormValues>({
    resolver: zodResolver(aircraftTypeSchema),
    defaultValues: {
      code: "",
      name: "",
      manufacturer: "",
      transitCleanMinutes: 15,
      fullCleanMinutes: 30,
      deepCleanMinutes: 60,
      defaultTurnaroundMinutes: 45,
    },
  });

  function openCreateDialog() {
    setEditingAircraft(null);
    form.reset({
      code: "",
      name: "",
      manufacturer: "",
      transitCleanMinutes: 15,
      fullCleanMinutes: 30,
      deepCleanMinutes: 60,
      defaultTurnaroundMinutes: 45,
    });
    setDialogOpen(true);
  }

  function openEditDialog(aircraft: AircraftType) {
    setEditingAircraft(aircraft);
    form.reset({
      code: aircraft.code,
      name: aircraft.name,
      manufacturer: aircraft.manufacturer,
      transitCleanMinutes: aircraft.transit_clean_minutes,
      fullCleanMinutes: aircraft.full_clean_minutes,
      deepCleanMinutes: aircraft.deep_clean_minutes,
      defaultTurnaroundMinutes: aircraft.default_turnaround_minutes,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: AircraftTypeFormValues) {
    setIsLoading(true);
    try {
      const result = editingAircraft
        ? await actionUpdateAircraftType(editingAircraft.id, values)
        : await actionCreateAircraftType(values);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: editingAircraft
            ? "Aircraft type updated."
            : "Aircraft type created.",
        });
        setDialogOpen(false);
        form.reset();
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const result = await actionDeleteAircraftType(id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Deleted",
          description: "Aircraft type removed.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete aircraft type.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aircraft Registry"
        description="Manage aircraft types and their operational parameters"
        action={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Aircraft Type
          </Button>
        }
      />

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAircraft ? "Edit Aircraft Type" : "Add Aircraft Type"}
            </DialogTitle>
            <DialogDescription>
              {editingAircraft
                ? "Update the aircraft type details."
                : "Enter the details for the new aircraft type."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CRJ-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Canadair Regional Jet 200"
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
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bombardier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="transitCleanMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transit Clean (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullCleanMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Clean (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deepCleanMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deep Clean (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultTurnaroundMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turnaround (min)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
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
                  {editingAircraft ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {aircraftTypes.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No aircraft types"
          description="Add your first aircraft type to define operational parameters."
          action={
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Aircraft Type
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead className="text-right">Transit (min)</TableHead>
                <TableHead className="text-right">Full (min)</TableHead>
                <TableHead className="text-right">Deep (min)</TableHead>
                <TableHead className="text-right">Turnaround (min)</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {aircraftTypes.map((aircraft) => (
                <TableRow key={aircraft.id}>
                  <TableCell className="font-medium">{aircraft.code}</TableCell>
                  <TableCell>{aircraft.name}</TableCell>
                  <TableCell>{aircraft.manufacturer}</TableCell>
                  <TableCell className="text-right">
                    {aircraft.transit_clean_minutes}
                  </TableCell>
                  <TableCell className="text-right">
                    {aircraft.full_clean_minutes}
                  </TableCell>
                  <TableCell className="text-right">
                    {aircraft.deep_clean_minutes}
                  </TableCell>
                  <TableCell className="text-right">
                    {aircraft.default_turnaround_minutes}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(aircraft)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(aircraft.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
