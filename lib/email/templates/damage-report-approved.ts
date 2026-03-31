import type { DamageReportApprovedParams } from "../email.types";

export function damageReportApprovedTemplate(
  params: DamageReportApprovedParams
): string {
  const {
    reportId,
    flightNumber,
    aircraftRegistration,
    damageDescription,
    severity,
    supervisorName,
    supervisorComments,
    stationCode,
    dashboardUrl,
  } = params;

  const severityColor =
    severity === "critical"
      ? "#dc2626"
      : severity === "major"
        ? "#ea580c"
        : severity === "moderate"
          ? "#ca8a04"
          : "#71717a";

  const commentsSection = supervisorComments
    ? `<tr style="background-color:#f4f4f5;">
        <td style="font-weight:bold;color:#52525b;">Supervisor Comments</td>
        <td style="color:#18181b;">${supervisorComments}</td>
      </tr>`
    : "";

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
      <td style="background-color:#ca8a04;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Damage Report — Supervisor Approved</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">A damage report at station <strong>${stationCode}</strong> has been approved by <strong>${supervisorName}</strong> and requires your final approval.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Report ID</td>
            <td style="color:#18181b;">${reportId}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Flight</td>
            <td style="color:#18181b;">${flightNumber}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Aircraft</td>
            <td style="color:#18181b;">${aircraftRegistration}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Severity</td>
            <td style="color:${severityColor};font-weight:bold;text-transform:uppercase;">${severity}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Description</td>
            <td style="color:#18181b;">${damageDescription}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Approved By</td>
            <td style="color:#18181b;">${supervisorName} (Supervisor)</td>
          </tr>
          ${commentsSection}
        </table>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${dashboardUrl}" style="display:inline-block;background-color:#ca8a04;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Review for Final Approval</a>
        </div>
        <p style="font-size:14px;color:#71717a;margin:0;">Final approval will trigger notification to the airline client.</p>
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
