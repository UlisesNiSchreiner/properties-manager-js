// test/configManager.test.ts
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { ConfigManager } from "../src/configManager";

let tmpDir: string;
let config: ConfigManager;

describe("ConfigManager", () => {
  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-manager-"));

    // .env root
    fs.writeFileSync(
      path.join(tmpDir, ".env"),
      [
        "APP_NAME=MyApp",
        "PORT=3000",
        "FEATURE_ROOT=true",
        "INVALID_NUMBER=not-a-number",
        "INVALID_BOOL=maybe",
        'APP_CONFIG={"root":true,"env":"root"}',
      ].join("\n"),
      "utf8",
    );

    // .env.dev
    fs.writeFileSync(
      path.join(tmpDir, ".env.dev"),
      ["PORT=4000", "FEATURE_DEV=true", 'APP_CONFIG={"root":false,"env":"dev"}'].join("\n"),
      "utf8",
    );

    // .env.prod
    fs.writeFileSync(
      path.join(tmpDir, ".env.prod"),
      ["PORT=5000", "FEATURE_DEV=false"].join("\n"),
      "utf8",
    );

    // Inicializamos el singleton UNA sola vez
    ConfigManager.initialize({
      configDir: tmpDir,
      defaultScope: "dev",
      envPrefix: "PM_",
      strict: true,
    });

    config = ConfigManager.getInstance();
  });

  beforeEach(() => {
    // Limpiamos cache interno (por las pruebas que modifican archivos o env)
    config.clearCache();

    // Limpiamos posibles overrides en process.env
    delete process.env.PORT;
    delete process.env.PM_PORT;
  });

  it("returns string values from .env root", () => {
    const appName = config.getString("APP_NAME");
    expect(appName).toBe("MyApp");
  });

  it("uses defaultScope for values when scope is not specified", () => {
    // defaultScope = "dev", y en .env.dev PORT=4000
    const port = config.getNumber("PORT");
    expect(port).toBe(4000);
  });

  it("falls back to root .env when key is not present in scoped files", () => {
    // FEATURE_ROOT sólo existe en .env root
    const flag = config.getBoolean("FEATURE_ROOT");
    expect(flag).toBe(true);
  });

  it("can read from a specific scope", () => {
    const portProd = config.getNumber("PORT", { scope: "prod" });
    expect(portProd).toBe(5000);
  });

  it("uses process.env without prefix before files", () => {
    process.env.PORT = "9000";
    const port = config.getNumber("PORT");
    expect(port).toBe(9000);
  });

  it("uses process.env with prefix before unprefixed env", () => {
    process.env.PORT = "9000";
    process.env.PM_PORT = "7000"; // envPrefix = "PM_"
    const port = config.getNumber("PORT");
    expect(port).toBe(7000);
  });

  it("returns default for missing keys when default is provided", () => {
    const val = config.getString("NON_EXISTENT_KEY", {
      default: "fallback",
    });
    expect(val).toBe("fallback");
  });

  it("throws on missing keys when strict is true and no default is provided", () => {
    expect(() => config.getString("NON_EXISTENT_KEY")).toThrow(/not found/);
  });

  it("throws TypeError for invalid number when no default is provided", () => {
    expect(() => config.getNumber("INVALID_NUMBER")).toThrow(TypeError);
  });

  it("returns default when number is invalid but default is provided", () => {
    const n = config.getNumber("INVALID_NUMBER", { default: 42 });
    expect(n).toBe(42);
  });

  it("throws TypeError for invalid boolean when no default is provided", () => {
    expect(() => config.getBoolean("INVALID_BOOL")).toThrow(TypeError);
  });

  it("returns default when boolean is invalid but default is provided", () => {
    const b = config.getBoolean("INVALID_BOOL", { default: false });
    expect(b).toBe(false);
  });

  it("parses JSON correctly with getJson", () => {
    const cfg = config.getJson<{ root: boolean; env: string }>("APP_CONFIG");
    expect(cfg).toEqual({ root: false, env: "dev" }); // viene de .env.dev
  });

  it("returns default when JSON is invalid and default is provided", () => {
    // modificamos temporalmente el archivo para meter un JSON inválido
    const envDevPath = path.join(tmpDir, ".env.dev");
    const original = fs.readFileSync(envDevPath, "utf8");

    try {
      fs.writeFileSync(
        envDevPath,
        original.replace('APP_CONFIG={"root":false,"env":"dev"}', "APP_CONFIG=invalid-json"),
        "utf8",
      );

      config.clearCache();

      const fallback = { root: true, env: "fallback" as const };
      const cfg = config.getJson("APP_CONFIG", { default: fallback });
      expect(cfg).toEqual(fallback);
    } finally {
      // Restauramos el archivo
      fs.writeFileSync(envDevPath, original, "utf8");
      config.clearCache();
    }
  });
});
