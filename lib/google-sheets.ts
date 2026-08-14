import { google } from "googleapis";
import {
  PROGRAM_REGISTRATION_HEADERS,
  PROGRAM_REGISTRATION_SHEET_NAME,
  type RegistrationRow,
} from "./program-registration";

const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const quotedSheetName = `'${PROGRAM_REGISTRATION_SHEET_NAME.replaceAll("'", "''")}'`;

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
  } else if (
    currentHeaders.length !== PROGRAM_REGISTRATION_HEADERS.length ||
    currentHeaders.some((header, index) => header !== PROGRAM_REGISTRATION_HEADERS[index])
  ) {
    throw new Error(`The ${PROGRAM_REGISTRATION_SHEET_NAME} sheet has unexpected column headings.`);
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
  const range = `${quotedSheetName}!A2:AI`;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = result.data.values ?? [];
  const index = rows.findIndex((row) => row[0] === registrationId);
  if (index === -1) return null;

  return { rowNumber: index + 2, row: rowFromValues(rows[index]) };
}

export async function appendRegistration(row: RegistrationRow) {
  const existing = await getRegistration(row["Registration ID"]);
  if (existing) return existing;

  const sheets = await ensureRegistrationSheet();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quotedSheetName}!A:AI`,
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
    range: `${quotedSheetName}!A${existing.rowNumber}:AI${existing.rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [PROGRAM_REGISTRATION_HEADERS.map((header) => nextRow[header])] },
  });

  return nextRow;
}
