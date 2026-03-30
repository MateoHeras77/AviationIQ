import type { DamageReportNotificationParams } from "../email.types";

export function damageReportNotificationTemplate(
  params: DamageReportNotificationParams
): string {
  const {
    reportId,
    flightNumber,
    aircraftRegistration,
    damageDescription,
    severity,
    reportedBy,
    reportedAt,
    stationCode,
    imageUrls,
  } = params;

  const severityColor =
    severity === "critical"
      ? "#dc2626"
      : severity === "major"
        ? "#ea580c"
        : "#ca8a04";

  const imageSection = imageUrls?.length
    ? `<tr>
        <td style="padding:16px 24px;">
          <p style="font-weight:bold;color:#52525b;margin:0 0 8px;">Attached Images:</p>
          ${imageUrls.map((url) => `<img src="${url}" alt="Damage photo" style="max-width:100%;border-radius:8px;margin-bottom:8px;" />`).join("")}
        </td>
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
      <td style="background-color:#ea580c;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Damage Report Notification</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">A damage report has been filed and approved at station <strong>${stationCode}</strong>.</p>
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
            <td style="font-weight:bold;color:#52525b;">Reported By</td>
            <td style="color:#18181b;">${reportedBy}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Reported At</td>
            <td style="color:#18181b;">${reportedAt}</td>
          </tr>
        </table>
      </td>
    </tr>
    ${imageSection}
    <tr>
      <td style="background-color:#f4f4f5;padding:16px 24px;text-align:center;">
        <p style="font-size:12px;color:#a1a1aa;margin:0;">AviationIQ — Ground Handling Operations Platform</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
