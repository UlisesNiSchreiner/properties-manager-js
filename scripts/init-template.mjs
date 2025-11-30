import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updatePackageJson(newName) {
  const packagePath = path.resolve(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  pkg.name = newName;
  pkg.version = "1.0.0"; // reset version
  pkg.description = `${newName} - auto-generated from template`;

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  console.log(`✔ package.json updated → name: ${newName}`);
}

function updateReadme(newName) {
  const readmePath = path.resolve(__dirname, "..", "README.md");

  if (!fs.existsSync(readmePath)) return;

  let content = fs.readFileSync(readmePath, "utf8");
  content = content.replace(/uns-typescript-lib-template/g, newName);
  content = content.replace(/typescript-lib-template/g, newName);

  fs.writeFileSync(readmePath, content);
  console.log("✔ README.md updated");
}

function main() {
  const newName = process.argv[2];

  if (!newName) {
    console.error("❌ Missing package name. Run:");
    console.error("   npm run init-template <new-name>");
    process.exit(1);
  }

  console.log(`🔧 Initializing template for: ${newName}`);

  updatePackageJson(newName);
  updateReadme(newName);

  console.log("🚀 Template initialized successfully!");
}

main();
