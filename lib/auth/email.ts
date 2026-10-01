import "server-only";

function getMailerSendSettings() {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
  const fromName = process.env.MAILERSEND_FROM_NAME ?? "Youth Collective";
  if (!apiKey || !fromEmail) {
    throw new Error("MAILERSEND_API_KEY and MAILERSEND_FROM_EMAIL are required for email OTP authentication.");
  }
  return { apiKey, fromEmail, fromName };
}

export async function sendSignInOtp(email: string, otp: string) {
  const { apiKey, fromEmail, fromName } = getMailerSendSettings();
  const text = `Your Youth Collective verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request it, you can ignore this email.`;
  const html = `<p>Your Youth Collective verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:.18em">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`;
  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject: "Your Youth Collective verification code",
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`MailerSend OTP delivery failed with status ${response.status}.`);
}
