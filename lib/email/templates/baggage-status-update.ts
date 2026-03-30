import type { BaggageStatusUpdateParams } from "../email.types";

export function baggageStatusUpdateTemplate(
  params: BaggageStatusUpdateParams
): string {
  const {
    caseId,
    passengerName,
    status,
    flightNumber,
    bagTagNumber,
    lastKnownLocation,
    estimatedDelivery,
    trackingUrl,
  } = params;

  const statusLabels: Record<string, string> = {
    reported: "Reported",
    located: "Located",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    closed: "Closed",
  };

  const statusColors: Record<string, string> = {
    reported: "#dc2626",
    located: "#ca8a04",
    in_transit: "#2563eb",
    out_for_delivery: "#7c3aed",
    delivered: "#16a34a",
    closed: "#71717a",
  };

  const displayStatus = statusLabels[status] || status;
  const statusColor = statusColors[status] || "#18181b";

  const trackingSection = trackingUrl
    ? `<tr>
        <td colspan="2" style="padding:16px 0 0;">
          <a href="${trackingUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Track Your Baggage</a>
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
      <td style="background-color:#2563eb;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">Baggage Status Update</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">Dear <strong>${passengerName}</strong>,</p>
        <p style="font-size:16px;color:#18181b;margin:0 0 24px;">Here is an update regarding your baggage case.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Case ID</td>
            <td style="color:#18181b;">${caseId}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Flight</td>
            <td style="color:#18181b;">${flightNumber}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Bag Tag</td>
            <td style="color:#18181b;">${bagTagNumber}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Status</td>
            <td style="color:${statusColor};font-weight:bold;">${displayStatus}</td>
          </tr>
          ${lastKnownLocation ? `<tr style="background-color:#f4f4f5;"><td style="font-weight:bold;color:#52525b;">Last Known Location</td><td style="color:#18181b;">${lastKnownLocation}</td></tr>` : ""}
          ${estimatedDelivery ? `<tr><td style="font-weight:bold;color:#52525b;">Estimated Delivery</td><td style="color:#18181b;">${estimatedDelivery}</td></tr>` : ""}
          ${trackingSection}
        </table>
        <p style="font-size:14px;color:#71717a;margin:0;">If you have any questions, please contact our customer service team.</p>
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
