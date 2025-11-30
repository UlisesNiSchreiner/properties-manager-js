import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Parse a .env-style file:
 *  - KEY=VALUE per line
 *  - ignores empty lines and comments (#)
 *  - supports quoted values ("value" or 'value')
 */
export function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const result: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const valueRaw = line.slice(idx + 1).trim();

    if (!key) continue;

    const value =
      (valueRaw.startsWith('"') && valueRaw.endsWith('"')) ||
      (valueRaw.startsWith("'") && valueRaw.endsWith("'"))
        ? valueRaw.slice(1, -1)
        : valueRaw;

    result[key] = value;
  }

  return result;
}

/**
 * Build config filename for a given scope:
 *  - undefined → "config.dev"
 *  - "qa"      → "config.qa"
 */
export function buildEnvFilename(scope?: string): string {
  const effectiveScope = scope ?? "dev";

  // Basic sanitization, avoid path traversal and weird chars
  if (!/^[a-zA-Z0-9._-]+$/.test(effectiveScope)) {
    throw new Error(`Invalid scope name: "${effectiveScope}"`);
  }

  return `config.${effectiveScope}`;
}

/**
 * Resolve absolute path to config file for a given scope.
 *
 * Example:
 *  configDir = /app/config
 *  scope = "qa" → /app/config/config.qa
 */
export function resolveEnvPath(configDir: string, scope?: string): string {
  const filename = buildEnvFilename(scope);
  return path.resolve(configDir, filename);
}
