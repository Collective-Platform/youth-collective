export function csvCell(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function csvDocument(rows: Array<Array<string | number | null>>) {
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`;
}
