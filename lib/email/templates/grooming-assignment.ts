import type { GroomingAssignmentParams } from "../email.types";

export function groomingAssignmentTemplate(
  params: GroomingAssignmentParams
): string {
  const {
    agentName,
    flightNumber,
    aircraftRegistration,
    cleaningLevel,
    gate,
    scheduledTime,
    stationCode,
    dashboardUrl,
  } = params;

  const cleaningLabels: Record<string, string> = {
    transit_clean: "Transit Clean",
    full_clean: "Full Clean",
    deep_clean: "Deep Clean",
  };

  const cleaningColors: Record<string, string> = {
    transit_clean: "#16a34a",
    full_clean: "#2563eb",
    deep_clean: "#7c3aed",
  };

  const displayLevel = cleaningLabels[cleaningLevel] || cleaningLevel;
  const levelColor = cleaningColors[cleaningLevel] || "#18181b";

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
      <td style="background-color:#16a34a;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Grooming Assignment</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">Hello <strong>${agentName}</strong>,</p>
        <p style="font-size:16px;color:#18181b;margin:0 0 24px;">You have been assigned to a grooming work order at station <strong>${stationCode}</strong>.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Flight</td>
            <td style="color:#18181b;">${flightNumber}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Aircraft</td>
            <td style="color:#18181b;">${aircraftRegistration}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Cleaning Level</td>
            <td style="color:${levelColor};font-weight:bold;">${displayLevel}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Gate</td>
            <td style="color:#18181b;">${gate}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Scheduled Time</td>
            <td style="color:#18181b;">${scheduledTime}</td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${dashboardUrl}" style="display:inline-block;background-color:#16a34a;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">View Assignment</a>
        </div>
        <p style="font-size:14px;color:#71717a;margin:0;">Please report to the gate on time and update your status in the app.</p>
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
