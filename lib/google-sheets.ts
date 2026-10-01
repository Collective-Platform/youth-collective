import "server-only";

import { google } from "googleapis";
import {
  PROGRAM_REGISTRATION_HEADERS,
  PROGRAM_REGISTRATION_SHEET_NAME,
  type RegistrationRow,
} from "./program-registration";

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const quotedSheetName = `'${PROGRAM_REGISTRATION_SHEET_NAME.replaceAll("'", "''")}'`;

export type ExperienceRegistrationSummary = {
  registrationId: string;
  paymentPlan: string;
  paymentStatus: string;
  installmentsPaid: string;
  lastPaymentFailure: string;
};

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function columnLetter(index: number) {
  let result = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    result = String.fromCharCode(((value - 1) % 26) + 65) + result;
  }
  return result;
}

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !email || !privateKey) {
    throw new Error("Google Sheets has not been configured.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function ensureRegistrationSheet() {
  const sheets = getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  const existingSheet = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === PROGRAM_REGISTRATION_SHEET_NAME,
  );

  if (!existingSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: PROGRAM_REGISTRATION_SHEET_NAME } } }] },
    });
  }

  const headerResult = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quotedSheetName}!1:1`,
  });
  const currentHeaders = headerResult.data.values?.[0] ?? [];
  if (currentHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quotedSheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [Array.from(PROGRAM_REGISTRATION_HEADERS)] },
    });
  } else if (currentHeaders.some((header, index) => header !== PROGRAM_REGISTRATION_HEADERS[index])) {
    throw new Error(`The ${PROGRAM_REGISTRATION_SHEET_NAME} sheet has unexpected column headings.`);
  } else if (currentHeaders.length < PROGRAM_REGISTRATION_HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quotedSheetName}!${columnLetter(currentHeaders.length)}1`,
      valueInputOption: "RAW",
      requestBody: { values: [PROGRAM_REGISTRATION_HEADERS.slice(currentHeaders.length)] },
    });
  }

  return sheets;
}

function rowFromValues(values: string[] | undefined): RegistrationRow {
  return Object.fromEntries(
    PROGRAM_REGISTRATION_HEADERS.map((header, index) => [header, values?.[index] ?? ""]),
  ) as RegistrationRow;
}

export async function getRegistration(registrationId: string) {
  const sheets = await ensureRegistrationSheet();
  const range = `${quotedSheetName}!A2:${columnLetter(PROGRAM_REGISTRATION_HEADERS.length - 1)}`;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = result.data.values ?? [];
  const index = rows.findIndex((row) => row[0] === registrationId);
  if (index === -1) return null;

  return { rowNumber: index + 2, row: rowFromValues(rows[index]) };
}

/**
 * Reads only the account-safe registration fields required by a member
 * dashboard. Form answers and contact details never leave this module.
 */
export async function listExperienceRegistrationsForEmail(email: string): Promise<ExperienceRegistrationSummary[]> {
  if (!spreadsheetId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return [];
  }

  try {
    const sheets = getSheetsClient();
    const result = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        `${quotedSheetName}!A2:A`,
        `${quotedSheetName}!H2:H`,
        `${quotedSheetName}!AA2:AB`,
        `${quotedSheetName}!AG2:AI`,
      ],
    });
    const [identityRows = [], emailRows = [], paymentRows = [], paymentHistoryRows = []] = result.data.valueRanges?.map((range) => range.values ?? []) ?? [];
    const accountEmail = normaliseEmail(email);

    return emailRows.flatMap((row, index) => {
      if (normaliseEmail(String(row[0] ?? "")) !== accountEmail) return [];

      const [registrationId = ""] = identityRows[index] ?? [];
      if (!registrationId) return [];

      const [paymentPlan = "", paymentStatus = ""] = paymentRows[index] ?? [];
      const [installmentsPaid = "", , lastPaymentFailure = ""] = paymentHistoryRows[index] ?? [];

      return [{
        registrationId,
        paymentPlan,
        paymentStatus,
        installmentsPaid,
        lastPaymentFailure,
      }];
    });
  } catch {
    // Registrations should not make the member's booking dashboard unavailable.
    return [];
  }
}

export async function appendRegistration(row: RegistrationRow) {
  const existing = await getRegistration(row["Registration ID"]);
  if (existing) return existing;

  const sheets = await ensureRegistrationSheet();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quotedSheetName}!A:${columnLetter(PROGRAM_REGISTRATION_HEADERS.length - 1)}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [PROGRAM_REGISTRATION_HEADERS.map((header) => row[header])] },
  });

  const appended = await getRegistration(row["Registration ID"]);
  if (!appended) throw new Error("Could not save the registration.");
  return appended;
}

export async function updateRegistration(registrationId: string, changes: Partial<RegistrationRow>) {
  const existing = await getRegistration(registrationId);
  if (!existing) throw new Error("Registration not found.");

  const nextRow = { ...existing.row, ...changes };
  const sheets = await ensureRegistrationSheet();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quotedSheetName}!A${existing.rowNumber}:${columnLetter(PROGRAM_REGISTRATION_HEADERS.length - 1)}${existing.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [PROGRAM_REGISTRATION_HEADERS.map((header) => nextRow[header])] },
  });

  return nextRow;
}
