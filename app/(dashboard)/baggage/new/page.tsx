import { PageHeader } from "@/components/modules/shared/page-header";
import { BaggageCaseForm } from "@/components/modules/baggage/baggage-case-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewBaggageCasePage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader
        title="New Baggage Case"
        description="File a new baggage incident report for tracking and resolution"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/baggage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <BaggageCaseForm />
    </div>
  );
}
