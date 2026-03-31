"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  organizationSchema,
  type OrganizationFormValues,
} from "@/lib/validations/settings";
import { actionUpdateOrganization } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      companyName: "",
      logoUrl: "",
      stations: [],
      airlineClients: [],
    },
  });

  const [stations, setStations] = useState<string[]>([]);
  const [newStation, setNewStation] = useState("");
  const [airlineClients, setAirlineClients] = useState<string[]>([]);
  const [newClient, setNewClient] = useState("");

  function addStation() {
    if (newStation.trim() && !stations.includes(newStation.trim().toUpperCase())) {
      const updated = [...stations, newStation.trim().toUpperCase()];
      setStations(updated);
      form.setValue("stations", updated);
      setNewStation("");
    }
  }

  function removeStation(index: number) {
    const updated = stations.filter((_, i) => i !== index);
    setStations(updated);
    form.setValue("stations", updated);
  }

  function addClient() {
    if (newClient.trim() && !airlineClients.includes(newClient.trim())) {
      const updated = [...airlineClients, newClient.trim()];
      setAirlineClients(updated);
      form.setValue("airlineClients", updated);
      setNewClient("");
    }
  }

  function removeClient(index: number) {
    const updated = airlineClients.filter((_, i) => i !== index);
    setAirlineClients(updated);
    form.setValue("airlineClients", updated);
  }

  async function onSubmit(values: OrganizationFormValues) {
    setIsLoading(true);
    try {
      const result = await actionUpdateOrganization(values);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Organization settings updated successfully.",
        });
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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic details about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Logo</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Stations</CardTitle>
              <CardDescription>
                Manage the airport stations where your team operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Station code (e.g., YUL)"
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStation();
                    }
                  }}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" size="icon" onClick={addStation}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {stations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {stations.map((station, index) => (
                    <div
                      key={station}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {station}
                      <button
                        type="button"
                        onClick={() => removeStation(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Airline Clients</CardTitle>
              <CardDescription>
                Airlines your organization provides ground handling services to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Airline name"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addClient();
                    }
                  }}
                  className="max-w-xs"
                />
                <Button type="button" variant="outline" size="icon" onClick={addClient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {airlineClients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {airlineClients.map((client, index) => (
                    <div
                      key={client}
                      className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {client}
                      <button
                        type="button"
                        onClick={() => removeClient(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
