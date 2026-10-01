import assert from "node:assert/strict";
import test from "node:test";

import { csvDocument } from "./csv.ts";

test("csvDocument adds an Excel-compatible BOM and escapes commas, quotes, and line breaks", () => {
  const document = csvDocument([
    ["Name", "Note", "Count"],
    ["Lee, Mei", 'Said "hello"\nagain', 2],
  ]);

  assert.equal(
    document,
    '\uFEFF"Name","Note","Count"\n"Lee, Mei","Said ""hello""\nagain","2"',
  );
});
