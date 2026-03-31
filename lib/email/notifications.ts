import { sendEmail } from "./send-email";
import type {
  NotificationType,
  NotificationPayloadMap,
  EmailResult,
} from "./email.types";

// Template imports
import { turnaroundAlertTemplate } from "./templates/turnaround-alert";
import { damageReportSubmittedTemplate } from "./templates/damage-report-submitted";
import { damageReportApprovedTemplate } from "./templates/damage-report-approved";
import { damageReportNotificationTemplate } from "./templates/damage-report-notification";
import { damageReportRejectedTemplate } from "./templates/damage-report-rejected";
import { groomingAssignmentTemplate } from "./templates/grooming-assignment";
import { userInvitationTemplate } from "./templates/user-invitation";

// =============================================================================
// Subject line generators
// =============================================================================

const subjectGenerators: Record<
  NotificationType,
  (payload: NotificationPayloadMap[NotificationType]) => string
> = {
  turnaround_delay: (p) => {
    const payload = p as NotificationPayloadMap["turnaround_delay"];
    return `[ALERT] Turnaround Delay — ${payload.flightNumber} at ${payload.stationCode} (+${payload.delayMinutes}min)`;
  },
  damage_report_submitted: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_submitted"];
    return `New Damage Report — ${payload.flightNumber} (${payload.severity.toUpperCase()})`;
  },
  damage_report_approved: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_approved"];
    return `Damage Report Awaiting Final Approval — ${payload.flightNumber}`;
  },
  damage_report_final_approved: (p) => {
    const payload =
      p as NotificationPayloadMap["damage_report_final_approved"];
    return `Damage Report Notification — ${payload.flightNumber} (${payload.aircraftRegistration})`;
  },
  damage_report_rejected: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_rejected"];
    return `Damage Report Rejected — ${payload.flightNumber}`;
  },
  grooming_assignment: (p) => {
    const payload = p as NotificationPayloadMap["grooming_assignment"];
    return `Grooming Assignment — ${payload.flightNumber} (${payload.cleaningLevel.replace("_", " ")})`;
  },
  user_invitation: (p) => {
    const payload = p as NotificationPayloadMap["user_invitation"];
    return `You're Invited to ${payload.organizationName} on AviationIQ`;
  },
};

// =============================================================================
// HTML generators
// =============================================================================

const htmlGenerators: Record<
  NotificationType,
  (payload: NotificationPayloadMap[NotificationType]) => string
> = {
  turnaround_delay: (p) => {
    const payload = p as NotificationPayloadMap["turnaround_delay"];
    return turnaroundAlertTemplate(payload);
  },
  damage_report_submitted: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_submitted"];
    return damageReportSubmittedTemplate(payload);
  },
  damage_report_approved: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_approved"];
    return damageReportApprovedTemplate(payload);
  },
  damage_report_final_approved: (p) => {
    const payload =
      p as NotificationPayloadMap["damage_report_final_approved"];
    return damageReportNotificationTemplate(payload);
  },
  damage_report_rejected: (p) => {
    const payload = p as NotificationPayloadMap["damage_report_rejected"];
    return damageReportRejectedTemplate(payload);
  },
  grooming_assignment: (p) => {
    const payload = p as NotificationPayloadMap["grooming_assignment"];
    return groomingAssignmentTemplate(payload);
  },
  user_invitation: (p) => {
    const payload = p as NotificationPayloadMap["user_invitation"];
    return userInvitationTemplate(payload);
  },
};

// =============================================================================
// Recipient email extractors
// =============================================================================

function getRecipientEmail(
  type: NotificationType,
  payload: NotificationPayloadMap[NotificationType]
): string {
  switch (type) {
    case "user_invitation":
      return (payload as NotificationPayloadMap["user_invitation"])
        .inviteeEmail;
    case "grooming_assignment":
      return (payload as NotificationPayloadMap["grooming_assignment"])
        .recipientEmail;
    default: {
      // All other types have recipientEmail
      const p = payload as { recipientEmail: string };
      return p.recipientEmail;
    }
  }
}

// =============================================================================
// Central notification dispatcher
// =============================================================================

export interface DispatchResult {
  success: boolean;
  notificationType: NotificationType;
  emailResult: EmailResult | null;
  error: string | null;
}

/**
 * Central notification dispatcher.
 * Accepts a notification type and payload, looks up the appropriate template,
 * and sends the email via sendEmail.
 */
export async function dispatchNotification<T extends NotificationType>(
  type: T,
  payload: NotificationPayloadMap[T]
): Promise<DispatchResult> {
  try {
    const recipientEmail = getRecipientEmail(type, payload);

    if (!recipientEmail) {
      return {
        success: false,
        notificationType: type,
        emailResult: null,
        error: "No recipient email provided",
      };
    }

    const subject = subjectGenerators[type](payload);
    const html = htmlGenerators[type](payload);

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });

    if (!emailResult.success) {
      console.error(
        `[AviationIQ Notifications] Failed to send ${type} to ${recipientEmail}: ${emailResult.error}`
      );
    }

    return {
      success: emailResult.success,
      notificationType: type,
      emailResult,
      error: emailResult.error,
    };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown dispatch error";

    console.error(
      `[AviationIQ Notifications] Dispatch error for ${type}: ${errorMessage}`
    );

    return {
      success: false,
      notificationType: type,
      emailResult: null,
      error: errorMessage,
    };
  }
}

/**
 * Dispatch multiple notifications in parallel.
 * Returns results for each dispatch.
 */
export async function dispatchNotifications(
  notifications: Array<{
    type: NotificationType;
    payload: NotificationPayloadMap[NotificationType];
  }>
): Promise<DispatchResult[]> {
  return Promise.all(
    notifications.map(({ type, payload }) =>
      dispatchNotification(type, payload)
    )
  );
}
