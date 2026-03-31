"use client";

import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ExportCard({ title, description, icon: Icon }: ExportCardProps) {
  const { toast } = useToast();

  function handleGenerate() {
    toast({
      title: "Coming Soon",
      description: `${title} report generation will be available in a future update.`,
    });
  }

  return (
    <Card className="flex flex-col h-full border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
            <Icon className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button
          variant="outline"
          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
          onClick={handleGenerate}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
}
