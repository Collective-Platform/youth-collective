import Stripe from "stripe";
import { google } from "googleapis";

const sessionId = process.argv[2];
if (!/^cs_/.test(sessionId ?? "")) throw new Error("Usage: node scripts/reconcile-checkout-session.mjs cs_...");

const { STRIPE_SECRET_KEY, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY } = process.env;
if (!STRIPE_SECRET_KEY || !GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  throw new Error("Missing Stripe or Google Sheets environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

const sheetName = "Registrations";
const earlyBirdInstallmentPriceId = "price_1U3tMKHJ40gQ7FP8VlAXiWZ6";
const lateBirdInstallmentPriceId = "price_1U4FR8HJ40gQ7FP8l9kb90rC";
const range = `'${sheetName}'!A1:AI`;
const values = (await sheets.spreadsheets.values.get({ spreadsheetId: GOOGLE_SHEET_ID, range })).data.values ?? [];
const [headers = [], ...rows] = values;
const column = (name) => {
  const index = headers.indexOf(name);
  if (index === -1) throw new Error(`Missing sheet column: ${name}`);
  return index;
};
const columnLetter = (index) => {
  let result = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    result = String.fromCharCode(((value - 1) % 26) + 65) + result;
  }
  return result;
};

const session = await stripe.checkout.sessions.retrieve(sessionId);
if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
  throw new Error(`Stripe reports this Checkout Session as ${session.payment_status}, not paid.`);
}

const registrationId = session.client_reference_id ?? session.metadata?.registrationId;
const sessionColumn = column("Stripe Checkout Session ID");
const registrationColumn = column("Registration ID");
const rowIndex = rows.findIndex((row) => row[sessionColumn] === session.id || row[registrationColumn] === registrationId);
if (rowIndex === -1) throw new Error("No matching registration was found in the sheet.");

const rowNumber = rowIndex + 2;
const changes = new Map([
  ["Stripe Checkout Session ID", session.id],
  ["Stripe Payment Intent ID", typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? ""],
  ["Stripe Subscription ID", typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? ""],
  ["Last payment date", new Date().toISOString()],
]);

if (session.mode === "payment") {
  changes.set("Payment status", "Paid");
} else if (session.mode === "subscription" && session.subscription) {
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const installmentCount = session.metadata?.installmentCount === "2" ? 2 : 3;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  if (!subscription.schedule) {
    const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId });
    if (!schedule.current_phase) throw new Error("Could not create the installment schedule.");

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: "cancel",
      metadata: { registrationId },
      proration_behavior: "none",
      phases: [{
        start_date: schedule.current_phase.start_date,
        duration: { interval: "month", interval_count: installmentCount },
        items: [{ price: installmentCount === 2 ? lateBirdInstallmentPriceId : earlyBirdInstallmentPriceId, quantity: 1 }],
        metadata: { registrationId, installmentCount: String(installmentCount) },
      }],
    });
  }

  const invoices = await stripe.invoices.list({ subscription: subscriptionId, status: "paid", limit: 100 });
  const paidInvoiceIds = invoices.data.map((invoice) => invoice.id).reverse();
  const paidCount = Math.min(paidInvoiceIds.length, installmentCount);
  changes.set("Stripe Invoice IDs", paidInvoiceIds.join(","));
  changes.set("Installments paid", `${paidCount}/${installmentCount}`);
  changes.set("Payment status", paidCount === installmentCount ? "Paid in full" : `Installment ${paidCount}/${installmentCount} paid`);
} else {
  throw new Error(`Unsupported Checkout Session mode: ${session.mode}`);
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: GOOGLE_SHEET_ID,
  requestBody: {
    valueInputOption: "RAW",
    data: [...changes].map(([header, value]) => ({
      range: `'${sheetName}'!${columnLetter(column(header))}${rowNumber}`,
      values: [[value]],
    })),
  },
});

console.log(`Updated registration row ${rowNumber}: ${changes.get("Payment status")}.`);
