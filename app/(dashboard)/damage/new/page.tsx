import { PageHeader } from "@/components/modules/shared/page-header";
import { DamageReportForm } from "@/components/modules/damage/damage-report-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewDamageReportPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="Report Incident"
        description="Document aircraft damage for review and approval chain"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/damage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <DamageReportForm />
    </div>
  );
}
