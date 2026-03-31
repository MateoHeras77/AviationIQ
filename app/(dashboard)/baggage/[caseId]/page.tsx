import { notFound } from "next/navigation";
import { actionGetBaggageCaseDetail } from "../actions";
import { CaseDetailClient } from "./case-detail-client";

interface BaggageCaseDetailPageProps {
  params: Promise<{ caseId: string }>;
}

export default async function BaggageCaseDetailPage({
  params,
}: BaggageCaseDetailPageProps) {
  const { caseId } = await params;

  const result = await actionGetBaggageCaseDetail(caseId);

  if (result.error || !result.data) {
    notFound();
  }

  return <CaseDetailClient baggageCase={result.data} />;
}
