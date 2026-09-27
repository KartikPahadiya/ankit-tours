// Parse every source file with the SAME parser Vite uses (@babel/parser).
// Usage: node parse-check.cjs [file1 file2 ...]  (defaults to walking src/)
const parser = require("@babel/parser");
const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(p));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) results.push(p);
  }
  return results;
}

const files =
  process.argv.length > 2 ? process.argv.slice(2) : walk(path.join(__dirname, "src"));

let failed = 0;
for (const f of files) {
  try {
    parser.parse(fs.readFileSync(f, "utf8"), {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    console.log("OK   : " + f);
  } catch (e) {
    failed++;
    console.log("FAIL : " + f);
    console.log("       " + e.message);
  }
}
console.log(failed ? "\n" + failed + " file(s) FAILED" : "\nALL FILES PARSE OK");
process.exitCode = failed ? 1 : 0;
