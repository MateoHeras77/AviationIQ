import type { ShiftHandoverReportParams } from "../email.types";

export function shiftHandoverReportTemplate(
  params: ShiftHandoverReportParams
): string {
  const {
    stationCode,
    outgoingShift,
    incomingShift,
    handoverDate,
    pendingFlights,
    openIssues,
    completedTasks,
    notes,
    handoverBy,
  } = params;

  const openIssuesList = openIssues
    .map((issue) => `<li style="margin-bottom:4px;color:#18181b;">${issue}</li>`)
    .join("");

  const completedTasksList = completedTasks
    .map((task) => `<li style="margin-bottom:4px;color:#18181b;">${task}</li>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="background-color:#7c3aed;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Shift Handover Report</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Station</td>
            <td style="color:#18181b;">${stationCode}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Date</td>
            <td style="color:#18181b;">${handoverDate}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Outgoing Shift</td>
            <td style="color:#18181b;">${outgoingShift}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Incoming Shift</td>
            <td style="color:#18181b;">${incomingShift}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Handed Over By</td>
            <td style="color:#18181b;">${handoverBy}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Pending Flights</td>
            <td style="color:#18181b;font-weight:bold;">${pendingFlights}</td>
          </tr>
        </table>

        ${
          openIssues.length > 0
            ? `<h3 style="color:#dc2626;margin:0 0 8px;">Open Issues</h3>
               <ul style="padding-left:20px;margin:0 0 24px;">${openIssuesList}</ul>`
            : ""
        }

        ${
          completedTasks.length > 0
            ? `<h3 style="color:#16a34a;margin:0 0 8px;">Completed Tasks</h3>
               <ul style="padding-left:20px;margin:0 0 24px;">${completedTasksList}</ul>`
            : ""
        }

        ${
          notes
            ? `<h3 style="color:#52525b;margin:0 0 8px;">Notes</h3>
               <p style="color:#18181b;background-color:#f4f4f5;padding:12px;border-radius:6px;margin:0 0 24px;">${notes}</p>`
            : ""
        }
      </td>
    </tr>
    <tr>
      <td style="background-color:#f4f4f5;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#a1a1aa;margin:0;">AviationIQ — Ground Handling Operations Platform</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
