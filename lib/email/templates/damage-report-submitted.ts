import type { DamageReportSubmittedParams } from "../email.types";

export function damageReportSubmittedTemplate(
  params: DamageReportSubmittedParams
): string {
  const {
    reportId,
    flightNumber,
    aircraftRegistration,
    damageLocation,
    damageDescription,
    severity,
    reportedBy,
    reportedAt,
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
      <td style="background-color:#ea580c;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">New Damage Report Submitted</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">A new damage report has been submitted at station <strong>${stationCode}</strong> and requires your review.</p>
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
            <td style="font-weight:bold;color:#52525b;">Location</td>
            <td style="color:#18181b;">${damageLocation}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Description</td>
            <td style="color:#18181b;">${damageDescription}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Reported By</td>
            <td style="color:#18181b;">${reportedBy}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Reported At</td>
            <td style="color:#18181b;">${reportedAt}</td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${dashboardUrl}" style="display:inline-block;background-color:#ea580c;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Review Report</a>
        </div>
        <p style="font-size:14px;color:#71717a;margin:0;">Please review and approve or reject this report promptly.</p>
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
