import { BaggageListClient } from "./baggage-list-client";
import { actionGetBaggageCases } from "./actions";

export default async function BaggagePage() {
  const { data: cases } = await actionGetBaggageCases();

  return <BaggageListClient initialCases={cases ?? []} />;
}
