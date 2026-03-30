import type { TurnaroundAlertParams } from "../email.types";

export function turnaroundAlertTemplate(params: TurnaroundAlertParams): string {
  const {
    flightNumber,
    origin,
    destination,
    scheduledDeparture,
    delayMinutes,
    delayReason,
    stationCode,
  } = params;

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
      <td style="background-color:#dc2626;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Turnaround Delay Alert</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">A turnaround delay has been detected at station <strong>${stationCode}</strong>.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Flight</td>
            <td style="color:#18181b;">${flightNumber}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Route</td>
            <td style="color:#18181b;">${origin} → ${destination}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Scheduled Departure</td>
            <td style="color:#18181b;">${scheduledDeparture}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Delay</td>
            <td style="color:#dc2626;font-weight:bold;">${delayMinutes} minutes</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Reason</td>
            <td style="color:#18181b;">${delayReason}</td>
          </tr>
        </table>
        <p style="font-size:14px;color:#71717a;margin:0;">Please take immediate action to minimize further delays.</p>
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
