import type { UserInvitationParams } from "../email.types";

export function userInvitationTemplate(
  params: UserInvitationParams
): string {
  const {
    inviteeName,
    inviteeEmail,
    organizationName,
    role,
    invitedBy,
    inviteUrl,
  } = params;

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    station_manager: "Station Manager",
    supervisor: "Supervisor",
    agent: "Agent",
    airline_client: "Airline Client",
  };

  const displayRole = roleLabels[role] || role;

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
      <td style="background-color:#18181b;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">You're Invited to AviationIQ</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 24px;">
        <p style="font-size:16px;color:#18181b;margin:0 0 16px;">Hello <strong>${inviteeName}</strong>,</p>
        <p style="font-size:16px;color:#18181b;margin:0 0 24px;"><strong>${invitedBy}</strong> has invited you to join <strong>${organizationName}</strong> on AviationIQ as a <strong>${displayRole}</strong>.</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;margin-bottom:24px;">
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Email</td>
            <td style="color:#18181b;">${inviteeEmail}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#52525b;">Organization</td>
            <td style="color:#18181b;">${organizationName}</td>
          </tr>
          <tr style="background-color:#f4f4f5;">
            <td style="font-weight:bold;color:#52525b;">Role</td>
            <td style="color:#18181b;">${displayRole}</td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${inviteUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">Accept Invitation</a>
        </div>
        <p style="font-size:14px;color:#71717a;margin:0;">This invitation link will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.</p>
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
