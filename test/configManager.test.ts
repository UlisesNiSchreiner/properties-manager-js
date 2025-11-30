import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { ConfigManager } from "../src/configManager";

let tmpRootDir: string;
let configDir: string;
let manager: ConfigManager;

const ORIGINAL_ENV = { ...process.env };

describe("ConfigManager", () => {
  beforeAll(() => {
    // Creamos un directorio temporal con subcarpeta config/
    tmpRootDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-manager-"));
    configDir = path.join(tmpRootDir, "config");
    fs.mkdirSync(configDir, { recursive: true });

    // config.dev (scope por defecto)
    fs.writeFileSync(
      path.join(configDir, "config.dev"),
      [
        "APP_NAME=MyDevApp",
        "PORT=3000",
        "FEATURE_DEV=true",
        "INVALID_NUMBER=not-a-number",
        "INVALID_BOOL=maybe",
        'APP_CONFIG={"env":"dev","debug":true}',
      ].join("\n"),
      "utf8",
    );

    // config.qa
    fs.writeFileSync(
      path.join(configDir, "config.qa"),
      ["PORT=4000", "FEATURE_QA=true", 'APP_CONFIG={"env":"qa","debug":false}'].join("\n"),
      "utf8",
    );

    // config.prod
    fs.writeFileSync(
      path.join(configDir, "config.prod"),
      ["PORT=5000", "FEATURE_QA=false"].join("\n"),
      "utf8",
    );

    // Inicializamos el singleton con nuestro configDir
    ConfigManager.initialize({
      configDir,
      defaultScope: "dev",
      envPrefix: "PM_",
      scopeEnvVarName: "SCOPE",
      strict: true,
    });

    manager = ConfigManager.getInstance();
  });

  beforeEach(() => {
    // Limpia cache entre tests
    manager.clearCache();

    // Resetea override de scope
    manager.load(undefined);

    // Reset env
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SCOPE;
    delete process.env.PORT;
    delete process.env.PM_PORT;
  });

  afterAll(() => {
    // Restaurar env original
    process.env = ORIGINAL_ENV;
  });

  it("uses defaultScope ('dev') when no SCOPE env and no load or explicit scope", () => {
    const port = manager.getNumber("PORT");
    expect(port).toBe(3000);

    const name = manager.getString("APP_NAME");
    expect(name).toBe("MyDevApp");
  });

  it("uses SCOPE env to resolve config.<scope>", () => {
    process.env.SCOPE = "qa";
    const port = manager.getNumber("PORT");
    expect(port).toBe(4000);

    const qaFlag = manager.getBoolean("FEATURE_QA", { default: false });
    expect(qaFlag).toBe(true);
  });

  it("load(scope) overrides SCOPE env and defaultScope", () => {
    process.env.SCOPE = "qa";
    manager.load("prod");

    const port = manager.getNumber("PORT");
    expect(port).toBe(5000);

    // FEATURE_QA en prod es false
    const qaFlag = manager.getBoolean("FEATURE_QA", { default: true });
    expect(qaFlag).toBe(false);
  });

  it("load() without args clears override and goes back to env/default resolution", () => {
    process.env.SCOPE = "qa";
    manager.load("prod");

    expect(manager.getNumber("PORT")).toBe(5000);

    // limpiar override
    manager.load();

    // ahora vuelve a usar SCOPE=qa → 4000
    const port = manager.getNumber("PORT");
    expect(port).toBe(4000);
  });

  it("explicit options.scope overrides everything else per call", () => {
    process.env.SCOPE = "qa";
    manager.load("prod");

    // Usa dev aunque SCOPE=qa y override=prod
    const portDev = manager.getNumber("PORT", { scope: "dev" });
    expect(portDev).toBe(3000);
  });

  it("uses envPrefix first, then process.env without prefix, then config files", () => {
    process.env.SCOPE = "dev";
    process.env.PM_PORT = "9000";
    process.env.PORT = "8000";

    const port = manager.getNumber("PORT");
    expect(port).toBe(9000);
  });

  it("uses process.env without prefix before config files when no prefixed var", () => {
    process.env.SCOPE = "dev";
    delete process.env.PM_PORT;
    process.env.PORT = "7000";

    const port = manager.getNumber("PORT");
    expect(port).toBe(7000);
  });

  it("getBoolean parses boolean values correctly", () => {
    process.env.SCOPE = "dev";

    const featureDev = manager.getBoolean("FEATURE_DEV");
    expect(featureDev).toBe(true);

    // override via env
    process.env.FEATURE_DEV = "false";
    const featureDevEnv = manager.getBoolean("FEATURE_DEV");
    expect(featureDevEnv).toBe(false);
  });

  it("getJson parses JSON from config for current scope", () => {
    process.env.SCOPE = "qa";

    type AppConfig = { env: string; debug: boolean };

    const cfg = manager.getJson<AppConfig>("APP_CONFIG");
    expect(cfg).toEqual({ env: "qa", debug: false });
  });

  it("returns default when key is missing and default is provided", () => {
    const val = manager.getString("NON_EXISTENT_KEY", {
      default: "fallback",
    });
    expect(val).toBe("fallback");
  });

  it("throws when key is missing, strict=true and no default is provided", () => {
    expect(() => manager.getString("NON_EXISTENT_KEY")).toThrow(/not found/);
  });

  it("throws TypeError for invalid number when no default is provided", () => {
    process.env.SCOPE = "dev"; // INVALID_NUMBER definido en config.dev
    expect(() => manager.getNumber("INVALID_NUMBER")).toThrow(TypeError);
  });

  it("returns default when number is invalid but default is provided", () => {
    process.env.SCOPE = "dev";
    const n = manager.getNumber("INVALID_NUMBER", { default: 42 });
    expect(n).toBe(42);
  });

  it("throws TypeError for invalid boolean when no default is provided", () => {
    process.env.SCOPE = "dev";
    expect(() => manager.getBoolean("INVALID_BOOL")).toThrow(TypeError);
  });

  it("returns default when boolean is invalid but default is provided", () => {
    process.env.SCOPE = "dev";
    const b = manager.getBoolean("INVALID_BOOL", { default: false });
    expect(b).toBe(false);
  });

  it("returns default when JSON is invalid and default is provided", () => {
    // Hacemos el JSON inválido en config.qa
    const qaPath = path.join(configDir, "config.qa");
    const original = fs.readFileSync(qaPath, "utf8");

    try {
      const mutated = original.replace(
        'APP_CONFIG={"env":"qa","debug":false}',
        "APP_CONFIG=invalid-json",
      );
      fs.writeFileSync(qaPath, mutated, "utf8");

      manager.clearCache();
      process.env.SCOPE = "qa";

      const fallback = { env: "fallback", debug: false as const };
      const cfg = manager.getJson("APP_CONFIG", { default: fallback });
      expect(cfg).toEqual(fallback);
    } finally {
      fs.writeFileSync(qaPath, original, "utf8");
      manager.clearCache();
    }
  });
});
