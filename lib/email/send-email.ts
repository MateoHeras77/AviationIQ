import { transporter, defaultFrom } from "./config";
import type { EmailParams } from "./email.types";

export async function sendEmail({ to, subject, html }: EmailParams) {
  const info = await transporter.sendMail({
    from: defaultFrom,
    to,
    subject,
    html,
  });

  return { messageId: info.messageId };
}
