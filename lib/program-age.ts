export function isProgramParticipantMinor(dateOfBirth: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return true;

  const birthYear = Number(dateOfBirth.slice(0, 4));
  return today.getUTCFullYear() - birthYear < 18;
}
