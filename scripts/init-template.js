#!/usr/bin/env node

/**
 * Init script for repos created from the template.
 * Usage:
 *   npm run init-template <new-package-name>
 */

const fs = require("node:fs");
const path = require("node:path");

// ----- 1. Read parameter -----
const newName = process.argv[2];

if (!newName) {
  console.error(`
❌ ERROR: Missing package name.

Usage:
  npm run init-template <new-package-name>

Example:
  npm run init-template my-awesome-lib

`);
  process.exit(1);
}

console.log(`🔧 Initializing template with package name: ${newName}`);

const PLACEHOLDER_NAME = "uns_typescript-lib-template";

// ----- 2. Update package.json -----
const pkgPath = path.join(process.cwd(), "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error("❌ package.json not found. Are you running in the project root?");
  process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkgJson.name = newName;

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n", "utf8");
console.log(`✅ Updated package.json name → "${newName}"`);

// ----- 3. Update README.md -----
const readmePath = path.join(process.cwd(), "README.md");

if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, "utf8");
  let modified = readme;

  // Replace install lines
  modified = modified.replace(new RegExp(`npm i ${PLACEHOLDER_NAME}`, "g"), `npm i ${newName}`);

  // Replace import lines
  modified = modified.replace(new RegExp(`from "${PLACEHOLDER_NAME}"`, "g"), `from "${newName}"`);

  // Replace npm badges
  modified = modified.replace(
    new RegExp(`img.shields.io/npm/v/${PLACEHOLDER_NAME}`, "g"),
    `img.shields.io/npm/v/${newName}`,
  );

  modified = modified.replace(
    new RegExp(`img.shields.io/npm/dm/${PLACEHOLDER_NAME}`, "g"),
    `img.shields.io/npm/dm/${newName}`,
  );

  if (modified !== readme) {
    fs.writeFileSync(readmePath, modified, "utf8");
    console.log("✅ Updated README.md with new package name");
  } else {
    console.log("ℹ README.md contained no placeholder references.");
  }
}

console.log("\n✨ Template initialization complete!\n");
