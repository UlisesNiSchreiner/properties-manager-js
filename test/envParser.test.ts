// test/envParser.test.ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { parseEnvFile, buildEnvFilename, resolveEnvPath } from "../src/envParser";

describe("envParser", () => {
  it("returns empty object for non-existing file", () => {
    const result = parseEnvFile("/path/that/does/not/exist/.env");
    expect(result).toEqual({});
  });

  it("parses basic .env content with comments and quotes", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envparser-"));
    const envPath = path.join(tmpDir, ".env.test");

    const content = `
# comment
FOO=bar
SPACED = value with spaces
QUOTED="quoted value"
SINGLE='single quoted'
EMPTY=
NO_EQUALS
`;

    fs.writeFileSync(envPath, content, "utf8");

    const result = parseEnvFile(envPath);

    expect(result.FOO).toBe("bar");
    expect(result.SPACED).toBe("value with spaces");
    expect(result.QUOTED).toBe("quoted value");
    expect(result.SINGLE).toBe("single quoted");
    // Línea sin "=" debe ser ignorada
    expect(result).not.toHaveProperty("NO_EQUALS");
    // Clave con valor vacío -> string vacío
    expect(result.EMPTY).toBe("");
  });

  it("buildEnvFilename builds correct filenames", () => {
    expect(buildEnvFilename()).toBe(".env");
    expect(buildEnvFilename("dev")).toBe(".env.dev");
    expect(buildEnvFilename("prod")).toBe(".env.prod");
  });

  it("buildEnvFilename throws on invalid scope", () => {
    expect(() => buildEnvFilename("../evil")).toThrow(Error);
    expect(() => buildEnvFilename("dev/../prod")).toThrow(Error);
  });

  it("resolveEnvPath joins configDir with env filename", () => {
    const configDir = "/my/config";
    const p1 = resolveEnvPath(configDir, undefined);
    const p2 = resolveEnvPath(configDir, "dev");

    expect(p1.endsWith(path.join("my", "config", ".env"))).toBe(true);
    expect(p2.endsWith(path.join("my", "config", ".env.dev"))).toBe(true);
  });
});
