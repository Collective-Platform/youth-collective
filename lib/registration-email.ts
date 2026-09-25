import type { RegistrationRow } from "./program-registration";

const adminEmail = "carinalau@collective.my";
const senderName = "Collective Youth";

const responseFields: Array<[keyof RegistrationRow, string]> = [
  ["Created at", "Submitted at"],
  ["Full name", "Full name"],
  ["Date of birth", "Date of birth"],
  ["IC number", "IC number"],
  ["Gender", "Gender"],
  ["Citizenship", "Citizenship"],
  ["Email", "Email"],
  ["WhatsApp number", "WhatsApp number"],
  ["Current address", "Current address"],
  ["Allergies", "Allergies"],
  ["About you", "Tell us a little about yourself"],
  ["Following Jesus", "How did you begin following Jesus?"],
  ["Relationship with God", "Relationship with God currently"],
  ["Why join", "Why do you want to join this program?"],
  ["Hopes for program", "What are you hoping God might do?"],
  ["Additional information", "Additional information"],
  ["Mental health acknowledgement", "Mental-health notice"],
  ["Parent / guardian name", "Parent / guardian name"],
  ["Parent / guardian phone", "Parent / guardian phone"],
  ["Parent / guardian address", "Parent / guardian address"],
  ["Emergency contact name", "Emergency contact name"],
  ["Emergency contact phone", "Emergency contact phone"],
  ["Signature date", "Signature date"],
  ["Waiver accepted", "Waiver"],
  ["Signature", "Electronic signature"],
  ["Payment plan", "Payment plan"],
  ["Payment status", "Payment status"],
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getResponses(row: RegistrationRow) {
  return responseFields.flatMap(([field, label]) => (row[field] ? [{ label, value: row[field] }] : []));
}

export function renderRegistrationResponseEmail(row: RegistrationRow) {
  const responses = getResponses(row);
  const text = [
    `Hi ${row["Full name"]},`,
    "",
    "Thank you for registering for Strictly Students Learning Labs: Experience.",
    "",
    "Here is a copy of your registration responses:",
    "",
    ...responses.flatMap(({ label, value }) => [`${label}:`, value, ""]),
    "Strictly Students",
  ].join("\n");

  const htmlResponses = responses
    .map(
      ({ label, value }) =>
        `<tr><th style="padding:10px 12px;text-align:left;vertical-align:top;border:1px solid #d9d9d9;background:#f45c36">${escapeHtml(label)}</th><td style="padding:10px 12px;vertical-align:top;border:1px solid #d9d9d9;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;color:#111;font-family:Arial,sans-serif"><div style="max-width:720px;margin:0 auto;padding:32px 16px"><div style="border:2px solid #111;background:#fff;padding:28px"><h1 style="margin:0 0 20px;font-size:28px">Experience Lab registration</h1><p>Hi ${escapeHtml(row["Full name"])},</p><p>Thank you for registering for Strictly Students Learning Labs: Experience.</p><p>Here is a copy of your registration responses:</p><table style="width:100%;border-collapse:collapse;font-size:14px"><tbody>${htmlResponses}</tbody></table><p style="margin:24px 0 0">Strictly Students</p></div></div></body></html>`;

  return { text, html };
}

export async function sendRegistrationResponseEmail(row: RegistrationRow) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error("MAILERSEND_API_KEY and MAILERSEND_FROM_EMAIL must be configured.");
  }

  const { text, html } = renderRegistrationResponseEmail(row);
  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: senderName },
      to: [{ email: row.Email, name: row["Full name"] }],
      ...(row.Email.toLowerCase() === adminEmail ? {} : { bcc: [{ email: adminEmail, name: "Carina Lau" }] }),
      reply_to: { email: adminEmail, name: "Carina Lau" },
      subject: "Experience Lab registration responses",
      text,
      html,
      tags: ["experience-lab-registration"],
      settings: { track_clicks: false, track_opens: false, track_content: false },
    }),
  });

  if (!response.ok) {
    throw new Error(`MailerSend registration email failed with status ${response.status}.`);
  }

  return response.headers.get("x-message-id");
}
