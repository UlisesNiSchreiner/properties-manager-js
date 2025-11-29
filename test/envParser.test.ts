import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { parseEnvFile, buildEnvFilename, resolveEnvPath } from "../src/envParser";

describe("envParser", () => {
  it("returns empty object when file does not exist", () => {
    const result = parseEnvFile("/path/that/does/not/exist/config.dev");
    expect(result).toEqual({});
  });

  it("parses config file with comments, empty lines and quotes", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envparser-"));
    const filePath = path.join(tmpDir, "config.dev");

    const content = `
# comment
FOO=bar
SPACED = value with spaces
QUOTED="quoted value"
SINGLE='single quoted'
EMPTY=
NO_EQUALS
`;

    fs.writeFileSync(filePath, content, "utf8");

    const result = parseEnvFile(filePath);

    expect(result.FOO).toBe("bar");
    expect(result.SPACED).toBe("value with spaces");
    expect(result.QUOTED).toBe("quoted value");
    expect(result.SINGLE).toBe("single quoted");
    expect(result.EMPTY).toBe("");
    expect(result).not.toHaveProperty("NO_EQUALS");
  });

  it("buildEnvFilename builds correct filenames", () => {
    expect(buildEnvFilename()).toBe("config.dev");
    expect(buildEnvFilename("qa")).toBe("config.qa");
    expect(buildEnvFilename("prod")).toBe("config.prod");
  });

  it("buildEnvFilename throws on invalid scope", () => {
    expect(() => buildEnvFilename("../evil")).toThrow(Error);
    expect(() => buildEnvFilename("dev/../prod")).toThrow(Error);
    expect(() => buildEnvFilename("dev;rm -rf")).toThrow(Error);
  });

  it("resolveEnvPath returns a path inside configDir", () => {
    const configDir = "/my/app/config";
    const p1 = resolveEnvPath(configDir, undefined);
    const p2 = resolveEnvPath(configDir, "qa");

    expect(p1.endsWith(path.join("my", "app", "config", "config.dev"))).toBe(true);
    expect(p2.endsWith(path.join("my", "app", "config", "config.qa"))).toBe(true);
  });
});
