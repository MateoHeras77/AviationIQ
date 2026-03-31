import { transporter, defaultFrom } from "./config";
import type { EmailParams, EmailResult } from "./email.types";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Wait for a given number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send an email via Nodemailer with error handling and retry.
 * Returns a typed result instead of throwing.
 */
export async function sendEmail(
  params: EmailParams
): Promise<EmailResult> {
  const { to, subject, html, attachments } = params;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: defaultFrom,
        to,
        subject,
        html,
        attachments: attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      return {
        success: true,
        messageId: info.messageId,
        error: null,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown email error";

      console.error(
        `[AviationIQ Email] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for "${to}": ${errorMessage}`
      );

      // Don't retry on auth errors — they won't resolve with retries
      if (
        errorMessage.includes("Invalid login") ||
        errorMessage.includes("Authentication")
      ) {
        return {
          success: false,
          messageId: null,
          error: `SMTP authentication failed: ${errorMessage}`,
        };
      }

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      } else {
        return {
          success: false,
          messageId: null,
          error: `Failed after ${MAX_RETRIES + 1} attempts: ${errorMessage}`,
        };
      }
    }
  }

  // TypeScript exhaustiveness — should never reach here
  return { success: false, messageId: null, error: "Unexpected error" };
}
