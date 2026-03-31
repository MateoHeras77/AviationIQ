import {
  actionGetShifts,
  actionGetStaffDirectory,
  actionGetHandoverLogs,
  actionGetWorkforceStats,
} from "./actions";
import { WorkforceClient } from "./workforce-client";

export default async function WorkforcePage() {
  const [shiftsResult, staffResult, handoversResult, statsResult] =
    await Promise.all([
      actionGetShifts(),
      actionGetStaffDirectory(),
      actionGetHandoverLogs(),
      actionGetWorkforceStats(),
    ]);

  return (
    <WorkforceClient
      shifts={shiftsResult.data}
      staff={staffResult.data}
      handovers={handoversResult.data}
      stats={statsResult.data}
    />
  );
}
