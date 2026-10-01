export const SESSION_TIME_ZONE = "Asia/Kuala_Lumpur";

const KUALA_LUMPUR_UTC_OFFSET = "+08:00";
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

export function parseSessionDateTime(value: string) {
  if (!localDateTimePattern.test(value)) return new Date(Number.NaN);
  return new Date(`${value}${KUALA_LUMPUR_UTC_OFFSET}`);
}

export function formatSessionDateTimeInput(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SESSION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
