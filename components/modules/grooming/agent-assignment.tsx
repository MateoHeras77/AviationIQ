"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/modules/shared/empty-state";
import {
  actionAssignAgent,
  actionUnassignAgent,
  actionGetAvailableAgents,
} from "@/app/(dashboard)/grooming/actions";
import type {
  GroomingAssignment,
  AgentOption,
} from "@/app/(dashboard)/grooming/grooming.types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, UserMinus, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentAssignmentProps {
  workOrderId: string;
  assignments: GroomingAssignment[];
  requiredAgents: number;
  workOrderStatus: string;
}

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-green-600",
  "bg-teal-500",
  "bg-lime-600",
  "bg-emerald-700",
  "bg-green-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AgentAssignment({
  workOrderId,
  assignments,
  requiredAgents,
  workOrderStatus,
}: AgentAssignmentProps) {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null);

  const canModify =
    workOrderStatus === "pending" || workOrderStatus === "in_progress";

  const assignedIds = new Set(assignments.map((a) => a.agent_id));
  const availableAgents = agents.filter((a) => !assignedIds.has(a.id));

  useEffect(() => {
    actionGetAvailableAgents().then((res) => {
      if (res.data) setAgents(res.data as AgentOption[]);
    });
  }, []);

  async function handleAssign() {
    if (!selectedAgentId) return;
    setIsAssigning(true);
    try {
      const result = await actionAssignAgent(workOrderId, selectedAgentId);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Agent Assigned",
          description: "Agent has been assigned to this work order.",
        });
        setSelectedAgentId("");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to assign agent.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleUnassign(agentId: string) {
    setIsUnassigning(agentId);
    try {
      const result = await actionUnassignAgent(workOrderId, agentId);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Agent Removed",
          description: "Agent has been removed from this work order.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove agent.",
        variant: "destructive",
      });
    } finally {
      setIsUnassigning(null);
    }
  }

  return (
    <Card className="border-green-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Agent Assignments
            <span
              className={cn(
                "text-xs font-bold rounded-full px-2 py-0.5 ml-1",
                assignments.length >= requiredAgents
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {assignments.length}/{requiredAgents}
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assign new agent */}
        {canModify && availableAgents.length > 0 && (
          <div className="flex gap-2">
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
            >
              <SelectTrigger className="flex-1 border-green-200 focus:ring-emerald-500">
                <SelectValue placeholder="Select an agent to assign" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssign}
              disabled={!selectedAgentId || isAssigning}
              className="min-h-[44px] bg-emerald-600 hover:bg-emerald-700"
            >
              {isAssigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Agent avatar cards */}
        {assignments.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No agents assigned"
            description="Assign agents to start this work order."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50/30 p-3"
              >
                {/* Avatar circle */}
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0",
                    AVATAR_COLORS[index % AVATAR_COLORS.length]
                  )}
                >
                  {assignment.agent_name
                    ? getInitials(assignment.agent_name)
                    : "?"}
                </div>

                {/* Name and time info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {assignment.agent_name ?? "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {assignment.entry_time && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3 text-emerald-500" />
                        {new Date(assignment.entry_time).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}
                      </span>
                    )}
                    {assignment.completion_time && (
                      <span className="flex items-center gap-0.5 text-green-700">
                        &rarr;{" "}
                        {new Date(
                          assignment.completion_time
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    )}
                    {!assignment.entry_time && !assignment.completion_time && (
                      <span className="text-gray-400">Not started</span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                {canModify && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleUnassign(assignment.agent_id)}
                    disabled={isUnassigning === assignment.agent_id}
                    aria-label={`Remove ${assignment.agent_name}`}
                  >
                    {isUnassigning === assignment.agent_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
