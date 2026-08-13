import { isProgramParticipantMinor } from "@/lib/program-age";

export const PROGRAM_REGISTRATION_SHEET_NAME = "Registrations";

export const PROGRAM_REGISTRATION_HEADERS = [
  "Registration ID",
  "Created at",
  "Full name",
  "Date of birth",
  "IC number",
  "Gender",
  "Citizenship",
  "Email",
  "WhatsApp number",
  "Current address",
  "Allergies",
  "About you",
  "Following Jesus",
  "Relationship with God",
  "Why join",
  "Hopes for program",
  "Additional information",
  "Mental health acknowledgement",
  "Parent / guardian name",
  "Parent / guardian phone",
  "Parent / guardian address",
  "Emergency contact name",
  "Emergency contact phone",
  "Signature date",
  "Waiver accepted",
  "Signature",
  "Payment plan",
  "Payment status",
  "Stripe Checkout Session ID",
  "Stripe Payment Intent ID",
  "Stripe Subscription ID",
  "Stripe Invoice IDs",
  "Installments paid",
  "Last payment date",
  "Last payment failure",
] as const;

export type PaymentOption = "full" | "installments";
export type RegistrationRow = Record<(typeof PROGRAM_REGISTRATION_HEADERS)[number], string>;

export type ProgramRegistration = {
  registrationId: string;
  paymentOption: PaymentOption;
  fullName: string;
  dateOfBirth: string;
  icNumber: string;
  gender: string;
  citizenship: string;
  email: string;
  whatsAppNumber: string;
  currentAddress: string;
  allergies: string;
  aboutYou: string;
  followingJesus: string;
  relationshipWithGod: string;
  whyJoin: string;
  hopesForProgram: string;
  additionalInformation: string;
  guardianName: string;
  guardianPhone: string;
  guardianAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  signatureDate: string;
  signature: string;
};

const requiredFields = [
  "fullName",
  "dateOfBirth",
  "icNumber",
  "gender",
  "citizenship",
  "email",
  "whatsAppNumber",
  "currentAddress",
  "aboutYou",
  "followingJesus",
  "relationshipWithGod",
  "whyJoin",
  "hopesForProgram",
  "signature",
] as const;

function getString(fields: Record<string, unknown>, name: string) {
  const value = fields[name];
  return typeof value === "string" ? value.trim() : "";
}

export function parseProgramRegistration(payload: unknown): ProgramRegistration {
  if (!payload || typeof payload !== "object") throw new Error("Invalid registration.");

  const { registrationId, paymentOption, fields } = payload as {
    registrationId?: unknown;
    paymentOption?: unknown;
    fields?: unknown;
  };

  if (typeof registrationId !== "string" || !/^[0-9a-f-]{36}$/i.test(registrationId)) {
    throw new Error("Invalid registration ID.");
  }
  if (paymentOption !== "full" && paymentOption !== "installments") {
    throw new Error("Choose a payment option.");
  }
  if (!fields || typeof fields !== "object") throw new Error("Invalid registration details.");

  const formFields = fields as Record<string, unknown>;
  for (const field of requiredFields) {
    if (!getString(formFields, field)) throw new Error("Please complete all required fields.");
  }
  if (!/^\S+@\S+\.\S+$/.test(getString(formFields, "email"))) {
    throw new Error("Enter a valid email address.");
  }
  if (getString(formFields, "mentalHealthAcknowledgement") !== "on") {
    throw new Error("Please acknowledge the mental-health support notice.");
  }
  if (getString(formFields, "waiverUnderstood") !== "on") {
    throw new Error("Please accept the waiver.");
  }

  const participantIsMinor = isProgramParticipantMinor(getString(formFields, "dateOfBirth"));
  const guardianFields = ["guardianName", "guardianPhone", "guardianAddress"];
  const emergencyFields = ["emergencyContactName", "emergencyContactPhone"];
  const contactFields = participantIsMinor ? guardianFields : emergencyFields;
  if (contactFields.some((field) => !getString(formFields, field))) {
    throw new Error("Please complete the required contact information.");
  }

  return {
    registrationId,
    paymentOption,
    fullName: getString(formFields, "fullName"),
    dateOfBirth: getString(formFields, "dateOfBirth"),
    icNumber: getString(formFields, "icNumber"),
    gender: getString(formFields, "gender"),
    citizenship: getString(formFields, "citizenship"),
    email: getString(formFields, "email"),
    whatsAppNumber: getString(formFields, "whatsAppNumber"),
    currentAddress: getString(formFields, "currentAddress"),
    allergies: getString(formFields, "allergies"),
    aboutYou: getString(formFields, "aboutYou"),
    followingJesus: getString(formFields, "followingJesus"),
    relationshipWithGod: getString(formFields, "relationshipWithGod"),
    whyJoin: getString(formFields, "whyJoin"),
    hopesForProgram: getString(formFields, "hopesForProgram"),
    additionalInformation: getString(formFields, "additionalInformation"),
    guardianName: getString(formFields, "guardianName"),
    guardianPhone: getString(formFields, "guardianPhone"),
    guardianAddress: getString(formFields, "guardianAddress"),
    emergencyContactName: getString(formFields, "emergencyContactName"),
    emergencyContactPhone: getString(formFields, "emergencyContactPhone"),
    signatureDate: getString(formFields, participantIsMinor ? "guardianSignatureDate" : "participantSignatureDate"),
    signature: getString(formFields, "signature"),
  };
}

export function registrationToRow(registration: ProgramRegistration): RegistrationRow {
  return {
    "Registration ID": registration.registrationId,
    "Created at": new Date().toISOString(),
    "Full name": registration.fullName,
    "Date of birth": registration.dateOfBirth,
    "IC number": registration.icNumber,
    Gender: registration.gender,
    Citizenship: registration.citizenship,
    Email: registration.email,
    "WhatsApp number": registration.whatsAppNumber,
    "Current address": registration.currentAddress,
    Allergies: registration.allergies,
    "About you": registration.aboutYou,
    "Following Jesus": registration.followingJesus,
    "Relationship with God": registration.relationshipWithGod,
    "Why join": registration.whyJoin,
    "Hopes for program": registration.hopesForProgram,
    "Additional information": registration.additionalInformation,
    "Mental health acknowledgement": "Accepted",
    "Parent / guardian name": registration.guardianName,
    "Parent / guardian phone": registration.guardianPhone,
    "Parent / guardian address": registration.guardianAddress,
    "Emergency contact name": registration.emergencyContactName,
    "Emergency contact phone": registration.emergencyContactPhone,
    "Signature date": registration.signatureDate,
    "Waiver accepted": "Accepted",
    Signature: registration.signature,
    "Payment plan": registration.paymentOption === "full" ? "RM699 once" : "RM233 × 3 monthly",
    "Payment status": "Pending payment",
    "Stripe Checkout Session ID": "",
    "Stripe Payment Intent ID": "",
    "Stripe Subscription ID": "",
    "Stripe Invoice IDs": "",
    "Installments paid": registration.paymentOption === "full" ? "Not applicable" : "0/3",
    "Last payment date": "",
    "Last payment failure": "",
  };
}
